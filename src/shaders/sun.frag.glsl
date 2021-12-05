precision highp float;

uniform float uTime;
varying vec2 vTexCoord;

#define SUN_TOP vec3(1.0, 1.0, 0.0)
#define SUN_BOTTOM vec3(1.0, 0.0, 1.0)
#define STRIPE_COLOR vec4(0.2, 0.05, 0.4, 1.0)
#define STRIPE_COUNT 10

float map(float s, float a1, float a2, float b1, float b2) {
	return b1 + (s-a1)*(b2-b1)/(a2-a1);
}

void main(void) {
	float len = length(vTexCoord.xy);
	float grad = vTexCoord.y;
	if (len < 1.0) {
		float alpha = 1.0 - smoothstep(0.0, 1.0, map(len, 0.99, 1.0, 0.0, 1.0));
		// Some stripes
		bool hit = false;
		for (int i = 0; i < STRIPE_COUNT; i++) {
			float stripe = (grad + 1.0) / 2.0;
			float stripeOffset = uTime / 20000.0;
			stripeOffset += float(i) * 0.1;
			stripeOffset = mod(stripeOffset, 1.0);
			stripeOffset = max(0.0, stripeOffset);
			stripeOffset = min(1.0, stripeOffset);
			stripeOffset = 1.0 - pow(1.0 - stripeOffset, 3.0);
			float thickness = (1.0 - stripeOffset) * 0.07;
			thickness = ceil((thickness * 3000.0)+0.1) / 3000.0;
			if (!hit && stripe >= stripeOffset - thickness && stripe <= stripeOffset + thickness) {
				gl_FragColor = STRIPE_COLOR;
				hit = true;
				break;
			}
		}
		if (!hit) {
			grad = map(vTexCoord.y, 0.0, 1.0, 0.3, 1.3);
			vec3 color = mix(SUN_BOTTOM, SUN_TOP, grad);
			gl_FragColor = vec4(color, alpha);
		}
	}
	else {
		gl_FragColor = vec4(0.0);
	}
}
