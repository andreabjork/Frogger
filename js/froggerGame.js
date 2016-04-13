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
    canvas = document.getElementById( "gl-canvas" );
	levelDisplay = document.getElementById("level");
	pointsDisplay = document.getElementById("points");
	bonusPointsDisplay = document.getElementById("bpoints");
    //canvas.width = window.innerWidth;
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 230/255, 255/255, 255/255, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    // frog model
    var PR = PlyReader();
    var plyData = PR.read("froggy.ply");
    verticesFROG = plyData.points;
    normalsFROG = plyData.normals;
    // car model
    var plyData2 = PR.read("car.ply");
    verticesCAR = plyData2.points;
    normalsCAR = plyData2.normals;
    // log model
    var plyData3 = PR.read("Log_pine.ply");
    verticesLOG = plyData3.points;
    normalsLOG = plyData3.normals;
    // turtle model
    var plyData4 = PR.read("sea_turtle.ply");
    verticesTURTLE = plyData4.points;
    normalsTURTLE = plyData4.normals;


    // ==============================
    // FROG vertex and normal buffers
    // ==============================
    // normals array attribute buffer
    nBufferFROG = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferFROG );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsFROG), gl.STATIC_DRAW );

    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    nBufferCAR = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferCAR );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsCAR), gl.STATIC_DRAW );

    nBufferLOG = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferLOG );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsLOG), gl.STATIC_DRAW );

    nBufferTURTLE = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferTURTLE );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsTURTLE), gl.STATIC_DRAW );


    // array element buffer
    //var iBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    //colLoc = gl.getUniformLocation( program, "vColor" );

    // vertex array attribute buffer
    vBufferFROG = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferFROG );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesFROG), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    vBufferCAR = gl.createBuffer(); 
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferCAR );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesCAR), gl.STATIC_DRAW );

    vBufferLOG = gl.createBuffer(); 
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferLOG );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesLOG), gl.STATIC_DRAW );

    vBufferTURTLE = gl.createBuffer(); 
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferTURTLE );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesTURTLE), gl.STATIC_DRAW );

    vBufferCUBE = gl.createBuffer(); 
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferCUBE );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesCUBE), gl.STATIC_DRAW );

    colLoc = gl.getUniformLocation( program, "vColor" );


    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );
    normLoc = gl.getUniformLocation( program, "normalMatrix" );
    fRendLoc = gl.getUniformLocation( program, "fRenderType");
    vRendLoc = gl.getUniformLocation( program, "vRenderType");

    // Setjum ofanvarpsfylki hér í upphafi
	/*    var fovy = 60.0;
	var near = 0.2;
	var far = 100.0;
    var proj = perspective( fovy, 1.0, near, far );*/
    var proj = perspective( 90.0, 1.0, 0.2, 100.0);
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    



    ambLoc = gl.getUniformLocation(program, "ambientProduct");
    diffLoc = gl.getUniformLocation(program, "diffuseProduct");
    specLoc = gl.getUniformLocation(program, "specularProduct");

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(ambLoc , flatten(ambientProduct) );
    gl.uniform4fv( diffLoc, flatten(diffuseProduct) );
    gl.uniform4fv( specLoc, flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );

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

// ===============================
// GAME SCORE AND DIFFICULTY LOGIC
// ===============================

function nextLevel(){
	var levelCompletePoints = 100+bonusPoints();
	difficulty += 1;
	points += levelCompletePoints;
	
	// Update info
	levelDisplay.innerHTML = (difficulty+1);
	pointsDisplay.innerHTML = points;
	
	levelStartTime = (new Date()).getTime();
}

function bonusPoints(){
	var parTime = 15; // 15 seconds is par for the course
	var currentTime = (new Date()).getTime();
	var timeDifference = Math.round((currentTime-levelStartTime)/1000); // The time it took to complete the level
	var bonusPoints = Math.max(parTime-timeDifference,0)*100;
	return bonusPoints;
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
    
	// update bonus points view
	bonusPointsDisplay.innerHTML = bonusPoints();
	
    g_prevUpdateDt = original_dt;
    g_prevUpdateDu = du;
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // mv = lookAt( vec3(0.0, 1.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    // mv will be initialized by entity manager
    var at = vec3(0.0, 0.0, 0.0);
	var up = vec3(0.0, 1.0, 0.0);
    //mv = lookAt( vec3(0.0, 0.0, zView), at, up ); /*lookAt( vec3(this.cx*scaleConst, this.cy*scaleConst+1.5, this.cz*scaleConst+zView), // eye
               //vec3(this.cx*scaleConst, this.cy*scaleConst, this.cz*scaleConst+2.0),  // at
               //vec3(0.0, 1.0, 0.0)); // up*/
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );


    drawEnvironment();

    // The core rendering of the actual simulation
    entityManager.render();	
}

function drawEnvironment() {
    gl.uniform1i( fRendLoc, 1);
    gl.uniform1i( vRendLoc, 1);
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferCUBE );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

	var grassColor = this.color = vec4(15/255, 87/255, 15/255, 1.0);
	var waterColor = this.color = vec4(42/255, 162/255, 162/255, 1.0);
	var laneColor = this.color = vec4(38/255, 38/255, 38/255, 1.0);

	var offset = -laneDepth*scaleConst;
	var laneHeight = 4*scaleConst;
	var grassHeight = 3.9*scaleConst;
	var waterHeight = 2*scaleConst;
	var maxWorldHeight = 4*scaleConst;
	var worldRightmost = -worldWidth*scaleConst/2;
	
	var nearBankDepth = ((numCarLanes+2)*laneDepth+(numCarLanes+1)*laneSpacing)*scaleConst;
	var waterDepth = (numLogLanes*laneDepth+(numLogLanes+1)*laneSpacing)*scaleConst;
	var farBankDepth = (2*laneDepth+laneSpacing)*scaleConst;
	var laneDepthS = laneDepth*scaleConst;
	var laneSpaceS = laneSpacing*scaleConst;
	
	// Draw near-bank //with no lane spaces on both ends
	var mvNearBank = mult(mv,translate(0,-maxWorldHeight,(nearBankDepth+offset)/2));
	mvNearBank = mult(mvNearBank,scalem(worldWidth*scaleConst,grassHeight,nearBankDepth));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvNearBank));
    gl.uniform4fv(colLoc, flatten(grassColor));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
	
	// Draw car lanes
	for(var i=0; i<numCarLanes; i++){
		var mvLane = mult(mv, translate(0,-maxWorldHeight,laneDepthS*(i+1)+laneSpaceS*(i+1)+(laneDepthS+offset)/2));
		mvLane = mult(mvLane, scalem(worldWidth*scaleConst,laneHeight,laneDepthS));
		gl.uniformMatrix4fv(mvLoc, false, flatten(mvLane));
		gl.uniform4fv(colLoc, flatten(laneColor));
		gl.drawArrays(gl.TRIANGLES, 0, numVertices);
	}
	
	// Draw river //wiht lane spaces on both ends of the river
	var mvRiver = mult(mv,translate(0,-maxWorldHeight,nearBankDepth+(waterDepth+offset)/2));
	mvRiver = mult(mvRiver,scalem(worldWidth*scaleConst,waterHeight,waterDepth));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvRiver));
    gl.uniform4fv(colLoc, flatten(waterColor));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
	

	// Draw far-bank //with lane space before
	var mvFarBank = mult(mv,translate(0,-maxWorldHeight,nearBankDepth+waterDepth+(farBankDepth+offset)/2));
	mvFarBank = mult(mvFarBank,scalem(worldWidth*scaleConst,grassHeight,farBankDepth));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvFarBank));
    gl.uniform4fv(colLoc, flatten(grassColor));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
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