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
		// Some stripes
		float stripe = (grad + 1.0) / 2.0;
		if (
				   (stripe > 0.01 && stripe < 0.09)
				|| (stripe > 0.14 && stripe < 0.21)
				|| (stripe > 0.26 && stripe < 0.32)
				|| (stripe > 0.37 && stripe < 0.43)
				|| (stripe > 0.48 && stripe < 0.53)
				|| (stripe > 0.58 && stripe < 0.62)
				|| (stripe > 0.67 && stripe < 0.70)
				|| (stripe > 0.75 && stripe < 0.77)
				|| (stripe > 0.82 && stripe < 0.83)
			) {
			gl_FragColor = vec4(0.0);
		} else {
			grad = map(grad, 0.0, 1.0, 0.3, 1.3);
			vec3 color = mix(vec3(1.0, 0.0, 1.0), vec3(1.0, 1.0, 0.0), grad);
			gl_FragColor = vec4(color, alpha);
		}
	} else {
		gl_FragColor = vec4(0.0);
	}
}
