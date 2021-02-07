precision mediump float;

uniform float uTime;
uniform sampler2D uSampler;

varying vec2 vTexCoord;

void main(void) {
	gl_FragColor = texture2D(uSampler, vTexCoord);
}
