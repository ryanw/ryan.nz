#extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec4 frag_color;

void main(void) {
	gl_FragColor = frag_color;
}
