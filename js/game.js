// canvas
var canvas = document.createElement("canvas");
canvas.id = 'canvas'
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 300;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// deg to radians
var TO_RADIANS = Math.PI/180; 

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
	topSpeed: 8.0,
	rotation: 0,
	x: 100,
	y: 100
};

// key event listeners
var keysDown = {};
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// ACCELERATE / DECELERATE
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

// reset spaceship coordinates when it goes off screen
function checkBounds () {
	switch(true) {
		case (spaceship.x > canvas.width): spaceship.x = 0; break;
		case (spaceship.x < 0): spaceship.x = canvas.width; break;
		case (spaceship.y > canvas.height): spaceship.y = 0; break;
		case (spaceship.y < 0): spaceship.y = canvas.height; break;
		default: break;
	}
}

// trail spot prototype
function TrailSpot (x, y, color, alpha) {
	this.x = x;
	this.y = y;
	this.color = color;
}
TrailSpot.prototype.setColor = function(color) {
	this.color = color;
}
TrailSpot.prototype.getColor = function() {
	return this.color;
}

var redVal = 0;
var greenVal = 0;
var blueVal = 0;
var trailColor = "rgba("+redVal+","+greenVal+","+blueVal+",1)";
function adjustColors (value, rgb) {
	switch (rgb) {
		case "r_slide": redVal = value; break;
		case "g_slide": greenVal = value; break;
		case "b_slide": blueVal = value; break;
		default: break;
	}
	trailColor = "rgba("+redVal+","+greenVal+","+blueVal+",1)";
	document.getElementById("color_box").style.backgroundColor = trailColor;
}

// keep track of trail spots locations, draw in render
var trailSpots = [];
function drawTrail() {
	trailSpots.push(new TrailSpot(spaceship.x,spaceship.y,trailColor)
	);
}

/*
function fadeTrail() {
	for (spot in trailSpots) {
		var a = 1;
		while (a > 0) {
			//console.log(a);
			a -= 0.05;
			trailSpots[spot].setColor("rgba(0,0,0,"+a+")");
		}
	}
}
*/

var maxTrailLength = 50;
function setMaxTrailLength (len) {
	maxTrailLength = len;
}

var trailWeight = 2;
function setTrailWeight (wgt) {
	trailWeight = wgt;
}

// UPDATE
var update = function () {
	// 0 -360 degree range
	spaceship.rotation = spaceship.rotation%360;
	var roto = spaceship.rotation*TO_RADIANS;
	var acc = 0.05;
	
	if (38 in keysDown) { // Player holding up
		accelerate (roto, acc);
	} else if (!(38 in keysDown) && spaceship.speed >= 0) {
		decelerate (roto, acc);
		trailSpots.shift();
	}
	if (37 in keysDown) { // Player holding left
		spaceship.rotation -= 5;
		if (spaceship.rotation < 0) spaceship.rotation += 360;
	}
	if (39 in keysDown) { // Player holding right
		spaceship.rotation += 5;
	}
	
	checkBounds();
	if (spaceship.speed > 0) drawTrail();
	else if (trailSpots.length > 0) trailSpots.shift();
	if (trailSpots.length > maxTrailLength) trailSpots.shift();
	ctx.clearRect(0,0,canvas.width,canvas.height);
};

// RENDER
var render = function () {
	if (shipReady) {
		drawRotatedImage(shipImage, 
			spaceship.x, 
			spaceship.y, 
			spaceship.rotation);
		var w = trailWeight;
		for (spot in trailSpots) {
			var op = spot/100;
			var col = "rgba("+redVal+","+greenVal+","+blueVal+","+op+")";
			ctx.fillStyle = col;
			ctx.fillRect(trailSpots[spot].x, trailSpots[spot].y, w, w);
		}
	}
	writeInfo();
};

function writeInfo () {
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.font = "11px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Rotation: " + spaceship.rotation + "°", 4, 4);
	ctx.fillText("Speed: " + spaceship.speed, 4, 16);
	ctx.fillText("X: " + spaceship.x, 4, 28);
	ctx.fillText("Y: " + spaceship.y, 4, 40);
}


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

//
// ~ /\/\ /-\ \ /\/ ~ //
//
var main = function () {
	update();
	render();
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

main();