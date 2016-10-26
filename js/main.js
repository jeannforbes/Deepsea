"use strict";

var app = app || {};

app.main = {
	canvas: undefined,
	ctx: undefined,
	buffer: undefined,
	bctx: undefined,
	CONSTANTS: Object.freeze({
		MAX_LIGHTS: 10,
		LIGHT_LENGTH: 5,
	}),
	mouse: {
		X: 0,
		Y: 0,
		clickX: 0,
		clickY: 0,
		prevX: 0,
		prevY: 0,
		dx: 0,
		radius: 30,
		node: undefined,
	},
	lights: [],
	fishies: [],
	numLights: 0,
	lightColors: ['orange', 'yellow', 'white'],
	paused : false,
	perlin : undefined,
	date : undefined,
	time : {
		elapsed: 0,
		deltaTime: 0,
	},
	bgColors : ['#03070A','#15211D','#1B393B','#2F4E50','#71A692'],
	animationID: undefined,

	init : function(){
		this.canvas = document.querySelector('#canvas');
		this.ctx = this.canvas.getContext("2d");
		this.perlin = new Perlin('random seed');
		this.date = new Date();

		this.fishies.push(new fish(new vector(100,100), 100, 'red'));

		//create lights
		for(var i=0; i<this.numLights; i++){
			this.lights[i] = new light(new vector(0,0), 10, 
				this.lightColors[parseInt(Math.random()*this.lightColors.length)]);
		}

		/* Event Handlers */

		//resizes on window resize
		document.addEventListener('resize', resizeCanvas);

		//Updates mouse position
		document.addEventListener('mousemove', function(e){
			this.mouse.prevX = this.mouse.X;
			this.mouse.prevY = app.main.mouse.Y;
			this.mouse.X = e.clientX;
			this.mouse.Y = e.clientY;

			this.mouse.dX = (this.mouse.X - this.mouse.prevX);
			this.mouse.dY = (this.mouse.Y - this.mouse.prevY);
		}.bind(this));

		//Updates mouse clickX and clickY
		document.addEventListener('click', function(e){
			this.mouse.clickX = this.mouse.X;
			this.mouse.clickY = this.mouse.Y;
		}.bind(this));

		//Make a light when you click
		/*document.addEventListener('click', function(e){
			if(this.lights.length < this.CONSTANTS.MAX_LIGHTS){
				this.numLights++;
				var nLight = new light(new vector(this.mouse.X,this.mouse.Y), this.CONSTANTS.LIGHT_LENGTH, 
					this.lightColors[parseInt(Math.random()*this.lightColors.length)]);
				this.lights.push(nLight);

			}
		}.bind(this));*/

		this.numLights++;
				var nLight = new light(new vector(this.mouse.X,this.mouse.Y), this.CONSTANTS.LIGHT_LENGTH, 
					this.lightColors[parseInt(Math.random()*this.lightColors.length)]);
				this.lights.push(nLight);

		window.setInterval(function(){this.time.elapsed += 0.02;}.bind(this), 10);

		resizeCanvas();
	},

	update : function(){
		if(this.paused) return;

		this.animationID = window.requestAnimationFrame(this.update.bind(this));

		this.clearCanvas();
		this.drawBG(this.ctx);
		this.updateLights(this.ctx);
	},

	clearCanvas : function(){
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
	},

	drawFishies : function(ctx){
		for(var i=0; i<this.fishies.length; i++)
			drawFish(ctx, this.fishies[i]);
	},

	drawFish : function(ctx, fish){
		ctx.save();
		ctx.fillStyle = this.fish.color;
		ctx.fillRect(fish.pos.x, fish.pos.y, fish.size, fish.size);
		ctx.restore();
	},

	updateLights : function(ctx){
		ctx.lineWidth = 3;
		for(var i=0; i<this.numLights; i++){
			this.updateLight(ctx, this.lights[i], this.mouse.X, this.mouse.Y);
		}
	},

	updateLight : function(ctx, light, x,y){
		var currentNode = light.tip;
		light.tip.pos = new vector(x,y);
		for(var i=1; i<light.length; i++){
			if(currentNode.prev) this.nodeSeek(currentNode, currentNode.prev);
			ctx.save();
			ctx.globalAlpha = light.length/(i+1) - 1;
			this.drawNode(ctx, currentNode, "circle");
			ctx.restore();
			currentNode = currentNode.next;
		}
	},

	drawNode : function(ctx, node, style){
		ctx.save();
		ctx.fillStyle = node.color;
		ctx.strokeStyle = node.color;
		if(style == 'rect'){
			ctx.fillRect(node.pos.x-5, node.pos.y-5, 10, 10);
		} else if(style == 'circle'){
			ctx.beginPath();
			ctx.arc(node.pos.x, node.pos.y, 10, 10, 0, Math.PI*2);
			ctx.stroke();
		}
		if(node.prev && node.prev.prev) {
			ctx.beginPath();
			ctx.moveTo(node.prev.pos.x, node.prev.pos.y);
			ctx.lineTo(node.pos.x, node.pos.y);
			ctx.stroke();
		}
		ctx.restore();
	},

	drawBG : function(ctx){
		var h = this.canvas.height / this.bgColors.length;
		var w = this.canvas.width;
		for(var i=1;i<=this.bgColors.length;i++){
			ctx.save()
			ctx.globalAlpha = 0.7;
			ctx.fillStyle = this.bgColors[i-1];
			ctx.fillRect(0, this.canvas.height - h * i, 
						 w, h+(this.perlin.noise(this.time.elapsed,i,0)*50));
			ctx.restore();
		}
	},

	nodeMove : function(node, pos, accel){
		node.accel = subtractVectors(node.pos, pos);
		node.accel = multVector(node.accel, accel);
		node.accel = clampVector(node.accel, -node.maxAccel, node.maxAccel);
		node.vel = addVectors(node.vel, node.accel);
		node.vel = clampVector(node.vel, -node.maxVel, node.maxVel);
		node.pos = addVectors(node.pos, node.vel);
	},

	nodeSeek : function(n1, n2){
		this.nodeMove(n1, n2.pos, 0.1);
	},

	nodeArrive : function(n1, n2){
		var dist = distance(n1.pos, n2.pos);
		this.nodeMove(n1, n2.pos, 0.1);
	}

};