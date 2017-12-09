//contexts
var ctx = new AudioContext();
var cv = document.getElementById('canvas').getContext("2d");
// var songInput = document.getElementById('songInput');
// var songAudio = document.getElementById('songAudio');
var audioSrc, analyzer, frequencyData, renderInterval;// = new Uint8Array(analyzer.frequencyBinCount);

var songs = [];
var color = getRandomColor();
var started = false;
//SETUP FUNCTION : EXECUTED ONLY ONCE
function setup() {
	cv.canvas.width = window.innerWidth;
	cv.canvas.height = window.innerHeight;

	ctx = new AudioContext();
	audioSrc = ctx.createMediaElementSource(songAudio);
	analyzer = ctx.createAnalyser();
	analyzer.fftSize = 128; // frequencyData size is half this value
	// we have to connect the MediaElementSource with the analyzer
	audioSrc.connect(analyzer);
	audioSrc.connect(ctx.destination);
	// frequencyBinCount tells you how many values you'll receive from the analyzer
	frequencyData = new Uint8Array(analyzer.frequencyBinCount);

	cv.imageSmoothingEnabled = true;
	songInput.onchange = onSongSelected;
	songAudio.addEventListener('ended', playNextSong);

	document.body.style.backgroundColor = 'grey';
	document.getElementById('songInput').style.color = 'grey';
	paper.setup(document.getElementById('canvas'));

	createParticles();

	renderFrame();
}

var particles, opacity, maxRadius, maxSpeed, particleCount;
function createParticles() {
	// The amount of circles we want to make:
	particleCount = 400;
	maxRadius = 10;
	maxSpeed = 6;
	opacity = 0.2;
	particles = [];

	for (var i = 0; i < particleCount; i++) {
		particles[i] = [window.innerWidth/2,window.innerHeight/2, Math.random()*maxRadius, (Math.random()<0.5 ? -1 : 1)*(Math.random()*maxSpeed), (Math.random()<0.5 ? -1 : 1)*(Math.random()*maxSpeed)];
	}
}

function onSongSelected() {
	var files = songInput.files;
	var songFound = false;
	for(var i = 0; i < files.length ; i++) {
		console.log(files[i]);
		if(files[i].name.slice(-3).toLowerCase() == 'mp3') {
			songFound = true;
			//file is the path to the song
			var filePath = URL.createObjectURL(files[i]);
			songs.push(filePath);
		}
	}

	// if a song is playing, we don't want to interrupt it
	if(songFound && !started) {
		started = true;
		playNextSong();
	}
}

function playNextSong() {
	clearInterval(renderInterval);
	if(songs.length == 0) {
		songAudio.src = '';
		started = false;
		renderFrame();
	} else {
		// color = getRandomColor();
		songAudio.src = songs.shift();
		songAudio.load();
		songAudio.play();
		renderInterval = setInterval(renderFrame, 40);
	}
}
/*
function drawCurves(xstart, ystart, width, height, angle) {
	var i;
	var counter = 0;
	var x = 0;
	var y = 0;
	var xmult = width/180;

	cv.save();

  cv.translate(xstart, ystart); // may want to use this and make x and y default to 0
  cv.rotate(angle * (Math.PI/180)); // rotate some angle (radians)

	var jump = 20; //
	var increase = ((jump*9)/180*Math.PI / 9);
	for(i=0; i<=180; i+=jump) {
		cv.moveTo(x,y);
		x = (i*xmult);
    // x = (i*xmult)+xstart - (width/2); // this is if we want it centered
    // y = (180 - Math.sin(counter) * height);// - (height*3.5);
		y = -height*Math.sin(counter);

		counter += increase;
    cv.lineTo(x,y);
	}
	cv.strokeStyle = color;
	cv.stroke();
	// cv.fill();
	// reset transforms
  cv.restore();
}
*/

function drawCurves(xstart, ystart, width, height, angle) {
	var angleRads = angle * (Math.PI/180);
	var path = new paper.Path();
	path.strokeColor = color;

	path.add(new paper.Point(xstart,ystart));

	var x = width/2;
	var y = -height;
	var x1 = (x * Math.cos(angleRads)) - (y * Math.sin(angleRads)) + xstart;
	var y1 = ((y * Math.cos(angleRads)) + (x * Math.sin(angleRads))) + ystart;
	path.add(new paper.Point(x1, y1));

	var x = width;
	var y = 0;
	var x2 = (x * Math.cos(angleRads)) - (y * Math.sin(angleRads)) + xstart;
	var y2 = (y * Math.cos(angleRads)) + (x * Math.sin(angleRads)) + ystart;
	path.add(new paper.Point(x2, y2));

	path.smooth();
	path.strokeWidth = 4;
}

function renderFrame() {
	// update data in frequencyData
	analyzer.getByteFrequencyData(frequencyData);

	// render frame based on values in frequencyData
	cv.canvas.width = window.innerWidth;
	cv.canvas.height = window.innerHeight;

	var radius = window.innerWidth < window.innerHeight ? window.innerWidth/4 : window.innerHeight/4;

	// This can be optimized by using project.activeLayer.children[i] rather
	// than clearing everything on each iteration.
	paper.project.clear();

	if(started) {
		updateParticles();
	}

	var myCircle = new paper.Path.Circle(new paper.Point(window.innerWidth/2, window.innerHeight/2), radius);
	myCircle.strokeColor = color;
	myCircle.strokeWidth = 2;

	var n = Math.floor((analyzer.fftSize/2)*(3/4)); //we multiply by the constant because the last part are all zeros
	// var n = analyzer.fftSize/2;
	var width = (2 * Math.PI * radius) / n;
	var mult = 360/n;
	for (var i = 0; i < n; i++) {
		var value = frequencyData[i]/255;
		var angleDegs = i * mult;
		var angleRads = angleDegs * (Math.PI/180);
		var x = radius * Math.sin(angleRads);
		x += window.innerWidth/2;
		var y = radius * -Math.cos(angleRads);
		y += window.innerHeight/2;

		var angleOffset = 0;
		if (analyzer.fftSize/2 == 32) {
			angleOffset = 6;
		} else if (analyzer.fftSize/2 == 64) {
			angleOffset = 4;
		} else if (analyzer.fftSize/2 == 128) {
			angleOffset = 2;
		}
		// use: drawCurves(xstart, ystart, width, height, angle)
		drawCurves(x, y, width, value*radius*(3/4), angleDegs + angleOffset);
	}
	paper.view.draw();
	// requestAnimationFrame(renderFrame);
}

function updateParticles() {
	for (var i = 0; i < particleCount; i++) {
		var x = particles[i][0];
		var y = particles[i][1];
		var r = particles[i][2];

		x += particles[i][3];
		y += particles[i][4];

		var circle = new paper.Path.Circle({
			center: [x, y],
			radius: r,
			fillColor: 'white'/*,
			strokeColor: 'black'*/
		});
		circle.opacity = opacity;

		if (x < 0) {
			x = window.innerWidth;
		} else if (x > window.innerWidth) {
			x = 0;
		}

		if (y < 0) {
			y = window.innerHeight;
		} else if (y > window.innerHeight) {
			y = 0;
		}

		particles[i][0] = x;
		particles[i][1] = y;
	}
}

function getRandomColor() {
  var values = "0123456789abcdef";
  var c = "#";
  for (var i = 0; i < 6; i++) {
    c += values[Math.floor(Math.random() * values.length)];
  }
  return c;
}

///////////////////////////////////////////
// function requestFullScreen(element) {
// 		console.log('requestFullScreen called');
//     // Supports most browsers and their versions.
//     var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
//
//     if (requestMethod) { // Native full screen.
//         requestMethod.call(element);
//     } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
//         var wscript = new ActiveXObject("WScript.Shell");
//         if (wscript !== null) {
//             wscript.SendKeys("{F11}");
//         }
//     }
// }

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

setup();

document.onmousedown = function(){
	color = getRandomColor();
	if(!started) {
		renderFrame();
	}
};

// this hides the cursor and the audio bar//input section
var timeout;
document.onmousemove = function() {
	clearTimeout(timeout);
	if(started) {
		timeout = setTimeout(function() {
			document.getElementById('annoying').style.visibility = 'hidden';
			document.getElementById('canvas').style.cursor = 'none';
		}, 3000);
	}
	document.getElementById('annoying').style.visibility = 'visible';
	document.getElementById('canvas').style.cursor = 'default';
}

window.onresize = function() {
	renderFrame();
}
///////////////////////////////////////////
