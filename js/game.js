// Ryan Gliever 2015

// canvas
var canvas = document.createElement("canvas");
canvas.id = 'canvas'
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 300;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// rescale canvas on window resize
window.onresize = function() {
	canvas.width = window.innerWidth - 300;
	canvas.height = window.innerHeight;
};

// deg to radians
var TO_RADIANS = Math.PI/180; 

// spaceship image
var shipReady = false;
var shipImage = new Image();
shipImage.onload = function () {
	shipReady = true;
};
shipImage.src = "images/spaceship.png";

function changeShip (path) {
	shipImage.src = path;
	// unfocus the select box
	document.getElementById("ship_select").blur();
}

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
function TrailSpot (x, y, color) {
	this.x = x;
	this.y = y;
	this.color = color;
}
TrailSpot.prototype.setColor = function(color) {
	this.color = color;
}
TrailSpot.prototype.getColor = function() {
	var colorString = this.color;
	var valueArray = colorString.substring(colorString.indexOf('(') + 1, colorString.indexOf(')')).split(',');
	return valueArray;
}

var redVal = 0;
var greenVal = 0;
var blueVal = 0;
var trailColor = "rgba("+redVal+","+greenVal+","+blueVal+",1)";
function adjustColors (value, rgb) {
	switch (rgb) {
		case "r_slide": 
			redVal = value;
			document.getElementById("r_slide").blur();
			break;
		case "g_slide":
			greenVal = value;
			document.getElementById("g_slide").blur();
			break;
		case "b_slide": 
			blueVal = value;
			document.getElementById("b_slide").blur();
			break;
		default: break;
	}
	trailColor = "rgba("+redVal+","+greenVal+","+blueVal+",1)";
	document.getElementById("color_box").style.backgroundColor = trailColor;
}

var rainbow = false;
function rainbowMode (on) {
	if (on) rainbow = true;
	else rainbow = false;
	redVal = Math.floor(Math.random() * 255);
	greenVal = Math.floor(Math.random() *255);
	blueVal = Math.floor(Math.random() *255);
	trailColor = "rgba("+redVal+","+greenVal+","+blueVal+",1)";
}

// keep track of trail spots locations, draw in render
var trailSpots = [];
function addToTrail() {
	trailSpots.push(new TrailSpot(spaceship.x,spaceship.y,trailColor));
}

// draw each trail spot with appropriate opacities
function drawTrail() {
	var w = trailWeight;
	for (spot in trailSpots) {
		var op = spot/100; // sets the opacity based on spot index in trailSpots
		var rad = w;
		var colorVals = trailSpots[spot].getColor();
		var col = "rgba("+colorVals[0]+","+colorVals[1]+","+colorVals[2]+","+op+")";
		ctx.beginPath();
		ctx.fillStyle = col;
		ctx.arc(trailSpots[spot].x, trailSpots[spot].y, rad, 0, 2*Math.PI);
		ctx.fill();
	}
}

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

var maxTrailLength = 50;
function setMaxTrailLength (len) {
	maxTrailLength = len;
	document.getElementById("trail_length").blur();
}

var trailWeight = 2;
function setTrailWeight (wgt) {
	if (wgt > 6) {
		wgt = 6;
		document.getElementById("wgt").value = 6;
	} else if (wgt < 0) {
		wgt = 0;
		document.getElementById("wgt").value = 0;
	}
	trailWeight = wgt;
	document.getElementById("wgt").blur();
}

var begun = false;
function ctrls(a) {
	if (!a) {
		ctx.fillStyle = "rgb(200, 0, 0)";
		ctx.font = "11px Helvetica";
		ctx.textAlign = "center";
		ctx.fillText("Use the arrow keys to fly!", canvas.width/2, canvas.height/2);
	}
}

// UPDATE
var update = function () {
	// 0 -360 degree range
	spaceship.rotation = spaceship.rotation%360;
	var roto = spaceship.rotation*TO_RADIANS;
	var acc = 0.05;
	
	if (38 in keysDown) { // Player holding up
		accelerate (roto, acc);
		begun=true;
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
	
	if (rainbow) rainbowMode (true);
	
	checkBounds();
	if (spaceship.speed > 0) addToTrail(); // adds a trail spot to the trail (at ship location)
	else if (trailSpots.length > 0) trailSpots.shift(); 		// these shifts along with the
	if (trailSpots.length > maxTrailLength) trailSpots.shift(); // set spot opacity in drawTrail()
	                                                            // cause the "fading" of the trail
	ctx.clearRect(0,0,canvas.width,canvas.height);
};

// RENDER
var render = function () {
	if (shipReady) {
		drawRotatedImage(shipImage, 
			spaceship.x, 
			spaceship.y, 
			spaceship.rotation);
		drawTrail();
	}
	writeInfo();
	// display controls in beginning
	ctrls(begun);
};

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