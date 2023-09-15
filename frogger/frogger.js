var gl;
var points;
var xmove;
var ymove;
var stig = 0;
var speed;
var car;
var carColor = [];
var crash = false;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var froggy = [ vec2( -0.1, -0.1 - (2/7*3) ), vec2( 0.1, -0.1 - (2/7*3) ), vec2( 0, 0.1 - (2/7*3)) ];

    points = [];
    //Froskur
    points.push( froggy[0], froggy[1], froggy[2]);
    //Akreinar
    points.push( vec2(-1,-1+(2/7)), vec2(-1,-1), vec2(1,-1+(2/7)), vec2(-1,-1), vec2(1,-1+(2/7)), vec2(1,-1));
    points.push( vec2(-1,-1+(2/7)), vec2(1,-1+(2/7)));
    //Stig
    points.push( vec2(-1,1), vec2(-1, 0.8), vec2(-0.98,1), vec2(-1, 0.8), vec2(-0.98,1), vec2(-0.98,0.8) );
    //Bílar
    points.push( vec2(-0.15, -0.10), vec2(-0.15, 0.10), vec2(0.15, 0.10), vec2(0.15, -0.10) );
    speed = [-0.01, 0.02,-0.04, 0.01, -0.03];
    car = [vec2(1,-4/7), vec2(-1, -2/7), vec2(1, 0), vec2(-1, 2/7), vec2(1, 4/7)];
    for( let i = 0; i < car.length; i++ ){
      carColor.push(vec4(Math.random(), Math.random(), Math.random(), 1));
    }
    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.353, 0.729, 0.376, 1);
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );
    yhlidrun = gl.getUniformLocation( program, "yhlidrun" );
    xhlidrun = gl.getUniformLocation( program, "xhlidrun" );
    carLoc = gl.getUniformLocation( program, "carLoc" );

    xmove = 0;
    ymove = 0;

    window.addEventListener("keydown", function(e){
        console.log("event");
        switch( e.keyCode ) {
          case 37:
            xmove = -0.1;
            break;
          case 39:
            xmove = 0.1;
            break;
          case 38:
            ymove = 2/7;
            break;
          case 40:
            ymove = -2/7;
            break;
          default:
            break;
        }
        if( points[2][1] + ymove < 1 && points[2][1] + ymove > -1) {
          if( points[0][0] + xmove > -1 && points[1][0] + xmove < 1 ) {
            for(let i = 0; i < 3; i++ ){
              points[i][0] += xmove;
              points[i][1] += ymove;
            }
          }
        }
        xmove = 0;
        ymove = 0;
        if( points[2][1] > 0.9 || points[2][1] < -0.9 ){
          tempy = points[2][1];
          points[2][1] = points[0][1];
          points[0][1] = tempy;
          points[1][1] = tempy;
          stig++;
        }
    } );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform2fv( carLoc, vec2(-10,0))
    for(let i = 1; i < 6; i++) {
      gl.uniform1f( yhlidrun, (2/7)*i);
      gl.uniform4fv( colorLoc, vec4(0.463, 0.51, 0.588, 1));
      gl.drawArrays(gl.TRIANGLES, 3, 6);
      gl.uniform4fv( colorLoc, vec4(0.353, 0.729, 0.376, 1));
      gl.drawArrays(gl.LINES, 9,2);
    }
    gl.uniform1f( yhlidrun, 0 );

    gl.uniform4fv( colorLoc, vec4(0,0,0,1))
    for(let i = 0; i < stig; i++) {
      gl.uniform1f( xhlidrun, 0.03*i)
      gl.drawArrays(gl.TRIANGLES, 11, 6);
    }

    gl.uniform1f( xhlidrun, 0 );
    gl.uniform4fv( colorLoc, vec4(0.1, 0.4, 0.3, 1.0));

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    for( let i = 0; i < car.length; i++ ){
      gl.uniform4fv( colorLoc, carColor[i]);
      gl.uniform2fv( carLoc, flatten(car[i]) );
      gl.drawArrays(gl.TRIANGLE_FAN, 17, 4);
      car[i][0] += speed[i];
      if(car[i][0] < -1.15 && i%2 == 0){
        car[i][0] = 1.15;
        carColor[i] = vec4(Math.random(), Math.random(), Math.random(), 1);
      } else if(car[i][0] > 1.15 && i%2 != 0) {
        car[i][0] = -1.15
        carColor[i] = vec4(Math.random(), Math.random(), Math.random(), 1);
      }

      if( points[0][1] <= car[i][1] + 0.1 && points[0][1] >= car[i][1] - 0.1 ){
        if(car[i][0] + -0.15 < points[1][0] && car[i][0] + 0.15 > points[0][0]){
          crash = true;
        }
        if(car[i][0] + 0.15 < points[1][0] && car[i][0] + -0.15 > points[0][0]) {
          crash = true;
        }
      }
    }

    if(stig < 10 && !crash) {
      window.requestAnimationFrame(render);
    } else if(stig >= 10){
      document.getElementById("status").innerHTML = "Þú vannst";
    } else {
      document.getElementById("status").innerHTML = "Þú tapaðir";
    }
}
