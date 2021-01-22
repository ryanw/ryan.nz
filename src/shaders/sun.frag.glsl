#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform float time;
varying vec3 frag_uv;
varying vec4 frag_color;

float map(float s, float a1, float a2, float b1, float b2) {
	return b1 + (s-a1)*(b2-b1)/(a2-a1);
}

void main(void) {
	float len = length(frag_uv.xy);
	if (len >= 0.0) {
		float alpha = 1.0 - smoothstep(0.0, frag_color.w, map(len, 0.99, 1.0, 0.0, 1.0));
		float grad = frag_uv.y;
		if (frag_uv.z > 0.99) {
			grad *= -1.0;
		}
		grad = map(grad, 0.0, 1.0, 0.3, 1.3);
		vec3 color = mix(vec3(1.0, 0.0, 1.0), vec3(1.0, 1.0, 0.0), grad);
		gl_FragColor = vec4(color, alpha);
	} else {
		gl_FragColor = vec4(0.0);
	}
}
