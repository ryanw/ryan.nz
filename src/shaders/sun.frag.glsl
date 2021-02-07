precision mediump float;

uniform float uTime;
varying vec2 vTexCoord;

#define SUN_TOP vec3(1.0, 1.0, 0.0)
#define SUN_BOTTOM vec3(1.0, 0.0, 1.0)

float map(float s, float a1, float a2, float b1, float b2) {
	return b1 + (s-a1)*(b2-b1)/(a2-a1);
}

void main(void) {
	float len = length(vTexCoord.xy);
	if (len < 1.0) {
		float alpha = 1.0 - smoothstep(0.0, 1.0, map(len, 0.99, 1.0, 0.0, 1.0));
		float grad = vTexCoord.y;
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
			gl_FragColor = vec4(0.2, 0.05, 0.4, 1.0);
		} else {
			grad = map(grad, 0.0, 1.0, 0.3, 1.3);
			vec3 color = mix(SUN_BOTTOM, SUN_TOP, grad);
			gl_FragColor = vec4(color, alpha);
		}
	}
	else {
		gl_FragColor = vec4(0.0);
	}
}
