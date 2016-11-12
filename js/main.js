//main.js
//made by Jeannette Forbes

"use strict";

var app = app || {};

app.main = {
	//Canvas & buffer
	canvas: undefined,
	ctx: undefined,
	buffer: undefined,
	bctx: undefined,
	//Contants that shall not change
	CONSTANTS: Object.freeze({
		MAX_LIGHTS: 10,
		LIGHT_LENGTH: 6,
		SPRITE_WIDTH: 64,
		SPRITE_HEIGHT: 64,
	}),
	//These are all possible game states
	GAME_STATE:{
        MAIN_MENU: -1,
    	BEGIN: 0,
    	PLAY: 1,
    	NEXT_LEVEL: 2,
    	END: 3
    },
    //Current game state
    gameState: -1,
    //"mouse"'s current values (may be controlled by keyboard)
	mouse: {
		pos: null,
		prev: null,
		dx: 0,
		radius: 30,
		node: undefined,
		direction: undefined,
	},
	//Are we using the mouse or keyboard controls?
	usingMouse: false,
	usingKeyboard: false,
	//Player
	player: undefined,
	//Enemies array
	lights: [],
	//Current number of enemies
	numLights: 1,
	paused : false,
	perlin : undefined,
	date : undefined,
	//Handles tracks time elapsed since start & deltaTime
	time : {
		elapsed: 0,
		lastTime: 0,
		deltaTime: 0,
	},
	//Used to create background gradient
	bgColors : ['#03070A','#15211D','#1B393B','#2F4E50','#71A692'],
	bgGradient: undefined,
	//Used to step spritesheet transitions
	animationID: undefined,
	//Used to fade out UI transitions
	alphaUI : 1,
	//Controls bg music and SFX
	sound: undefined,
	//Bubble emitters
	emitters: [],
	Emitter: undefined,

	//Initializes the game
	//	ONLY CALL THIS ONCE (window.onload)
	init : function(){
		this.canvas = document.querySelector('#canvas');
		this.ctx = this.canvas.getContext("2d");
		this.perlin = new Perlin('random seed');
		this.date = new Date();
		this.mouse.pos = new Vector(this.canvas.width/2,this.canvas.height/2);
		this.mouse.prev = new Vector(0,0);
		this.gameState = this.GAME_STATE.MAIN_MENU;

		this.bgGradient = this.ctx.createLinearGradient(
			this.canvas.width/2,0,this.canvas.width/2, this.canvas.height);
		for(var i=0; i<this.bgColors.length; i++){
			this.bgGradient.addColorStop(1 - i/this.bgColors.length, this.bgColors[i]);
		}

		for(var i=0; i<5; i++){
			var em = new this.Emitter();
			em.createParticles({x:this.canvas.width/5 * i + this.canvas.width/5,y:this.canvas.height});
			this.emitters.push(em);
			Object.seal(em);
		}

		/* Event Handlers */

		//resizes on window resize
		document.addEventListener('resize', resizeCanvas);

		//Updates mouse clickX and clickY
		document.addEventListener('click', function(e){
			if(!this.usingKeyboard && this.gameState == this.GAME_STATE.MAIN_MENU){
				this.sound.playEffect("win.mp3");

				this.gameState = this.GAME_STATE.BEGIN;
				this.usingMouse = true;

				//Add listener to update mouse position
				document.addEventListener('mousemove', function(e){
					this.mouse.prev.y = this.mouse.pos.x;
					this.mouse.prev.y = this.mouse.pos.y;
					this.mouse.pos.x = e.clientX;
					this.mouse.pos.y = e.clientY;

					this.mouse.dX = (this.mouse.X - this.mouse.prev.x);
					this.mouse.dY = (this.mouse.Y - this.mouse.prev.y);

					this.mouse.direction = new Vector(0,0);
				}.bind(this));
			
			}
		}.bind(this));

		//Track elapsed time
		window.setInterval(function(){this.time.elapsed += 0.02;}.bind(this), 10);

		//Create player
		this.player = new Light(this.mouse.pos, this.CONSTANTS.LIGHT_LENGTH);

		//Resize canvas to browser size
		resizeCanvas();
	},

	//Responsible for updating game state
	update : function(){
		if(this.paused) return;

		this.time.deltaTime = this.calculateDeltaTime();

		this.animationID = window.requestAnimationFrame(this.update.bind(this));

		//If the player disappears, end the game
		if(this.gameState == this.GAME_STATE.PLAY && this.player.length < 2) 
			this.gameState = this.GAME_STATE.END;
		//If the player eats all enemies, add more enemies!
		if(this.gameState == this.GAME_STATE.PLAY){
			for(var i=0; i<this.lights.length; i++){
				if( this.gameState == this.GAME_STATE.PLAY && !this.lights[i] )
					this.gameState = this.GAME_STATE.NEXT_LEVEL;
			}
		}

		//If it's the next level, make it so!
		if(this.gameState == this.GAME_STATE.NEXT_LEVEL) this.nextLevel();

		/* UPDATE & DRAW */

		//Draw BG
		this.drawBG(this.ctx);
		//Draw & update organisms
		if(this.gameState == this.GAME_STATE.PLAY) {
			this.updateEnemies(this.ctx);
			this.updatePlayer(this.ctx);
		}
		//Draw bubbles
		for(var i=0; i<this.emitters.length; i++){
			this.emitters[i].updateAndDraw(this.ctx, 
				{x:this.canvas.width/5 * i + this.canvas.width/5,y:this.canvas.height});
		}
		//Draw UI
		this.drawUI(this.ctx);

		if(this.time.elapsed > 1 && this.lights.length < this.numLights) this.makeEnemy();

		this.keyboardMovement();
	},

	//Progress the game to the next level
	//	Reset the player's length
	//  Add another enemy to the total number of enemies & make them
	//	Set game state to play
	nextLevel : function(){

		this.lights = [];

		this.numLights++;
		for(var i=0; i<this.numLights; i++) this.makeEnemy();

		this.player = new Light(this.mouse.pos, this.CONSTANTS.LIGHT_LENGTH);

		this.gameState = this.GAME_STATE.PLAY;
	},

	//Move the mouse cursor with keyboard controls instead of the actual mouse position
	keyboardMovement : function(){
		var speed = 5;
		//x movement
		if( myKeys.keydown[myKeys.KEYBOARD.KEY_RIGHT] )
			if(this.mouse.pos.x < this.canvas.width ) this.mouse.pos.x+=speed;
		if( myKeys.keydown[myKeys.KEYBOARD.KEY_LEFT] )
			if(this.mouse.pos.x > 0 ) this.mouse.pos.x-=speed;
		//y movement
		if( myKeys.keydown[myKeys.KEYBOARD.KEY_DOWN] )
			if(this.mouse.pos.y < this.canvas.height ) this.mouse.pos.y+=speed;
		if( myKeys.keydown[myKeys.KEYBOARD.KEY_UP] )
			if(this.mouse.pos.y > 0 ) this.mouse.pos.y-=speed;
	},

	//Make another enemy light
	makeEnemy : function(){

		var enemy = new Light(new Vector(Math.random()*this.canvas.width,-100), 5, 'red');
		this.lights.push(enemy);
	},

	//Draws any text/fonts & instructional images
	drawUI : function(ctx){

		var alpha = 1;

		if(this.gameState == this.GAME_STATE.MAIN_MENU){
			ctx.save();

			//Background
			ctx.globalAlpha = alpha;

			ctx.fillStyle = 'black';
			ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

			//Title
			alpha = clamp(this.time.elapsed/10, 0, 1);
			ctx.globalAlpha = alpha;

			fillText(
				ctx, 
				"Ouroboros", 
				this.canvas.width/2 - 60, this.canvas.height/2, 
				'80px Amatic SC', 
				'#FFF');

			//Click!
			alpha = clamp(this.time.elapsed/10 - 0.5, 0, 1);
			ctx.globalAlpha = alpha;
			
			fillText(
				ctx, 
				"Click to use the mouse. . .", 
				this.canvas.width/3- 100, this.canvas.height/2 + 60, 
				'20px Raleway', 
				'#FFF');
			ctx.drawImage(document.querySelector("#mouseImg"), 
				this.canvas.width/3 - 60, this.canvas.height/2 + 80);

			alpha = clamp(this.time.elapsed/10 - 0.7, 0, 1);
			ctx.globalAlpha = alpha;
			fillText(
				ctx, 
				". . . or press any key to use keyboard controls.", 
				this.canvas.width/3+120, this.canvas.height/2 + 80, 
				'20px Raleway', 
				'#FFF');
			ctx.drawImage(document.querySelector("#keysImg"), 
				this.canvas.width/3 + 240, this.canvas.height/2 + 100);

			ctx.restore();
		}
		else if(this.gameState == this.GAME_STATE.BEGIN){

			ctx.save();
			ctx.globalAlpha = ((this.alphaUI-=0.01) > 0) ? this.alphaUI : 0;
			if(this.alphaUI < -0.2){
				this.alphaUI = 0;
				ctx.globalAlpha = 1;
				this.gameState = this.GAME_STATE.PLAY;
				return;
			}

			fillText(
				ctx, 
				"Ouroboros", 
				this.canvas.width/2 - 60, this.canvas.height/2, 
				'80px Amatic SC', 
				'#FFF');
			fillText(
				ctx, 
				"Click to use the mouse. . .", 
				this.canvas.width/3- 100, this.canvas.height/2 + 60, 
				'20px Raleway', 
				'#FFF');
			ctx.drawImage(document.querySelector("#mouseImg"), 
				this.canvas.width/3 - 60, this.canvas.height/2 + 80);
			fillText(
				ctx, 
				". . . or press any key to use keyboard controls.", 
				this.canvas.width/3+120, this.canvas.height/2 + 80, 
				'20px Raleway', 
				'#FFF');
			ctx.drawImage(document.querySelector("#keysImg"), 
				this.canvas.width/3 + 240, this.canvas.height/2 + 100);

			ctx.restore();

		}
		else if(this.gameState == this.GAME_STATE.PLAY){
			ctx.save();

			ctx.restore();
		}
		else if(this.gameState == this.GAME_STATE.END){
			ctx.save();

			ctx.globalAlpha = ((this.alphaUI+=0.002) < 1) ? this.alphaUI : 1;

			ctx.fillStyle = 'black';
			ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
			fillText(
				ctx, 
				"Game Over", 
				window.innerWidth/2 - 80, window.innerHeight/2, 
				'40px Raleway', 
				'#FFF');
			ctx.globalAlpha = this.alphaUI - 0.2;

			ctx.fillStyle = 'black';
			ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
			fillText(
				ctx, 
				"\"Thank you for playing!\" - Jeannette Forbes, Developer", 
				window.innerWidth/2 - 120, window.innerHeight/2 + 40, 
				'20px Raleway', 
				'#FFF');
			ctx.restore();

			if(this.alphaUI > 0.9){
				this.gameState = this.GAME_STATE.MAIN_MENU;
				this.lights = [];
				this.numLights = 1;
				for(var i=0; i<this.numLights; i++) this.makeEnemy();
				this.player = new Light(this.mouse.pos, this.CONSTANTS.LIGHT_LENGTH);
				this.usingMouse = false;
				this.usingKeyboard = false;
				this.alphaUI = 0;
			}
		} else if(this.gameState == this.GAME_STATE.NEXT_LEVEL){
			
		}
	},

	//Draws the background gradient
	drawBG : function(ctx){
		var h = this.canvas.height;
		var w = this.canvas.width;
		ctx.save()
		ctx.fillStyle = this.bgGradient;
		ctx.fillRect(0,0,w,h);
		ctx.restore();
	},

	//Clears the canvas to black
	clearCanvas : function(){
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
	},

	//Update all enemies
	updateEnemies : function(ctx){
		ctx.lineWidth = 3;
		for(var i=0; i<this.lights.length; i++){
			if(!this.lights[i]) break;
			this.updateLight(ctx, this.lights[i], this.player.tail.pos, this.lights[i].aggression);
		}
	},

	//Updates bubble positions & draws to canvas
	updateParticles : function(ctx){
		for(var i=0; i<particles.length; i++){
			particles.updateAndDraw(ctx,100,100);
		}
	},

	//Update the player position using the mouse position
	updatePlayer : function(ctx){
		this.player.head.pos = this.mouse.pos;
		this.handleCollisions();
		var currentNode = this.player.head.next;
		for(var i=1; i<this.player.length; i++){
			//CHECK COLLISIONS
			//MOVE NODE
			if(currentNode && currentNode.prev) this.nodeArrive(currentNode, currentNode.prev, 1);
			//DRAW NODE
			ctx.save();
			ctx.globalAlpha = this.player.length/(i+1) - 0.5;
			if (ctx.globalAlpha < 0.5 ) ctx.globalAlpha = 0.5;
			if(currentNode) this.drawNode(ctx, currentNode, this.player.color);
			ctx.restore();
			currentNode = currentNode.next;
		}
	},

	//Updates the whole string of lights
	updateLight : function(ctx, light, pos, weight){

		if( !light || !light.head || light.head.pos == undefined ) return;

		var currentNode = light.head;
		light.head.pos = pos;
		currentNode = light.head.next;
		for(var i=1; i<light.length; i++){
			//MOVE NODE
			if(currentNode.prev){ 
				this.nodeArrive(currentNode, currentNode.prev, weight);
			}
			//DRAW NODE
			ctx.save();
			ctx.globalAlpha = light.length/(i+1) - 0.1;
			if (ctx.globalAlpha < 0.5 ) ctx.globalAlpha = 0.5;
			this.drawNode(ctx, currentNode);
			ctx.restore();
			currentNode = currentNode.next;
			weight = 1;
		}
	},

	//Draws a single node to the canvas
	drawNode : function(ctx, node){
		var sprite;
		if(node.light == this.player) sprite = document.getElementById("playerSpritesheet");
		else sprite = document.getElementById("enemySpritesheet");
		ctx.save();

		ctx.drawImage(
			sprite,
			parseInt(node.frame) * this.CONSTANTS.SPRITE_WIDTH, 
			0,
			this.CONSTANTS.SPRITE_WIDTH, 
			this.CONSTANTS.SPRITE_HEIGHT,
			node.pos.x - this.CONSTANTS.SPRITE_WIDTH  * 0.25, 
			node.pos.y - this.CONSTANTS.SPRITE_HEIGHT * 0.25,
			this.CONSTANTS.SPRITE_WIDTH * node.scale,
			this.CONSTANTS.SPRITE_HEIGHT * node.scale);
		if(node.isTail  && node.safe <= 0) node.frame+=0.1;
		if(node.frame > 2) node.frame = 0;

		ctx.restore();
	},

	//Handle any collisions between head and tail nodes
	//	between the player and enemies
	handleCollisions : function(){
		for(var i=0; i<this.lights.length; i++){

			//Is the player colliding with the enemy's tail?
			if(!this.lights[i] || !this.player) break;
			if( this.nodeCollide(this.player.head.next, this.lights[i].tail)){
				//Shorten the enemy light
				if(this.lights[i].tail.safe < 0){
					this.nodeDestroy(this.lights[i].tail);
					this.lights[i].tail.safe = 50;

					//Lengthen the player light
					this.player = this.lengthenLight(this.player);
					return;
				}
			} else this.lights[i].tail.safe--;

			//Is the enemy colliding with the player's tail?
			if( !this.lights[i].head ) break;
			if( this.nodeCollide(this.lights[i].head.next, this.player.tail) ){
				if(this.player.tail.safe < 0){
					//Shorten the player light
					this.nodeDestroy(this.player.tail);
					this.player.tail.safe = 50;

					//Lengthen the enemy light
					this.lights[i] = this.lengthenLight(this.lights[i]);
					return;
				}
			} else this.player.tail.safe--;

			if(this.lights[i].length < 2) this.lights[i] = null;
		}
	},

	//Check if the given nodes are colliding
	nodeCollide : function(n1, n2){
		if( !n1 || !n2 ) return false;
		var dist = distance(n1.pos, n2.pos);
		var r1 = this.CONSTANTS.SPRITE_WIDTH * n1.scale *.5;
		var r2 = this.CONSTANTS.SPRITE_WIDTH * n2.scale *.5;
		if( n1 && n2 && (dist < r1+r2)) return true;
		return false;
	},

	//Remove the given node from the linked list
	nodeDestroy : function(node){
		//Handle if it's a head or tail of the list
		if(node.light.head == node) 
			node.light.head = node.next;
		if(node.light.tail == node){ 
				node.light.tail = node.prev; 
				node.light.tail.isTail = true; 
			}

		node.prev.next = node.next;
		node.next.prev = node.prev;

		node.light.length--;
		node = null;

		this.sound.playEffect("2.mp3");
	},

	//Adds another node to a Light
	lengthenLight : function(l){ 
		var nLight = new Light(l.head.pos, l.length+1);
		var cNode1 = nLight.head;
		var cNode2 = l.head;
		for(var i=0; i<l.length; i++){
			cNode1.pos = cNode2.pos;
			cNode1 = cNode1.next;
			cNode2 = cNode2.next;
		}
		return nLight;
	},

	//Moves a node to the given position
	nodeMove : function(node, pos, accel){
		node.accel = subtractVectors(node.pos, pos);
		node.accel = multVector(node.accel, accel);
		node.accel = clampVector(node.accel, -node.maxAccel, node.maxAccel);
		node.vel = addVectors(node.vel, node.accel);
		node.vel = clampVector(node.vel, -node.maxVel, node.maxVel);
		node.vel = multVector(node.vel, this.time.deltaTime*80);
		node.pos = addVectors(node.pos, node.vel);
	},

	// n1 will seek n2's position
	nodeSeek : function(n1, n2, weight){
		this.nodeMove(n1, n2.pos, 0.1 * weight);
	},

	// n1 will arrive at n2's position
	nodeArrive : function(n1, n2, weight){
		var goal = n2;
		var dist = distance(n1.pos, n2.pos)/2000;
		this.nodeMove(n1, goal.pos, dist * weight);
	},

	// Simulates ocean currents -- can cause unpredictable behavior
	nodeWander : function(n1, weight){
		var goal = new Vector(this.perlin.noise(this.time.elapsed, 0, 0), this.perlin.noise(0,this.time.elapsed, 0));
		var goal = addVectors(n1.pos, goal);
		this.nodeMove(n1, goal, weight);
	},

	// returns change in time
	calculateDeltaTime: function(){
		var now,fps;
		now = performance.now(); 
		fps = 1000 / (now - this.time.lastTime);
		fps = clamp(fps, 12, 60);
		this.time.lastTime = now; 
		return 1/fps;
	},

};