precision mediump float;

varying vec2 vTexCoord;

void main(void) {
	float a = 1.0 - length(vTexCoord);
	gl_FragColor = vec4(1.0, 1.0, 1.0, a);
}
