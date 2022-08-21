// By Truett Van Slyke - 8/21/22

const CANVAS_SCALE = 4
const width = window.innerWidth * CANVAS_SCALE
const height = window.innerHeight * CANVAS_SCALE
const canvasMargin = 50

// CONFIG
const TARGET_SPEED = 2.85 * CANVAS_SCALE
const RESOLVE = 0.2
const RANGE = 75 * CANVAS_SCALE
const SEPARATION = .08 * CANVAS_SCALE
const COHESION = 0.03
const ALIGNMENT = 0.01 * CANVAS_SCALE	
const MOUSE_SEPARATION = 1 * CANVAS_SCALE

const lockedColor = false
const defaultColor = "rgb(0, 256, 0)"
const startSpeed = 5 * CANVAS_SCALE
const shadeTransparency = .08
const startBoids = width * height / 20000
const boidThickness = 8


var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

const stepTime = 33 // In Milliseconds

// RESIZE
c.style = `background:black; width:${window.innerWidth}px; height:${window.innerHeight}px; position:absolute;  top:0px;
  right:0px;
  bottom:0px;
  left:0px;`
c.height = height
c.width = width

var mouseX = 0
var mouseY = 0

var boids = 0

var xBoidPos = []
var yBoidPos = []
var xLastPos = []
var yLastPos = []
var boidVelX = []
var boidVelY = []
var boidColor = []

var cmTID;

function createBoid(x, y, sx, sy, color)
{
	boids++
	xBoidPos.push(x)
	yBoidPos.push(y)
	xLastPos.push(x)
	yLastPos.push(y)
	boidVelX.push(sx)
	boidVelY.push(sy)
	boidColor.push(color)
}

function drawLine(x1, y1, x2, y2, width, color)
{
	ctx.beginPath()
	ctx.lineWidth = width;
	ctx.strokeStyle = color;
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}


// Function by mjackson - https://gist.github.com/mjackson/5311256
function hsvToRgb(h, s, v) {
  var r, g, b;
  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return `rgb(${r * 256}, ${g * 256}, ${b * 256})`
}


function drawCircle(x, y, radius, color)
{
	var ctx = c.getContext("2d");
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = color
	ctx.lineWidth = 1
	ctx.strokeStyle = color
	//ctx.fill();
	ctx.stroke()
}

function drawShade(transparency) 
{
	ctx.rect(0, 0, width, height);
	ctx.fillStyle = `rgba(0, 0, 0, ${transparency})`;
	ctx.fill();
}

function random(min, max)
{
	var num = Math.floor(Math.random() * (max - min + 1)) + min
	return num
}

function randomColor()
{
	var color = hsvToRgb(random(0, 100)/100, 1, 1)
	return color
}

function spawnBoids(count)
{
	for (let i = 1; i <= count; i++)
		{
			var newBoidX = random(0, width)
			var newBoidY = random(0, height)
			var newBoidSX = random(-startSpeed, startSpeed)
			var newBoidSY = random(-startSpeed, startSpeed)
			var newColor = hsvToRgb(newBoidX / width, 1, 1)
			if (lockedColor) {
				newColor = defaultColor
			}
			createBoid(newBoidX, newBoidY, newBoidSX, newBoidSY, newColor)
		}
}

function renderBoid(boidNum) 
{
	var boidX = xBoidPos[boidNum]
	var boidY = yBoidPos[boidNum]
	var lastX = xLastPos[boidNum]
	var lastY = yLastPos[boidNum]
	var color = boidColor[boidNum]
	drawCircle(boidX, boidY, boidThickness/2, color)
	drawCircle(lastX, lastY, boidThickness/2, color)
	var distance = getDistance(boidX - lastX, boidY - lastY)
	if ((distance < height/2)&&(distance < width/2))
	{
		drawLine(boidX, boidY, lastX, lastY, boidThickness, color)
	}
}

function fullRender()
{
	drawShade(shadeTransparency)
	for (let i = 1; i <= boids; i++)
	{
		renderBoid(i - 1)
	}
}

function getDistance(x, y)
{
	return Math.sqrt(x*x + y*y)
}

document.addEventListener('mousemove', logKey)

function logKey(e) {
  mouseX = e.clientX * CANVAS_SCALE
	mouseY = e.clientY * CANVAS_SCALE
}


function moveBoid(boidNum)
{
	var xVel = boidVelX[boidNum]
	var yVel = boidVelY[boidNum]
	var xPos = xBoidPos[boidNum]
	var yPos = yBoidPos[boidNum]
	var distance = getDistance(xVel, yVel)
	var target = (xVel / distance) * TARGET_SPEED
	xVel += (target - xVel) * RESOLVE
	var target = (yVel / distance) * TARGET_SPEED
	yVel += (target - yVel) * RESOLVE
	xPos += xVel
	yPos += yVel

	// WRAP
	if (xPos < -canvasMargin)
	{
		xPos += width + canvasMargin * 2
	}
	if (yPos < -canvasMargin)
	{
		yPos += height + canvasMargin * 2
	}
	if (xPos > width + canvasMargin)
	{
		xPos -= width + canvasMargin * 2
	}
	if (yPos > height + canvasMargin)
	{
		yPos -= height + canvasMargin * 2
	}
	
	// UPDATE DATA

	xLastPos[boidNum] = xBoidPos[boidNum]
	yLastPos[boidNum] = yBoidPos[boidNum]
	xBoidPos[boidNum] = xPos
	yBoidPos[boidNum] = yPos
	boidVelX[boidNum] = xVel
	boidVelY[boidNum] = yVel
}

function calculateBoid(boidNum)
{
	var xVel = boidVelX[boidNum]
	var yVel = boidVelY[boidNum]
	var xPos = xBoidPos[boidNum]
	var yPos = yBoidPos[boidNum]
	var boidCount = 0
	var boidSumX = 0
	var boidSumY = 0
	var boidSumSX = 0
	var boidSumSY = 0
	for (let x = 0; x < boids; x++)
	{
		if (!(x == boidNum))
		{
			var distanceX = xBoidPos[x] - xPos
			var distanceY = yBoidPos[x] - yPos
			var distance = getDistance(distanceX, distanceY)
			if (distance < RANGE)
			{
				boidCount++
				boidSumX += distanceX
				boidSumY += distanceY
				boidSumSX += boidVelX[x] - xVel
				boidSumSY += boidVelY[x] - yVel
				xVel += -SEPARATION * (distanceX / distance)
				yVel += -SEPARATION * (distanceY / distance)
			}
		}
	}
	xVel += COHESION * (boidSumX / boidCount)
	yVel += COHESION * (boidSumY / boidCount)
	xVel += ALIGNMENT * (boidSumSX / boidCount)
	yVel += ALIGNMENT * (boidSumSY / boidCount)

	var distanceX = mouseX - xPos
	var distanceY = mouseY - yPos
	var distance = getDistance(distanceX, distanceY)
	if (distance < RANGE)
	{
		xVel += -MOUSE_SEPARATION * (distanceX / distance)
		yVel += -MOUSE_SEPARATION * (distanceY / distance)
	}
	
	// UPDATE
	boidVelX[boidNum] = xVel
	boidVelY[boidNum] = yVel
}

function stepBoids()
{
	for (let i = 1; i <= boids; i++)
	{
		moveBoid(i - 1)
	}
	for (let i = 1; i <= boids; i++)
	{
		calculateBoid(i - 1)
	}
}

function init() 
{
	spawnBoids(startBoids)
}

function step()
{
	stepBoids()
	fullRender()
	cmTID = setTimeout(step, stepTime)
}

init()
step()
