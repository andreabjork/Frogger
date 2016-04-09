// GENERIC RENDERING
function render(gl) {
    // Don't render if game is paused:
    if (g_shouldSkipRender) return;

    gl.clear( gl.COLOR_BUFFER_BIT );

    // The core rendering of the actual game / simulation
    //
    if (g_doRender) entityManager.render(gl);
}