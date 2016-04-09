/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops 
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/

var entityManager = {

// "PRIVATE" DATA

//_environment   : [],
_butterflies : [],
_butterflyID : 0,

// "PRIVATE" METHODS

_forEachOf: function(aCategory, fn) {
    for (var i = 0; i < aCategory.length; ++i) {
        fn.call(aCategory[i]);
    }
},

// PUBLIC METHODS

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    this.resetAll();
    //this.generateEnvironment();
    this.generateButterflies(controller.numButterflies);
    this._categories = [this._butterflies];
},

resetAll: function() {
    //this._environment = [];
    this._butterflies = [];
},

/*

generateEnvironment : function(descr) {
    this._environment.push(new Environment());
},*/


generateColors : function() {
    var A = vec4(Math.random(), Math.random(), Math.random(), 1.0);
    var B = vec4(Math.random(), Math.random(), Math.random(), 1.0);
    var C = vec4(Math.random(), Math.random(), Math.random(), 1.0);
    return [
        A,
        B,
        C,
        A,
        A,
        C,
        B,
        C,
        B,
        A,
        B,
        A,
        B,
        C,
        A,
        A,
        // Colors for cube
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 0.0, 0.0, 0.0, 1.0 )  // black
    ];
},


generateButterflies : function(n) {
    for(var i=0; i<n; i++) {
        // Generate a random location in the world
        var x = Math.random()*2*boxRadius;
        var y = Math.random()*2*boxRadius;
        var z = Math.random()*2*boxRadius;
        // Generate a random direction
        var rx = Math.random()*2-1;
        var ry = Math.random()*2-1;
        var rz = Math.random()*2-1;
        // Generate a random velocity
        var vel = Math.max(Math.random()*0.05, 0.02);
        // Finally, generate a random angle for the wings to start
        var rotWing = Math.random()*120.0 - 85.0; //[-85;35]
        var incWing = 2; 
        this._butterflies.push(new Butterfly({cx: x, cy: y, cz: z, rx: rx, ry: ry, rz: rz, vel: vel, rotWing:rotWing, incWing: incWing, colors: this.generateColors(), id: this._butterflyID}));
        this._butterflyID++;  
    }
},

killButterflies : function(n) {
    for(var i=0; i<n; i++) {
        this._butterflies.pop();
    }
},


updateButterflies : function() {
    var n = controller.numButterflies;
    if(this._butterflies.length < n) {
        this.generateButterflies(n - this._butterflies.length);
    }else{
        this.killButterflies(this._butterflies.length-n);
    }
},
/*
getOtherButterflyPositions : function(myButterfly) {
    var allVecs = [];
    for(var i=0; i < this._butterflies.length; i++) {
        var butterfly = this._butterflies[i];
        if(butterfly != myButterfly) allVecs.push(vec3(butterfly.cx, butterfly.cy, butterfly.cz));
    }
    console.log("OTHER BUTTERFLIES ??? "+allVecs.length);
    return allVecs;

},*/

// For getting only the positions of butterflies that our butterfly can 'see'
getButterflyPositionsInRange : function(myButterfly) {
    var allVecs = [];
    var myButterFlyPos = vec3(myButterfly.cx, myButterfly.cy, myButterfly.cz)
    for(var i=0; i < this._butterflies.length; i++) {
        var butterfly = this._butterflies[i];
        var butterflyPos = vec3(butterfly.cx, butterfly.cy, butterfly.cz)
        var dist = length(subtract(butterflyPos, myButterFlyPos)); 
        if(butterfly.id != myButterfly.id && dist < controller.range) allVecs.push(butterflyPos);
    }
    return allVecs;
    
},
/*
getOtherButterflyDirections : function(myButterfly) {
    var allVecs = [];
    for(var i=0; i < this._butterflies.length; i++) {
        var butterfly = this._butterflies[i];
        if(butterfly != myButterfly && dist < controller.range) allVecs.push(vec3(butterfly.rx, butterfly.ry, butterfly.rz));
    }
    return allVecs;

},*/


// For getting only the positions of butterflies that our butterfly can 'see'
getButterflyDirectionsInRange : function(myButterfly) {
    var allVecs = [];
    var myButterFlyPos = vec3(myButterfly.cx, myButterfly.cy, myButterfly.cz)
    for(var i=0; i < this._butterflies.length; i++) {
        var butterfly = this._butterflies[i];
        var butterflyPos = vec3(butterfly.cx, butterfly.cy, butterfly.cz)
        var dist = length(subtract(butterflyPos, myButterFlyPos)); 
        if(butterfly.id != myButterfly.id && dist < controller.range) allVecs.push(vec3(butterfly.rx, butterfly.ry, butterfly.rz));
    }
    return allVecs;
},


init: function() {

    for (var c = 0; c < this._categories.length; ++c) {
        var aCategory = this._categories[c];
        for (var i = 0; i < aCategory.length; ++i) {
            console.log(aCategory[i]);
            aCategory[i].init();
        }
    }
},



update: function(du) {
    for (var c = 0; c < this._categories.length; ++c) {
        var aCategory = this._categories[c];
        var i = 0;
        while (i < aCategory.length) {
            var status = aCategory[i].update(du);
            ++i;
        }
    }
},

render: function(gl) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {
            aCategory[i].render();
        }
    }
}

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();
