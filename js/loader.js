/*
loader.js
*/
"use strict";

var app = app || {}; //singleton

//When the window first loads, call main's initialization
window.onload = function(){
	app.main.Emitter = app.Emitter;
	app.sound.init();
	app.main.sound = app.sound;

	myKeys.init();
	app.main.init();
	app.main.update();

	window.onresize = resizeCanvas;
}

window.onfocus = function(){
	app.main.paused = false;
	app.main.sound.playBGAudio();
	app.main.update();
}

window.onblur = function(){
	app.main.paused = true;
	app.main.sound.stopBGAudio();
	window.cancelAnimationFrame(app.main.animationID);
}