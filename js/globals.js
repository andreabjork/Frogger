// ================
// GLOBAL VARIABLES
// ================

// Web GL gl, buffers, program etc
var gl;
var canvas;
var cBuffer;
var vBuffer;
var program;


// Location of projection and model-view matrices
var proLoc;
var mvLoc;

// Vars for mouse interaction and rotation
var movement = false;     // Er mÃºsarhnappur niÃ°ri?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

// Viewpoint
var zView = -8.0;

// Size of our world
var boxRadius = 6;

// Vertices, colors and indices
var NumVertices  = 16;
// HnÃºtar eins vÃ¦ngs sem liggur Ã­ xz-planinu
var vertices = [
//  Butterfly wings
    vec4( 0.0, 0.0, -0.5, 1.0 ), // efri hluti buks
    vec4(0.15, 0.0, -0.75, 1.0), // topppunktur á efri væng
    vec4(0.35, 0.0, -0.90, 1.0), // topp punktur á efri væng
    vec4(0.55, 0.0, -0.95, 1.0), // topppunktur á efri væng
    vec4( 0.80,  0.0, -0.95, 1.0 ), // hæsta horn, efri vængur  
    vec4( 0.70, 0.0, -0.75, 1.0 ), // hlið á efri væng
    vec4( 0.65, 0.0, -0.45, 1.0 ), // hlið á efri vængur
    vec4(0.55, 0.0, -0.35, 1.0),
    vec4(0.25, 0.0, -0.3, 1.0), // crease
    vec4(0.55, 0.0, -0.25, 1.0),
    vec4( 0.60, 0.0, -0.1, 1.0 ),  // fjólublár
    vec4( 0.60, 0.0, 0.1, 1.0 ), 
    vec4( 0.40,  0.0,  0.35, 1.0 ), // lægsta horn, neðri vængur
    vec4( 0.35,  0.0,  0.25, 1.0 ),
    vec4( 0.15,  0.0,  0.15, 1.0 ),
    vec4( 0.0, 0.0, 0.0, 1.0 ), // neðri hluti búks
// -------------------------------
// Cube for body
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )

];

// indices of the 12 triangles that compise the cube
var indices = [
    1+NumVertices, 0+NumVertices, 3+NumVertices,
    3+NumVertices, 2+NumVertices, 1+NumVertices,
    2+NumVertices, 3+NumVertices, 7+NumVertices,
    7+NumVertices, 6+NumVertices, 2+NumVertices,
    3+NumVertices, 0+NumVertices, 4+NumVertices,
    4+NumVertices, 7+NumVertices, 3+NumVertices,
    6+NumVertices, 5+NumVertices, 1+NumVertices,
    1+NumVertices, 2+NumVertices, 6+NumVertices,
    4+NumVertices, 5+NumVertices, 6+NumVertices,
    6+NumVertices, 7+NumVertices, 4+NumVertices,
    5+NumVertices, 4+NumVertices, 0+NumVertices,
    0+NumVertices, 1+NumVertices, 5+NumVertices
];

// Litir hnútanna, upphafsstillt i butterflyWorld
var colors;



// The "nominal interval" is the one that all of our time-based units are
// calibrated to e.g. a velocity unit is "pixels per nominal interval"
var NOMINAL_UPDATE_INTERVAL = 16.666;
var NOMINAL_GRAVITY = 0.52;
var TERMINAL_VELOCITY = 10.5;


// Multiply by this to convert seconds into "nominals"
var SECS_TO_NOMINALS = 1000 / NOMINAL_UPDATE_INTERVAL;



angle = function(v1, v2){
    var cosTheta = dot(v1,v2)/(length(v1)*length(v2));
    return (360/(2*Math.PI))*Math.acos(cosTheta);
}
