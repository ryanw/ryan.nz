uniform vec2 resolution;
attribute vec3 position;
varying vec2 uv;

void main(void) {
	// Sky always fills the whole screen
	gl_Position = vec4(position.xy, 0.99999, 1.0);
	uv = (position.xy * resolution) / resolution.y;
}

