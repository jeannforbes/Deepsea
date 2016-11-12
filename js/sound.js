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
	

	//Initializes the sound module with bgAudio and sfx
	function init(){
		bgAudio = document.querySelector("#bgAudio");
		bgAudio.volume=0.2;
		effectAudio = document.querySelector("#effectAudio");
		effectAudio.volume = 0.25;
		playBGAudio();
	}

	//Public accessor to play bgAudio
	function playBGAudio(){
		bgAudio.play();
	}

	//Public accessor to pause bgaudio
	function stopBGAudio(){
		bgAudio.pause();
		//bgAudio.currentTime = 0;
	}

	//Public accessor to play an available sfx
	function playEffect(src){
		effectAudio.currentTime = 0;
		effectAudio.src = "assets/sfx/" + src;
		effectAudio.play();
	}
		
	//Export a public interface to this module
	return{
		init: init,
		playBGAudio: playBGAudio,
		stopBGAudio: stopBGAudio,
		playEffect: playEffect
	}
}());