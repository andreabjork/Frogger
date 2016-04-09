// =====================================================================================
// --------------------------------- BUTTERFLY SIMULATION ---------------------------------
// =====================================================================================
// 
//    A simulation of a box of butterflies that adhere to the ... 
//
//    I used code from Computer game Programming as back-bone for main simulation logic, 
//    especially main-loop related update-render logic as well as entity-manager.
//    The code is originally an outline provided by the teacher (Pat Kerr) that I have
//    added to in my assignments.
//
//    Andrea Björk Björnsdóttir
//    Háskóli Íslands, March 2016

// Prevent spacebar from scrolling page, esp. when console is open.
window.onkeydown = function(e) {
    if(e.keyCode == " ".charCodeAt(0) || e.keyCode == 38 || e.keyCode == 40) e.preventDefault();
}

// ================
// SIMULATION START
// ================

window.onload = function init() {
    // Set up web gl and then start the main loop:
    controller.initSliders();
    initWebgl();
    main.init();
};

// =====================
// WEB GL INITIALIZATION
// =====================

function initWebgl() {
    var canvas = document.getElementById( "gl-canvas" );
    canvas.width = window.innerWidth;
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    gl.enable(gl.DEPTH_TEST);
    
        // array element buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);


    // Color Buffer
    colors = entityManager.generateColors();
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );


    // Vertex Buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

     var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Setjum ofanvarpsfylki hÃ©r Ã­ upphafi
    var proj = perspective( 90.0, 1.0, 0.2, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    


    // AtburÃ°afÃ¶ll fyrir mÃºs
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
            spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // AtburÃ°afall fyrir lyklaborÃ°
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:    // upp Ã¶r
                zView += 0.2;
                break;
            case 40:    // niÃ°ur Ã¶r
                zView -= 0.2;
                break;
         }
     }  );  

    // AtburÃ°afall fyri mÃºsarhjÃ³l
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zView += 0.2;
         } else {
             zView -= 0.2;
         }
     }  );  


}



// ========================
// SIMULATION UPDATE-RENDER LOGIC
// ========================


function update(dt) {
    var original_dt = dt;
    // Warn about very large dt values -- they may lead to error
    //
    if (dt > 200) {
        console.log("Big dt =", dt, ": CLAMPING TO NOMINAL");
        dt = NOMINAL_UPDATE_INTERVAL;
    }
    
    // If using variable time, divide the actual delta by the "nominal" rate,
    // giving us a conveniently scaled "du" to work with.
    var du = (dt / NOMINAL_UPDATE_INTERVAL);
    
    entityManager.update(du); 
    
    g_prevUpdateDt = original_dt;
    g_prevUpdateDu = du;
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the butterfly world, i.e. the cube around the butterflies
    
    // Use the same mv as with the butterflies
    var mv = lookAt( vec3(0.0, 1.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );


    // Draw all 12 edges of the world:
    var mv1 = mult(mv, translate(0,boxRadius,-boxRadius));
    mv1 = mult(mv1, scalem(2*boxRadius+0.1,0.1,0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv2 = mult(mv, translate(0,-boxRadius,-boxRadius));
    mv2 = mult(mv2, scalem(2*boxRadius+0.1,0.1,0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv2));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv3 = mult(mv, translate(boxRadius,0,-boxRadius));
    mv3 = mult(mv3, scalem(0.1,2*boxRadius+0.1,0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv3));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv4 = mult(mv, translate(-boxRadius,0,-boxRadius));
    mv4 = mult(mv4, scalem(0.1,2*boxRadius+0.1,0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv4));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv5 = mult(mv, translate(0,boxRadius,boxRadius));
    mv5 = mult(mv5, scalem(2*boxRadius+0.1,0.1,0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv5));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv6 = mult(mv, translate(0,-boxRadius,boxRadius))
    mv6 = mult(mv6, scalem(2*boxRadius+0.1,0.1,0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv6));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv7 = mult(mv, translate(boxRadius,0,boxRadius));
    mv7 = mult(mv7, scalem(0.1,2*boxRadius+0.1,0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv7));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv8 = mult(mv, translate(-boxRadius,0,boxRadius));
    mv8 = mult(mv8, scalem(0.1,2*boxRadius+0.1,0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv8));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv9 = mult(mv, translate(boxRadius,boxRadius,0));
    mv9 = mult(mv9, scalem(0.1,0.1,2*boxRadius+0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv9));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv10 = mult(mv, translate(-boxRadius,boxRadius,0));
    mv10 = mult(mv10, scalem(0.1,0.1,2*boxRadius+0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv10));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv11 = mult(mv, translate(boxRadius,-boxRadius,0));
    mv11 = mult(mv11, scalem(0.1,0.1,2*boxRadius+0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv11));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );
    
    var mv12 = mult(mv, translate(-boxRadius,-boxRadius,0));
    mv12 = mult(mv12, scalem(0.1,0.1,2*boxRadius+0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv12));
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0 );

    // The core rendering of the actual simulation
    entityManager.render();
}


// ========
// MAINLOOP
// ========
var main = {
    // "Frame Time" is a (potentially high-precision) frame-clock for animations
    _frameTime_ms : null,
    _frameTimeDelta_ms : null,
};

// Perform one iteration of the mainloop
main.iter = function (frameTime) {
    // Use the given frameTime to update all of our simulation-clocks
    this._updateClocks(frameTime);
    // Perform the iteration core to do all the "real" work
    this._iterCore(this._frameTimeDelta_ms);
    // Request the next iteration if needed
    this._requestNextIteration();
};

main._updateClocks = function (frameTime) {
    // First-time initialisation
    if (this._frameTime_ms === null) this._frameTime_ms = frameTime;
    // Track frameTime and its delta
    this._frameTimeDelta_ms = frameTime - this._frameTime_ms;
    this._frameTime_ms = frameTime;
};

main._iterCore = function (dt) {
    // Here we could do gatherInputs();, but we will use event handlers so that's unneccessary
    update(dt);
    render();
}

// Shim for Firefox and Safari
window.requestAnimationFrame = 
    window.requestAnimationFrame ||        // Chrome
    window.mozRequestAnimationFrame ||     // Firefox
    window.webkitRequestAnimationFrame;    // Safari

// This needs to be a "global" function, for the "window" APIs to callback to
function mainIterFrame(frameTime) {
    main.iter(frameTime);
};

main._requestNextIteration = function () {
    window.requestAnimationFrame(mainIterFrame);
};

main.init = function () {
    this._requestNextIteration();
};
