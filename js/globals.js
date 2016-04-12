// ================
// GLOBAL VARIABLES
// ================

// Web GL gl, buffers, program etc
var gl;
var canvas;
var colLoc;
var mv;
var KILL_ME_NOW = -1;


// Grid stuff
var numLogLanes = 4;
var numCarLanes = 3;

var laneDepth = 4.0;
var worldWidth = 100.0;
var laneSpacing = 0.5;
var scaleConst = 0.1;

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
var zView = -2.0;

// Size of our world
var boxRadius = 6;

// Vertices, colors and indices
var numVertices  = 36;
var vBuffer;

var vertices = [
// Cube
    vec3( -0.5, -0.5,  0.5), // far bottom right
    vec3( -0.5,  0.5,  0.5), // far top right
    vec3(  0.5,  0.5,  0.5), // far top left
    vec3(  0.5, -0.5,  0.5), // far bottom left
    vec3( -0.5, -0.5, -0.5), // near bottom right
    vec3( -0.5,  0.5, -0.5), // near top right
    vec3(  0.5,  0.5, -0.5), // near top left
    vec3(  0.5, -0.5, -0.5)  // near bottom left

];

// indices of the 12 triangles that compise the cube
var indices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];

// keys
var g_keys = [];

// The "nominal interval" is the one that all of our time-based units are
// calibrated to e.g. a velocity unit is "pixels per nominal interval"
var NOMINAL_UPDATE_INTERVAL = 16.666;
var NOMINAL_GRAVITY = 0.52;
var TERMINAL_VELOCITY = 10.5;

// Multiply by this to convert seconds into "nominals"
var SECS_TO_NOMINALS = 1000 / NOMINAL_UPDATE_INTERVAL;

var randomInt = function(fromInt, toInt) {
    return fromInt + Math.floor(Math.random() * (toInt - fromInt + 1));
}