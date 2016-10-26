/*
loader.js
*/
"use strict";

var app = app || {}; //singleton

//When the window first loads, call main's initialization
window.onload = function(){
	app.main.init();
	app.main.update();
}

window.onfocus = function(){
	app.main.paused = false;
	app.main.update();
}

window.onblur = function(){
	app.main.paused = true;
	window.cancelAnimationFrame(app.main.animationID);
}