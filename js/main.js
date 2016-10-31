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
		direction: undefined,
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
			this.mouse.prev.y = this.mouse.pos.x;
			this.mouse.prev.y = this.mouse.pos.y;
			this.mouse.pos.x = e.clientX;
			this.mouse.pos.y = e.clientY;

			this.mouse.dX = (this.mouse.X - this.mouse.prev.x);
			this.mouse.dY = (this.mouse.Y - this.mouse.prev.y);

			this.mouse.direction = new vector(0,0);
			/*if( this.mouse.prev.x - this.mouse.pos.x > 0) this.mouse.direction.x = -1;
			if( this.mouse.prev.y - this.mouse.pos.y > 0) this.mouse.direction.y = -1;
			if( this.mouse.prev.y - this.mouse.pos.y < 0) this.mouse.direction.x = 1;
			if( this.mouse.prev.y - this.mouse.pos.y < 0) this.mouse.direction.y = 1;*/
		}.bind(this));

		//Updates mouse clickX and clickY
		document.addEventListener('click', function(e){
			this.mouse.clickX = this.mouse.pos.x;
			this.mouse.clickY = this.mouse.pos.y;
		}.bind(this));

		//Make player
		this.player = new light(this.mouse.pos, this.CONSTANTS.LIGHT_LENGTH, 'yellow');

		window.setInterval(function(){this.time.elapsed += 0.02;}.bind(this), 10);

		resizeCanvas();
	},

	update : function(){
		if(this.paused) return;

		this.animationID = window.requestAnimationFrame(this.update.bind(this));

		this.clearCanvas();
		this.drawBG(this.ctx);
		this.updateLights(this.ctx);

		if(this.time.elapsed > 10 && this.lights.length < 1) this.makeEnemy();
	},

	makeEnemy : function(){
		this.numLights++;

		var enemy = new light(new vector(-2000,-2000), 15, 'red');
		this.lights.push(enemy);

		console.log("enemy made");
	},

	clearCanvas : function(){
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
	},

	updateLights : function(ctx){
		ctx.lineWidth = 3;
		for(var i=0; i<this.lights.length; i++){
			this.updateLight(ctx, this.lights[i], this.player.tail.pos);
		}
		this.updateLight(ctx, this.player, this.mouse.pos);
	},

	updateLight : function(ctx, light, pos){
		var currentNode = light.head;
		light.head.pos = pos;
		currentNode = light.head.next;
		for(var i=1; i<light.length; i++){
			if(currentNode.prev && light == this.player) this.nodeSeek(currentNode, currentNode.prev, 1);
			else if(currentNode.prev) this.nodeArrive(currentNode, currentNode.prev, 1);
			ctx.save();
			ctx.globalAlpha = light.length/(i+1) - 1;
			this.drawNode(ctx, currentNode, light.color);
			ctx.restore();
			currentNode = currentNode.next;
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

	nodeSeek : function(n1, n2, weight){
		this.nodeMove(n1, n2.pos, 0.1 * weight);
	},

	nodeArrive : function(n1, n2, weight){
		var goal = n2;
		var dist = distance(n1.pos, n2.pos)/2000;
		//if(dist < 0.05) goal.pos = addVectors(goal.pos, this.mouse.direction);
		if(dist < 0.01) dist = 0;
		this.nodeMove(n1, goal.pos, dist * weight);
	},

};