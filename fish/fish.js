/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Wíragrindarteningur teiknaður tvisvar frá mismunandi
//     sjónarhorni til að fá víðsjónaráhrif (með gleraugum)
//
//    Hjálmtýr Hafsteinsson, október 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 24;
var SOME_SMALL_THRESHOLD = 0.01

var points = [];
var colors = [];

var vBuffer;
var vPosition;

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var incFin = [];

var zDist = -4.0;

var proLoc;
var mvLoc;

var lastTime = performance.now();

// the 8 vertices of the cube
var v = [
    vec4( -1.0, -1.0,  1.0, 1.0 ),
    vec4( -1.0,  1.0,  1.0, 1.0 ),
    vec4(  1.0,  1.0,  1.0, 1.0 ),
    vec4(  1.0, -1.0,  1.0, 1.0 ),
    vec4( -1.0, -1.0, -1.0, 1.0 ),
    vec4( -1.0,  1.0, -1.0, 1.0 ),
    vec4(  1.0,  1.0, -1.0, 1.0 ),
    vec4(  1.0, -1.0, -1.0, 1.0 )
];

var lines = [ v[0], v[1], v[1], v[2], v[2], v[3], v[3], v[0],
              v[4], v[5], v[5], v[6], v[6], v[7], v[7], v[4],
              v[0], v[4], v[1], v[5], v[2], v[6], v[3], v[7],
               // líkami (spjald)
              vec4( -0.1,  0.0, 0.0, 1.0 ),
              vec4(  0.04,  0.04, 0.0, 1.0 ),
              vec4(  0.1,  0.0, 0.0, 1.0 ),
              vec4(  0.1,  0.0, 0.0, 1.0 ),
              vec4(  0.04, -0.03, 0.0, 1.0 ),
              vec4( -0.1,  0.0, 0.0, 1.0 ),
              // sporður (þríhyrningur)
              vec4( -0.1,  0.0, 0.0, 1.0 ),
              vec4( -0.13,  0.03, 0.0, 1.0 ),
              vec4( -0.13, -0.03, 0.0, 1.0 ),
              // uggi
              vec4( 0.0, 0.0, 0.0, 1.0 ),
              vec4( -0.03, 0.0, 0.04, 1.0),
              vec4( 0.03, 0.0, 0.04, 1.0 )
            ];

var fishSpeed = [];
var fishLoc = [];
var fishColor = [];
var finRot = [];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    for(let i = 0; i < 10; i++){
      fishSpeed.push(vec3(Math.random(),Math.random(),Math.random()));
      
      fishLoc.push(vec3(Math.random(),Math.random(),Math.random()));

      fishColor.push(vec4(Math.random(),Math.random(),Math.random(),1.0));

      let rotStart = Math.random()*35;
      let rotdir = 1;
      if(Math.floor(rotStart)%2 == 0){
        rotdir = -1;
      }
      finRot.push(rotStart*rotdir);
      incFin.push(2.0);
    }

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(lines), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "wireColor" );
    
    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    var proj = perspective( 50.0, 1.0, 0.2, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    
    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.offsetX - origX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp ör
                zDist += 0.1;
                break;
            case 40:	// niður ör
                zDist -= 0.1;
                break;
         }
     }  );  

    // Event listener for mousewheel
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zDist += 0.1;
         } else {
             zDist -= 0.1;
         }
     }  );  
    
    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Auga
    var mv = lookAt( vec3(0.0, 0.0, zDist),
                      vec3(0.0, 0.0, zDist+2.0),
                      vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, mult( rotateX(spinX), rotateY(spinY) ) );

    //Kassi
    gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    let currentTime = performance.now();
    let deltaTime = (currentTime-lastTime)/1000;
    for( let i = 0; i < fishLoc.length; i++){
      finRot[i] += incFin[i];
      if( finRot[i] > 35.0  || finRot[i] < -35.0 )
          incFin[i] *= -1;

      let fmv = mult(mv, translate(fishLoc[i]));

      let direction = normalize(fishSpeed[i]);

      let originalDirection = vec3(1.0,0.0,0.0);
      let dotProduct = dot(originalDirection, direction);
      let angle = Math.acos(dotProduct);

      let originalDirection3 = vec3(1, 0, 0);
      let rotationAxis = cross(originalDirection3, direction);
      rotationAxis = normalize(rotationAxis);

      let rotationMatrix = rotate(angle*180/Math.PI, rotationAxis);

      fmv = mult(fmv, rotationMatrix);

	    gl.uniform4fv( colorLoc, fishColor[i] );

	    // Teikna líkama fisks (án snúnings)
      gl.uniformMatrix4fv(mvLoc, false, flatten(fmv));
      gl.drawArrays( gl.TRIANGLES, 24, 6 );

      umv = mult(fmv, rotateX( finRot[i] ));

      gl.uniformMatrix4fv(mvLoc, false, flatten(umv));
      gl.drawArrays(gl.TRIANGLES, 33, 3 );

      umv = mult(umv, scalem(1.0, 1.0, -1.0 ));
      gl.uniformMatrix4fv(mvLoc, false, flatten(umv));
      gl.drawArrays(gl.TRIANGLES, 33, 3 );

      // Teikna sporð og snúa honum
	    fmv = mult( fmv, translate ( -0.1, 0.0, 0.0 ) );
      fmv = mult( fmv, rotateY( finRot[i] ) );
  	  fmv = mult( fmv, translate ( 0.1, 0.0, 0.0 ) );
	
      gl.uniformMatrix4fv(mvLoc, false, flatten(fmv));
      gl.drawArrays( gl.TRIANGLES, 30, 3 );

      let sep = separation(i);
      let align = alignment(i);
      let co = cohesion(i);
      co = add(co, negate(fishLoc[i]));

      let force = add(scale(1/7,sep), add(scale(3/7,align), scale(3/7,co)));

      newSpeed = add(fishSpeed[i],force);
      if (length(newSpeed) > SOME_SMALL_THRESHOLD) {
        fishSpeed[i] = newSpeed;
      }

      fishLoc[i] = add(fishLoc[i], scale(deltaTime, fishSpeed[i]));

      if( fishLoc[i][0] < -0.95){
        fishSpeed[i][0] = -fishSpeed[i][0];
        fishLoc[i][0] = -0.9;
      } else if(fishLoc[i][0] > 0.95 ) {
        fishSpeed[i][0] = -fishSpeed[i][0];
        fishLoc[i][0] = 0.9;
      }
      if( fishLoc[i][1] < -0.95){
        fishSpeed[i][1] = -fishSpeed[i][1];
        fishLoc[i][1] = -0.9;
      } 
      else if(fishLoc[i][1] > 0.95 ) {
        fishSpeed[i][1] = -fishSpeed[i][1];
        fishLoc[i][1] = 0.9;
      }
      if( fishLoc[i][2] < -0.95){
        fishSpeed[i][2] = -fishSpeed[i][2];
        fishLoc[i][2] = -0.9;
      } 
      else if(fishLoc[i][2] > 0.95 ) {
        fishSpeed[i][2] = -fishSpeed[i][2];
        fishLoc[i][2] = 0.9;
      }
    }
    lastTime = currentTime;

    window.requestAnimationFrame( render );
}

function separation(fish){
  let dir = [];
  let val = [];
  for(let i = 0; i < fishLoc.length; i++){
      if( i != fish ){
        dir.push(normalize(add(fishLoc[fish],negate(fishLoc[i]))));
        val.push(length(add(fishLoc[fish],negate(fishLoc[i]))));
      }
  }

  let vec = vec3();
  for(let i = 0; i < dir.length; i++){
    if(val[i] != 0){
      vec = add(vec, scale(1/val[i], dir[i]));
    }
  }

  vec = scale(1/9, vec);
  return vec;
}

function alignment(fish){
  let vec = vec3();
  for(let i = 0; i < fishSpeed.length; i++){
    if( i != fish ){
      vec = add(vec, fishSpeed[i]);
    }
  }

  vec = scale(1/9, vec);
  return vec;
}

function cohesion(fish){
  let loc = vec3();
  for(let i = 0; i < fishLoc.length; i++){
    if( i != fish ){
      loc = add(loc, fishLoc[i]);
    }
  }

  loc = scale(1/9, loc);
  return loc;
}