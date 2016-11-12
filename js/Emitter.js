// emitter.js
// author: Tony Jefferson
// last modified: 10/7/2015

"use strict";
var app = app || {};

app.Emitter=function(){

	function Emitter(){
		// public
		this.numParticles = 50;
		this.useCircles = true;
		this.useSquares = false;
		this.xRange = 4;
		this.yRange = 4;
		this.minXspeed = -1;
		this.maxXspeed = 1;
		this.minYspeed = 2;
		this.maxYspeed = 4;
		this.startRadius = 4;
		this.expansionRate = 0.001
		this.decayRate = 0.1;
		this.lifetime = 200;
		this.red = 200;
		this.green = 230;
		this.blue = 255;
		
		// private
		this._particles = undefined;
	};
	
	
	// "public" methods
	var p=Emitter.prototype;
	
	p.createParticles = function(emitterPoint){
		// initialize particle array
		this._particles = [];
				
		// create exhaust particles
		for(var i=0; i< this.numParticles; i++){
			// create a particle object and add to array
			var p = {};
			this._particles.push(_initParticle(this, p, emitterPoint));
		}
	};
	
	p.updateAndDraw = function(ctx, emitterPoint){
			
		for(var i=0;i<this._particles.length;i++){
			var p = this._particles[i];
						
			p.age += this.decayRate;
			p.r += this.expansionRate;
			p.x += p.xSpeed * Math.random() * 2;
			p.y -= p.ySpeed * Math.random();
			var alpha = 1 - p.age/this.lifetime;
			
			if(this.useSquares){
				// fill a rectangle	
				ctx.fillStyle = "rgba(" + this.red + "," + this.green + "," + 			
				this.blue + "," + alpha + ")"; 
				ctx.fillRect(p.x, p.y, p.r, p.r);
			}
			
			if(this.useCircles){
				// fill a circle
				ctx.fillStyle = "rgba(" + this.red + "," + this.green + "," + 			
				this.blue + "," + alpha + ")"; 
		
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.r, Math.PI * 2, false);
				ctx.closePath();
				ctx.fill();
			}
						
			// if the particle is too old, recycle it
			if(p.age >= this.lifetime){
				_initParticle(this, p, emitterPoint);
			}		
		} // end for loop of this._particles
	} // end updateAndDraw()
			
	// "private" method
	function _initParticle(obj, p, emitterPoint){

		// give it a random age when first created
		p.age = getRandom(0,obj.lifetime);
				
		p.x = emitterPoint.x + getRandom(-obj.xRange, obj.xRange);
		p.y = emitterPoint.y + getRandom(0, obj.yRange);
		p.r = getRandom(obj.startRadius/2, obj.startRadius); // radius
		p.xSpeed = getRandom(obj.minXspeed, obj.maxXspeed);
		p.ySpeed = getRandom(obj.minYspeed, obj.maxYspeed);
		return p;
	};
	
	
	return Emitter;
}();