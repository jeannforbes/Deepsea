//utilities.js
//made by Jeannette Forbes

var app = app || {};

//Resizes canvas size to window size
function resizeCanvas(){
	app.main.canvas.width = window.innerWidth;
	app.main.canvas.height = window.innerHeight;
}

// draws text with the given parameters
function fillText(ctx, string, x, y, css, color) {
	ctx.save();
	ctx.font = css;
	ctx.fillStyle = color;
	ctx.fillText(string, x, y);
	ctx.restore();
}

//Clamps a value between a given max and min
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

//Returns a random number between a given max and min
function getRandom(min, max) {
  	return Math.random() * (max - min) + min;
}

//Creates a custom "linked list" class for use with the custom Node class
//  WARNING: this class produce erratic behavior if used as regular linked list
function Light(pos, length){
	this.head = new Node(this, pos, null, null, 1);
	this.head.pos = pos;
	this.tail = this.head;
	this.length = length;
	this.aggression = Math.random()/2;

	(function makeLight(){
		var currentNode = this.head;
		for(var i=0; i<length; i++){
			currentNode.next = new Node(this, pos, currentNode, null, 1 - i/length);
			currentNode = currentNode.next;
			if(currentNode.scale < 0.6) currentNode.scale = 0.6;
		}
		this.tail = currentNode.prev;
		this.tail.isTail = true;
	}.bind(this))();
}

//Creates a node specifically for the Light class
//  WARNING: this will work with generic linked lists, but may produced weird results
function Node(light, pos, prev, next, scale){
	this.light = light;
	this.accel = new Vector(0,0);
	this.vel = new Vector(0,0);
	this.pos = pos;
	this.scale = scale;
	this.frame = 0;
	this.isTail = false;
	this.safe = 0;

	this.prev = prev;
	this.next = next;

	this.maxAccel = 2;
	this.maxVel   = 0.4;
}

//Creates a vector <x,y>
function Vector(x,y){
	this.x = x;
	this.y = y;

	this.magnitude = function(){ return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));}
}

//Clamps a vector's magnitude between max and min values
function clampVector(v, min, max){
	var scaleAmt = 1;
	if(v.magnitude() < min) scaleAmt = min;
	else if(v.magnitude() > max) scaleAmt = max;

	var normalized = multVector(v, max);

	return normalized;
}

//Multiplies a vector by a scalar
function multVector(v1, n){
	if(!v1) return new Vector(1, 1);
	return ( new Vector(v1.x*n, v1.y*n) );
}

//Adds two vectors and returns their sum
function addVectors(v1, v2){
	if(!v1) return v2;
	if(!v2) return v1;
	var v = (new Vector( (v1.x + v2.x), (v1.y + v2.y)) );
	return v;
}

//Subtracts two vectors and returns the answer
function subtractVectors(v1, v2){
	if(!v1) return v2;
	if(!v2) return v1;
	return (new Vector((v2.x - v1.x), (v2.y - v1.y)) );
}

//Returns the cross product of two vectors
function crossProduct(v1, v2){
	return (v1.magnitude() * v2.magnitude() * Math.sin(90));
}

//Returns the distance between two vectors
function distance(v1, v2){
	if(v1 != undefined && v2 != undefined) return Math.sqrt( Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
	return 1;
}

//Maps a given value to between 2 other provided values
function map(val, maxVal, max){
	return (val)/maxVal * max;
}

//Returns a color based on perlin noise
function perlinColor(perlin, seed){
	var r = parseInt(Math.abs(Math.sin(seed/2))*200)+50;
	var g = r;//parseInt(Math.abs(Math.cos(seed))*150)+100;
	var b = 0;//parseInt(Math.abs(Math.sin(seed))*150)+100;
	return "rgba("+r+","+g+","+b+",1)";
}