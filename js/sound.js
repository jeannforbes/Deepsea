// sound.js
"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};

// define the .sound module and immediately invoke it in an IIFE
app.sound = (function(){
	var bgAudio = undefined;
	var effectAudio = undefined;
	var currentEffect = 0;
	var currentDirection = 1;
	var effectSounds = ["1.mp3","2.mp3"];
	var winSound = "win.mp3"
	var loseSound = "lose.mp3";
	

	function init(){
		bgAudio = document.querySelector("#bgAudio");
		bgAudio.volume=0.2;
		effectAudio = document.querySelector("#effectAudio");
		effectAudio.volume = 0.25;
		playBGAudio();
	}

	function playBGAudio(){
		bgAudio.play();
	}

	function stopBGAudio(){
		bgAudio.pause();
		bgAudio.currentTime = 0;
	}

	function playEffect(src){
		effectAudio.currentTime = 0;
		effectAudio.src = "assets/sfx/" + src;
		effectAudio.play();
	}
		
	// export a public interface to this module
	return{
		init: init,
		playBGAudio: playBGAudio,
		stopBGAudio: stopBGAudio,
		playEffect: playEffect
	}
}());