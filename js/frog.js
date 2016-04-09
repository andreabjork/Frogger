/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Fiðrildi sem blakar vængjunum.  Hægt er að snúa með
//     músinni og færa til með upp- og niður-örvum (eða
//     músarhjóli).
//
//    Hjálmtýr Hafsteinsson, febrúar 2016
/////////////////////////////////////////////////////////////////

// -------------------
// BUTTERFLY PROTOTYPE
// -------------------

function Butterfly(descr) {
   // Must give this butterfly (cx, cy, cz) location, (rx, ry, rz) direction, velocity vel and rotWing wing angle.
   this.setup(descr);
}

Butterfly.prototype.setup = function (descr) {
    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
};



// -------
// GENERAL
// -------
// ---------------
// COLLISION LOGIC
// ---------------


// -------------
// UPDATE RENDER
// -------------
Butterfly.prototype.update = function(du) {
    var currDir = vec3(this.rx, this.ry, this.rz);
    var newDir = flockAlgorithm.updateDirection(this);
    var a = angle(currDir, newDir);
    if(a > 15) newDir = normalize(add(currDir, scale(0.01, newDir)));

    this.rx = newDir[0];
    this.ry = newDir[1];
    this.rz = newDir[2];

    this.cx += this.rx*this.vel;
    this.cy += this.ry*this.vel;
    this.cz += this.rz*this.vel;



    // TODO : Create a better wrapper
    if(this.cx >= boxRadius) this.cx -= 2*boxRadius;
    else if(this.cx <= -boxRadius) this.cx += 2*boxRadius;

    if(this.cy >= boxRadius) this.cy -= 2*boxRadius;
    else if(this.cy <= -boxRadius) this.cy += 2*boxRadius;

    if(this.cz >= boxRadius) this.cz -= 2*boxRadius;
    else if(this.cz <= -boxRadius) this.cz += 2*boxRadius;

    this.rotWing += this.incWing;
    if( this.rotWing > 35.0  || this.rotWing < -85.0 )
        this.incWing *= -1;
    
}

var xzAngle;
Butterfly.prototype.render = function() {
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW );
    // lookAt(eye, at, up)
    var mv = lookAt( vec3(0.0, 1.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );

    // TRANSLATE - ROTATE - SCALE in the coordinate system of the butterfly:
    // Translate to position
    mv = mult( mv, translate(this.cx, this.cy, this.cz));
    // Rotate the butterfly so that it has the same direction as it's 
    // directional vector (rx, ry, rz)
    xzAngle = 180-(360/(2*Math.PI))*Math.atan(this.rx/this.rz);
    if(this.rz < 0) xzAngle = 180+xzAngle; 
    mv = mult( mv, rotateY(xzAngle));
    /*yzAngle = 180-(360/(2*Math.PI))*Math.atan(this.ry/this.rz);
    if(this.rz < 0) yzAngle = 180+yzAngle;
    mv = mult( mv, rotateX(yzAngle));*/
    mv = mult( mv, rotateX(-30));
    // Teikna einn vÃ¦ng
    var mv1 = mult( mv, rotateZ( this.rotWing ) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, NumVertices );

    // Teikna hinn vÃ¦nginn (speglaÃ°ann)
    var mv2 = mult( mv, rotateZ( -this.rotWing ) );
    mv2 = mult( mv2, scalem( -1.0, 1.0, 1.0 ) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv2));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, NumVertices );

        // Draw the body
    var mv3 = mult(mv, translate(0,0,-0.25));
    mv3 = mult(mv3, scalem(0.03,0.03,0.5));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv3));
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);

    // Draw the head 
    var mv4 = mult(mv, translate(0,0,-0.55));
    mv4 = mult(mv4, scalem(0.1,0.1,0.1));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv4));
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);

    // Draw one antenna
    var mv5 = mult(mv, translate(0.03,0,-0.65));
    mv5 = mult(mv5, rotateY(20));
    mv5 = mult(mv5, scalem(0.01,0.02,0.3));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv5));
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
    
    // Draw the other antenna mirrored
    var mv6 = mult(mv, translate(-0.03,0,-0.65));
    mv6 = mult(mv6, rotateY(-20));
    mv6 = mult(mv6, scalem(0.01,0.02,0.3));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv6));
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);

}

