var NumVertices = 36;

var zDist = -25.0;

var lastTime = performance.now();

var points = [];
var colors = [];

var vertices = [
  vec4( -0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5,  0.5,  0.5, 1.0 ),
  vec4(  0.5,  0.5,  0.5, 1.0 ),
  vec4(  0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4( -0.5,  0.5, -0.5, 1.0 ),
  vec4(  0.5,  0.5, -0.5, 1.0 ),
  vec4(  0.5, -0.5, -0.5, 1.0 )
];

var UPPER_ARM_HEIGHT = -6.0;
var UPPER_ARM_WIDTH  = 0.5;
var LOWER_ARM_HEIGHT = -6.0;
var LOWER_ARM_WIDTH  = 0.5;

var modelViewMatrix, projectionMatrix;

var UpperArm = 0;
var LowerArm = 1;

var theta= [ 0.0, 0.0 ];
var rot = [ 50.0, -10.0 ];
var maxAngle = [90.0, 45.0]

var modelViewMatrixLoc;

var vBuffer

function quad(  a,  b,  c,  d ) {
  points.push(vertices[a]); 
  points.push(vertices[b]);  
  points.push(vertices[c]); 
  points.push(vertices[a]);  
  points.push(vertices[c]); 
  points.push(vertices[d]); 
}

function colorCube() {
  quad( 1, 0, 3, 2 );
  quad( 2, 3, 7, 6 );
  quad( 3, 0, 4, 7 );
  quad( 6, 5, 1, 2 );
  quad( 4, 5, 6, 7 );
  quad( 5, 4, 0, 1 );
}

window.onload = function init() {

  canvas = document.getElementById( "gl-canvas" );
  
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }
  
  gl.viewport( 0, 0, canvas.width, canvas.height );
  
  gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
  gl.enable( gl.DEPTH_TEST ); 
  
  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  
  gl.useProgram( program );

  colorCube();
  
  // Load shaders and use the resulting shader program
  
  program = initShaders( gl, "vertex-shader", "fragment-shader" );    
  gl.useProgram( program );

  // Create and initialize  buffer objects
  
  vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
  
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

  projectionMatrix = perspective( 60.0, 1.0, 0.1, 100.0 );
  gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

  window.addEventListener("keydown", function(e){
    switch( e.keyCode ) {
      case 38:	// upp ör
           zDist += 1.0;
           break;
      case 40:	// niður ör
           zDist -= 1.0;
           break;
      case 90:	// z - snýr stöpli áfram
          if ( rot[0] < 0 ) {
            rot[0] = rot[0] - 1.0;
          } else {
            rot[0] = rot[0] + 1.0;
          }
          break;
      case 88:	// x - snýr stöpli afturábak
          if ( rot[0] < 0 ) {
            rot[0] = rot[0] + 1.0;
          } else {
            rot[0] = rot[0] - 1.0;
          }
          break;
      case 65:	// a - snýr neðri armi
          if ( rot[1] < 0 ) {
            rot[1] = rot[1] - 1.0;
          } else {
            rot[1] = rot[1] + 1.0;
          }
          break;
      case 83:	// s - snýr neðri armi
          if ( rot[1] < 0 ) {
            rot[1] = rot[1] + 1.0;
          } else {
            rot[1] = rot[1] - 1.0;
          }
          break;
      case 81:	// q - snýr efri armi
          maxAngle[0] += 5.0;
          break;
      case 87:	// w - snýr efri armi
          maxAngle[0] -= 5.0;
          break;
      case 69:
          maxAngle[1] += 5.0;
          break;
      case 82:
          maxAngle[1] -= 5.0;
          break;
    }
}  );  


  render();
}

function upperArm() {
  var s = scalem(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
  var instanceMatrix = mult(translate( 0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ),s);    
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
  gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function lowerArm()
{
    var s = scalem(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

var render = function() {

  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  let currentTime = performance.now();
  let deltaTime = (currentTime-lastTime)/1000;

  updateTheta(deltaTime);
  
  // Staðsetja áhorfanda og meðhöndla músarhreyfingu
  var mv = lookAt( vec3(0.0, 2.0, zDist), vec3(0.0, 2.0, 0.0), vec3(0.0, 1.0, 0.0) );

  mv = mult(mv, translate( 0.0, 10.0, 0.0));

  modelViewMatrix  = mult(mv, rotateZ( theta[UpperArm] ) );
  upperArm();

  modelViewMatrix = mult(modelViewMatrix, translate(0.0, UPPER_ARM_HEIGHT, 0.0)); 
  modelViewMatrix = mult(modelViewMatrix, rotateZ( theta[LowerArm] ));
  lowerArm();

  lastTime = currentTime;

  requestAnimFrame(render);
}

function updateTheta(deltaTime) {
  for(let i = 0; i < theta.length; i++) {
    newTheta = theta[i] + rot[i]*deltaTime;
    if( newTheta > maxAngle[i] || newTheta < -maxAngle[i]) {
      rot[i] = -rot[i];
      theta[i] = theta[i] + rot[i]*deltaTime;
    } else {
      theta[i] = newTheta;
    }
  }
}
