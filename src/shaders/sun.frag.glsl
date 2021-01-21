#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform float time;
varying vec2 frag_uv;
varying vec4 frag_color;

float map(float s, float a1, float a2, float b1, float b2) {
	return b1 + (s-a1)*(b2-b1)/(a2-a1);
}

void main(void) {
	float len = length(frag_uv);
	if (len >= 0.0) {
		float alpha = 1.0 - smoothstep(0.0, frag_color.w, map(len, 0.99, 1.0, 0.0, 1.0));
		gl_FragColor = vec4(frag_color.xyz, alpha);
	} else {
		gl_FragColor = vec4(0.0);
	}
}
