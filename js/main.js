"use strict";

var app = app || {};

app.main = {
	canvas: undefined,
	ctx: undefined,
	buffer: undefined,
	bctx: undefined,
	CONSTANTS: Object.freeze({
		MAX_LIGHTS: 10,
		LIGHT_LENGTH: 8,
	}),
	mouse: {
		pos: null,
		prev: null,
		clickX: 0,
		clickY: 0,
		dx: 0,
		radius: 30,
		node: undefined,
	},
	player: undefined,
	lights: [],
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
		this.mouse.pos = new vector(0,0);
		this.mouse.prev = new vector(0,0);

		/* Event Handlers */

		//resizes on window resize
		document.addEventListener('resize', resizeCanvas);

		//Updates mouse position
		document.addEventListener('mousemove', function(e){
			this.mouse.prev.y = this.mouse.X;
			this.mouse.prev.y = app.main.mouse.Y;
			this.mouse.pos.x = e.clientX;
			this.mouse.pos.y = e.clientY;

			this.mouse.dX = (this.mouse.X - this.mouse.prevX);
			this.mouse.dY = (this.mouse.Y - this.mouse.prevY);
		}.bind(this));

		//Updates mouse clickX and clickY
		document.addEventListener('click', function(e){
			this.mouse.clickX = this.mouse.pos.x;
			this.mouse.clickY = this.mouse.pos.y;
		}.bind(this));

		//Make enemy lights
		while(this.numLights < this.CONSTANTS.MAX_LIGHTS){
			this.numLights++;
			var nLight = new light(new vector(-10,-10), parseInt(Math.random()*5) + 1);
			this.lights.push(nLight);
		}

		this.player = new light(this.mouse.pos, this.CONSTANTS.LIGHT_LENGTH);

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

	updateLights : function(ctx){
		ctx.lineWidth = 3;
		for(var i=0; i<this.numLights; i++){
			//if(this.player.length < 1) this.updateLight(ctx, this.lights[i], this.player.tail.pos);
			if( distance(this.lights[i].head.pos, this.player.tail.pos) < 5 ){
				//this.shortenLight(this.player);
			}
		}
		this.updateLight(ctx, this.player, this.mouse.pos);
	},

	updateLight : function(ctx, light, pos){
		var currentNode = light.head;
		light.head.pos = pos;
		currentNode = light.head.next;
		for(var i=1; i<light.length; i++){
			if(currentNode.prev) this.nodeArrive(currentNode, currentNode.prev);
			ctx.save();
			ctx.globalAlpha = light.length/(i+1) - 1;
			if(this.light != this.player) this.drawNode(ctx, currentNode, 'red');
			else this.drawNode(ctx, currentNode, 'yellow');
			ctx.restore();
			currentNode = currentNode.next;
		}
	},

	shortenLight : function(light){
		if(light.length > 2){
			light.length--;
			light.tail = light.tail.prev;
			light.tail.next = null;
		}
	},

	drawNode : function(ctx, node, color){
		ctx.save();
		//var color = perlinColor(this.perlin, this.time.elapsed+node.seed);
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.arc(node.pos.x, node.pos.y, node.seed, 0, Math.PI*2);
		ctx.stroke();
		if(node.next) {
			ctx.beginPath();
			ctx.moveTo(node.pos.x, node.pos.y);
			ctx.lineTo(node.next.pos.x, node.next.pos.y);
			//ctx.stroke();
			ctx.closePath();
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
		var dist = distance(n1.pos, n2.pos)/2000;
		this.nodeMove(n1, n2.pos, dist);
	}

};