var app = app || {};

//Resizes canvas size to window size
function resizeCanvas(){
	var canvas = app.main.canvas;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

// draws text with the given parameters
function fillText(ctx, string, x, y, css, color) {
	ctx.save();
	ctx.font = css;
	ctx.fillStyle = color;
	ctx.fillText(string, x, y);
	ctx.restore();
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function light(pos, length, color){
	this.head = new node(null, null);
	this.head.pos = pos;
	this.tail = this.head;
	this.length = length;
	this.color = color;
	this.aggression = Math.random();

	(function makeLight(){
		var currentNode = this.head;
		for(var i=0; i<length; i++){
			currentNode.next = new node(this, pos, currentNode, null, 1 - i/length);
			currentNode = currentNode.next;
		}
		this.tail = currentNode.prev;
	}.bind(this))();
}

function node(light, pos, prev, next, radius){
	this.light = light;
	this.accel = new vector(0,0);
	this.vel = new vector(0,0);
	this.pos = pos;
	this.radius = radius;

	this.prev = prev;
	this.next = next;

	this.maxAccel = 2;
	this.maxVel   = 0.4;
}

function vector(x,y){
	this.x = x;
	this.y = y;

	this.magnitude = function(){ return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));}
}

function clampVector(v, min, max){
	var scaleAmt = 1;
	if(v.magnitude() < min) scaleAmt = min;
	else if(v.magnitude() > max) scaleAmt = max;

	var normalized = multVector(v, max);

	return normalized;
}

function multVector(v1, n){
	if(!v1) return new vector(1, 1);
	return ( new vector(v1.x*n, v1.y*n) );
}

function addVectors(v1, v2){
	if(!v1) return v2;
	if(!v2) return v1;
	var v = (new vector( (v1.x + v2.x), (v1.y + v2.y)) );
	return v;
}

function subtractVectors(v1, v2){
	if(!v1) return v2;
	if(!v2) return v1;
	return (new vector((v2.x - v1.x), (v2.y - v1.y)) );
}

function crossProduct(v1, v2){
	return (v1.magnitude() * v2.magnitude() * Math.sin(90));
}

function distance(v1, v2){
	if(v1 != undefined && v2 != undefined) return Math.sqrt( Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
	return 1;
}

function map(val, maxVal, max){
	return (val)/maxVal * max;
}

function perlinColor(perlin, seed){
	var r = parseInt(Math.abs(Math.sin(seed/2))*200)+50;
	var g = r;//parseInt(Math.abs(Math.cos(seed))*150)+100;
	var b = 0;//parseInt(Math.abs(Math.sin(seed))*150)+100;
	return "rgba("+r+","+g+","+b+",1)";
}