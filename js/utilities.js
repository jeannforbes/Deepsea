var app = app || {};

//Resizes canvas size to window size
function resizeCanvas(){
	var canvas = app.main.canvas;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function fish(pos, size, color){
	this.pos = pos;
	this.vel = new vector(0,0);
	this.MAX_VEL = 0.5;
	this.accel = new vector(0,0);
	this.MAX_ACCEL = 0.25;
	this.size = size;
	this.color = color;
}

function light(pos, length, color){
	this.pos = pos;
	this.tip = new node(0,0,null,null, color),
	this.length = length;
	this.color = color;
	this.speed = Math.random()*0.5+0.25;

	(function makeLight(){
		var currentNode = this.tip;
		for(var i=0; i<length; i++){
			currentNode.next = new node(pos.x,pos.y,currentNode,null, color);
			currentNode = currentNode.next;
		}
	}.bind(this))();
}

function node(x, y, prev, next, color){
	this.accel = new vector(0,0);
	this.vel = new vector(0,0);
	this.pos = new vector(x,y);

	this.prev = prev;
	this.next = next;

	this.maxAccel = 0.6;
	this.maxVel   = 0.8;

	this.color = color;
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

function distance(v1, v2){
	if(v1 != undefined && v2 != undefined) return Math.sqrt( Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
	return 1;
}

function map(val, maxVal, max){
	return (val)/maxVal * max;
}