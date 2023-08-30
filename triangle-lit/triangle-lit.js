var gl;
var points;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var vertices = [ vec2( -0.1, -0.1 ), vec2( 0.1, -0.1 ), vec2( 0, 0.1 ) ];

    var points = [];
    for( let i = 0; i < 100; i++ ){
      var hlidrunx = Math.random();
      var hlidruny = Math.random();
      
      var merkix = Math.random();
      if( merkix < 0.5 ){
        hlidrunx = -1*hlidrunx;
      }
      var merkiy = Math.random();
      if( merkiy < 0.5 ){
        hlidruny = -1*hlidruny;
      }
      var hlidrun = vec2(hlidrunx, hlidruny);
      
      p1 = add(vertices[0], hlidrun);
      p2 = add(vertices[1], hlidrun);
      p3 = add(vertices[2], hlidrun);
      points.push(p1,p2,p3)
    }

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
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
    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    let n = 100
    for( let i = 0; i < n; i++){
      gl.uniform4fv( colorLoc, vec4(Math.random(),Math.random(),Math.random(), 1.0));
      gl.drawArrays( gl.TRIANGLES, 3*i, 3 );
    }
}
