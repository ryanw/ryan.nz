uniform vec2 uResolution;

attribute vec3 position;

varying vec2 vTexCoord;

void main(void) {
	// Sky always fills the whole screen
	gl_Position = vec4(position.xy, 0.99999, 1.0);
	vTexCoord = (position.xy * uResolution) / uResolution.y;
}

