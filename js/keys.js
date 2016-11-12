// Created by Cody Van De Mark, 
//    Game Design and Development Professor for Rochester Institute of Technology
// Modified for use in main.js by Jeannette Forbes

"use strict";

var myKeys = {};

myKeys.KEYBOARD = Object.freeze({
	"KEY_LEFT": 37, 
	"KEY_UP": 38, 
	"KEY_RIGHT": 39, 
	"KEY_DOWN": 40,
	"KEY_SPACE": 32,
	"KEY_SHIFT": 16,
	"KEY_D": 68,
});

myKeys.keydown = [];

myKeys.init = function(){
	window.addEventListener('keydown', function(e){
		if(e.keyCode == myKeys.KEYBOARD.KEY_DOWN)
			e.preventDefault();

		//Are we using keyboard controls?
		if(!app.main.usingMouse && app.main.gameState == app.main.GAME_STATE.MAIN_MENU){
			app.main.gameState = app.main.GAME_STATE.BEGIN;
			app.main.usingKeyboard = true;
			app.main.sound.playEffect("win.mp3");
		}

		myKeys.keydown[e.keyCode] = true;

		if(e.keyCode == myKeys.KEYBOARD.KEY_D){
			//app.main.debugMode();
		}
	});
};
	
window.addEventListener("keyup",function(e){
	
	myKeys.keydown[e.keyCode] = false;

});