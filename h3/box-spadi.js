/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun á lyklaborðsatburðum til að hreyfa spaða
//
//    Hjálmtýr Hafsteinsson, september 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var box = vec2(0.0,0.0);
var dX;
var dY;

var maxX = 1.0;
var maxY = 1.0;

var boxRad = 0.05;
var vertices = [vec2(-0.03, -0.05), vec2(0.03, -0.05), vec2(0.03, 0.05), vec2(-0.03, 0.05)];


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    dX = Math.random()*0.1-0.05;
    dY = Math.random()*0.1-0.05;
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    vertices.push(
        vec2( -0.1, -0.9 ),
        vec2( -0.1, -0.86 ),
        vec2(  0.1, -0.86 ),
        vec2(  0.1, -0.9 ) 
    );
    console.log(vertices);
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locBox = gl.getUniformLocation( program, "boxPos" );

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 37:	// vinstri ör
                xmove = -0.06;
                break;
            case 39:	// hægri ör
                xmove = 0.06;
                break;
            case 38: // upp ör
                xmove = 0.0;
                dX *= 1.1;
                dY *= 1.1;
                break;
            case 40: //niður ör
                xmove = 0.0;
                dX /= 1.1;
                dY /= 1.1;
                break;
            default:
                xmove = 0.0;
        }
        for(i=4; i<8; i++) {
            vertices[i][0] += xmove;
        }

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    } );

    render();
}


function render() {
  // Láta ferninginn skoppa af veggjunum
  if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
  if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY;
  if ( (box[0] + dX > vertices[4][0]-boxRad && box[0] + dX < vertices[6][0]+boxRad) &&
       (box[1] + dY < vertices[5][1] + boxRad) ){
    dY = -dY;
  }

  // Uppfæra staðsetningu
  box[0] += dX;
  box[1] += dY;

  gl.uniform2fv( locBox, flatten(box) );
    
  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

  gl.uniform2fv( locBox, vec2(0.0,0.0) );

  gl.drawArrays( gl.TRIANGLE_FAN, 4, 4 );
  

  window.requestAnimFrame(render);
}
