(function() {
  var
    // Obtain a reference to the canvas element
    // using its id.
    htmlCanvas = document.getElementById('boarder'),
      // Obtain a graphics context on the
      // canvas element for drawing.
      context = htmlCanvas.getContext('2d');

  var nameP = document.getElementById('name');

  var lineColor = '#7a7776';
  var ballColor = 'lightblue';
  var balls = [];
  // Start listening to resize events and
  // draw canvas.
  initialize();

  function initialize() {
    // Register an event listener to
    // call the resizeCanvas() function each time
    // the window is resized.
    window.addEventListener('resize', resizeCanvas, false);
    window.addEventListener('orientationchange', resizeCanvas, false);
    startTime = (new Date()).getTime();
    // Draw canvas border for the first time.
    resizeCanvas();

    //draw the balls and their lines
    makeBalls();

    var interval = setInterval(function(){
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      updateBalls();
      redraw();
    }, 50);
    //clearInterval(interval); // stops interval -- hook up to a button or something for testing
  }
  //add element to array by: arr[arr.length] = itemToAdd;
  function makeBalls() {
    var count = 50; //was 1000
    var minDiameter = 6; //was 3
    var maxDiameter = 15-minDiameter; //was 15
    var maxXSpeed = 7;//10 a bit too fast
    var maxYSpeed = 7;

    //make the balls
    for(var i = 0; i < count; i += 1){
      var tempX = Math.floor((Math.random()*window.innerWidth)+1);
      var tempY = Math.floor((Math.random()*window.innerHeight)+1);
      var tempDiameter = Math.floor((Math.random()*maxDiameter)+minDiameter);
      var tempXSpeed = Math.floor((Math.random()*maxXSpeed*2))-maxXSpeed;
      tempXSpeed = tempXSpeed == 0 ? 1 : tempXSpeed;
      var tempYSpeed = Math.floor((Math.random()*maxYSpeed*2))-maxYSpeed;
      tempYSpeed = tempYSpeed == 0 ? 1 : tempYSpeed;
      balls[i] = [tempX, tempY, tempDiameter, tempXSpeed, tempYSpeed];
    }
    redraw();
  }

  function redraw(){
    for(var i = 0; i < balls.length; i += 1){
      for(var j = i+1; j < balls.length; j += 1){
        //want a line connecting everything
        //if distance is less than threshold
        var distance = Math.sqrt((Math.pow(balls[i][0]-balls[j][0],2))+(Math.pow(balls[i][1]-balls[j][1],2)));
        if(distance < 160){
          context.beginPath();
          context.moveTo(balls[i][0],balls[i][1]);
          context.lineTo(balls[j][0],balls[j][1]);
          // var width = 1;
          switch (distance) {
            case distance <= 40:
              context.lineWidth = 4;
              break;
            case distance <= 80:
              context.lineWidth = 3;
              break;
            case distance <= 120:
              context.lineWidth = 2;
              break;
            default:
              context.lineWidth = 1;
              break;
          }
          // context.strokeStyle='white';
          context.strokeStyle = lineColor;
          context.stroke();
        }
      }
      context.beginPath();
      context.arc(balls[i][0], balls[i][1], balls[i][2], 0, 2*Math.PI);
      context.lineWidth = 0;
      context.fillStyle=ballColor;
      context.fill();
    }
  }

  //add lines connecting the balls
  function updateBalls(){
    var time = (new Date()).getTime() - startTime;
    for(var i = 0; i < balls.length; i += 1){
      //balls[i] = [x, y, diameter, xSpeed, ySpeed];
      // balls[i][0] = Math.abs((balls[i][0] + (balls[i][3]))%(window.innerWidth+balls[i][2]));
      // balls[i][1] = Math.abs((balls[i][1] + (balls[i][4]))%(window.innerHeight+balls[i][2]));
      balls[i][0] = (balls[i][0] + (balls[i][3]));
      if(balls[i][0] > (window.innerWidth+balls[i][2])){
        balls[i][0] = -balls[i][2];
      }else if(balls[i][0] < 0-balls[i][2]){
        balls[i][0] = window.innerWidth+balls[i][3];
      }
      balls[i][1] = (balls[i][1] + (balls[i][4]));
      if(balls[i][1] > (window.innerHeight+balls[i][2])){
        balls[i][1] = -balls[i][2];
      }else if(balls[i][1] < 0-balls[i][2]){
        balls[i][1] = window.innerHeight+balls[i][4]+balls[i][2];
      }
      // context.beginPath();
      // context.arc(balls[i][0], balls[i][1], balls[i][2], 0, 2*Math.PI);
      // context.fillStyle='lightblue';
      // context.fill();
    }
    // nameP.innerHTML = "Kyle Schoener";
    // context.fillText("Kyle Schoener", window.innerWidth/2, window.innerHeight/2);
  }

  // function moveLines(){
  //   for(var i = 0; i < balls.length/10; i += 1){
  //     if(randomize){
  //       lines[i] = Math.floor((Math.random()*(balls.length-1)));
  //       lines[i] = lines[i] == i ? i+1 : lines[i];
  //     }
  //     context.beginPath();
  //     context.moveTo(balls[i][0],balls[i][1]);
  //     context.lineTo(balls[lines[i]][0],balls[lines[i]][1]);
  //     context.stroke();
  //   }
  // }

  //the closer the balls, the thicker the lines
  //or randomly change lines between two random balls every -- every ball has one line starting at it

  function resizeCanvas() {
    htmlCanvas.width = window.innerWidth;
    htmlCanvas.height = window.innerHeight;
    updateBalls();
    redraw();
  }

})();
