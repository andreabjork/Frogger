// =====================================================================================
// ------------------------------------ FROGGER GAME -----------------------------------
// =====================================================================================
// 
//    Frogger game for Computer Graphics.
//
//    Andrea Björk Björnsdóttir & Leó Jóhannsson
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
    initWebgl();
    main.init();
};



// =========
// KEY STUFF
// =========

function handleKeydown(evt) {
    g_keys[evt.keyCode] = true;
}

function handleKeyup(evt) {
    g_keys[evt.keyCode] = false;
}

// Inspects, and then clears, a key's state
//
// This allows a keypress to be "one-shot" e.g. for toggles
// ..until the auto-repeat kicks in, that is.
//
function eatKey(keyCode) {
    var isDown = g_keys[keyCode];
    g_keys[keyCode] = false;
    return isDown;
}

// A tiny little convenience function
function keyCode(keyChar) {
    return keyChar.charCodeAt(0);
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);

// =====================
// WEB GL INITIALIZATION
// =====================

function initWebgl() {
    var canvas = document.getElementById( "gl-canvas" );
    //canvas.width = window.innerWidth;
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 0.5 );
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    gl.enable(gl.DEPTH_TEST);
    
    // array element buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    colLoc = gl.getUniformLocation( program, "vColor" );

    // vertex array attribute buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Setjum ofanvarpsfylki hér í upphafi
    var proj = perspective( 90.0, 1.0, 0.2, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    


    // Atburðaföll fyrir mús
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

    // Atburðafall fyri músarhjól
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zView += 0.2;
         } else {
             zView -= 0.2;
         }
     }  );  


}



// ========================
// GAME UPDATE-RENDER LOGIC
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


    // mv = lookAt( vec3(0.0, 1.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    // mv will be initialized by entity manager
    
    
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );
    drawEnvironment();

    // The core rendering of the actual simulation
    entityManager.render();
}

function drawEnvironment() {
	var grassColor = this.color = vec4(144/255, 212/255, 145/255, 1.0);
	var waterColor = this.color = vec4(144/255, 172/255, 212/255, 1.0);

	var laneHeight = 4*scaleConst;
	var grassHeight = 3.5*scaleConst;
	var waterHeight = 3*scaleConst;
	var maxWorldHeight = 4*scaleConst;
	
	var nearBankDepth = ((numCarLanes+2)*laneDepth+(numCarLanes+1)*laneSpacing)*scaleConst;
	var waterDepth = nearBankDepth+(10);
	var farBankDepth = 0;
	
	// Draw near-bank
	var mvNearBank = mult(mv,translate(0,-maxWorldHeight,(nearBankDepth-laneDepth*scaleConst)/2));
	mvNearBank = mult(mvNearBank,scalem(worldWidth*scaleConst,grassHeight,nearBankDepth));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvNearBank));
    gl.uniform4fv(colLoc, flatten(grassColor));
    gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
	
	
	var mvRiver = mult(mv,mat4());
	var mvFarBank = mult(mv,mat4());
    return;
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