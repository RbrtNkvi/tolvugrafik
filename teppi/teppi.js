"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 7;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, 1 ),
        vec2( 1, 1),
        vec2( -1, -1 ),
        vec2( 1, -1)
    ];

    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
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

    render();
};

function square( a, b, c, d )
{
    points.push( a, b, c );
    points.push( b, c, d );
}

function divideSquare( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        square( a, b, c, d );
    }
    else {

        //bisect the sides a-ab-ba-b
        //                 ac      bd        
        //                 ca      db
        //                 c-cd-dc-d
        var ab = mix( a, b, 1/3 );
        var ba = mix( a, b, 2/3 );
        var ac = mix( a, c, 1/3 );
        var ca = mix( a, c, 2/3 );
        var dc = mix( d, c, 1/3 );
        var cd = mix( d, c, 2/3 );
        var bd = mix( b, d, 1/3 );
        var db = mix( b, d, 2/3 );
        var am = vec2( ab[0], ac[1] );
        var bm = vec2( ba[0], bd[1] );
        var cm = vec2( cd[0], ca[1] );
        var dm = vec2( dc[0], db[1] );

        --count;

        // three new triangles

        divideSquare( a, ab, ac, am, count );
        divideSquare( ab, ba, am, bm, count);
        divideSquare( ba, b, bm, bd, count );
        divideSquare( bm, bd, dm, db, count);
        divideSquare( ca, cm, c, cd, count );
        divideSquare( cm, dm, cd, dc, count);
        divideSquare( dm, db, dc, d, count );
        divideSquare( ac, am, ca, cm, count);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
