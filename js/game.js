// Ryan Gliever 2015
// canvas
var canvas = document.createElement("canvas");
canvas.id = 'canvas'
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// background image
var bgReady = false;
var bgImage = new Image();
bgImage.src = "images/game-background.png";
bgImage.onload = function () {
	bgReady = true;
};

// spaceship image
var shipReady = false;
var shipImage = new Image();
shipImage.onload = function () {
	shipReady = true;
};
shipImage.src = "images/spaceship.png";

// the spaceship variables
var spaceship = {
	speed: 0.0,
	topSpeed: 4.0,
	rotation: 0,
	x: 100,
	y: 100
};

var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

function accelerate(roto, acc) {
	if (spaceship.speed < spaceship.topSpeed) {
		spaceship.speed += acc;
	}
	spaceship.x += spaceship.speed*Math.sin(roto);
	spaceship.y -= spaceship.speed*Math.cos(roto);
}

function decelerate(roto, acc) {
	spaceship.speed -= acc;
	spaceship.x += spaceship.speed*Math.sin(roto);
	spaceship.y -= spaceship.speed*Math.cos(roto);
}

function checkBounds () {
	switch(true) {
		case (spaceship.x > canvas.width): spaceship.x = 0; break;
		case (spaceship.x < 0): spaceship.x = canvas.width; break;
		case (spaceship.y > canvas.height): spaceship.y = 0; break;
		case (spaceship.y < 0): spaceship.y = canvas.height; break;
		default: break;
	}
}

// Update game objects
var update = function () {
	// 0 -360 degree range
	spaceship.rotation = spaceship.rotation%360;
	var roto = spaceship.rotation*TO_RADIANS;
	var acc = 0.05;
	
	if (38 in keysDown) { // Player holding up
		accelerate (roto, acc);
	} else if (!(38 in keysDown) && spaceship.speed > 0) {
		decelerate (roto, acc);
	}
	if (37 in keysDown) { // Player holding left
		spaceship.rotation -= 5;
		if (spaceship.rotation < 0) spaceship.rotation += 360;
	}
	if (39 in keysDown) { // Player holding right
		spaceship.rotation += 5;
	}
	checkBounds();
};

// Draw everything
var render = function () {
	if (bgReady) {
		drawBackgroundRepeat(bgImage);
	}
	
	if (shipReady) {
		drawRotatedImage(shipImage, 
			spaceship.x, 
			spaceship.y, 
			spaceship.rotation);
	}
	
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.font = "11px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Rotation: " + spaceship.rotation, 4, 4);
	ctx.fillText("Speed: " + spaceship.speed, 4, 16);
	ctx.fillText("X: " + spaceship.x, 4, 28);
	ctx.fillText("Y: " + spaceship.y, 4, 40);
};

// repeat background image
function drawBackgroundRepeat(image) {
	var x = 0;
	var y = 0;
	while (x < canvas.width) {
		while (y < canvas.height) {
			ctx.drawImage(image, x, y);
			y += image.height;
		}
		y = 0;
		ctx.drawImage(image, x, y);
		x += image.width;
	}
}

var TO_RADIANS = Math.PI/180; 
function drawRotatedImage(image, x, y, angle) { 
 
	// save the current co-ordinate system 
	// before we screw with it
	ctx.save(); 
 
	// move to the middle of where we want to draw our image
	ctx.translate(x, y);
 
	// rotate around that point, converting our 
	// angle from degrees to radians 
	ctx.rotate(angle * TO_RADIANS);
 
	// draw it up and to the left by half the width
	// and height of the image 
	ctx.drawImage(image, -(image.width/2), -(image.height/2));
 
	// and restore the co-ords to how they were when we began
	ctx.restore(); 
}

// The main game loop
var main = function () {
	update();
	render();

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
main();