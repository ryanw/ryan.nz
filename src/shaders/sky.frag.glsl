precision highp float;

uniform float time;
uniform float seed;
varying vec2 uv;

mat2 rotation(float angle) {
	float s = sin(angle);
	float c = cos(angle);

	return mat2(c, -s, s, c);
}

float star(vec2 uv, float flare) {
	float d = length(uv);
	float m = 0.02 / d;

	float rays = max(0.0, 0.6 - abs(uv.x * uv.y * 3000.0));
	m += rays * flare;

	uv *= rotation(3.1415 / 4.0);
	rays = max(0.0, 0.3 - abs(uv.x * uv.y * 6000.0));
	m += rays * 0.4 * flare;

	m *= smoothstep(0.3, 0.0, d);

	return m;
}

#pragma glslify: rand = require('./utils/rand', seed=seed)

void main(void) {
	vec4 color = vec4(vec3(1.0), 0.0);
	vec2 pixel = uv * 6.0;

	vec2 gv = fract(pixel) - 0.5;
	vec2 id = floor(pixel);

	for (int y = -1; y <= 1; y++) {
		for (int x = -1; x <= 1; x++) {
			vec2 tile = vec2(x, y);

			// Some 'random' numbers
			float r0 = rand(id + tile);
			float r1 = fract(r0 * 12.34);
			float r2 = fract(r1 * 12.34);
			float r3 = fract(r2 * 12.34);

			vec2 starOffset = vec2(r0, r1);
			float twinkle = sin(r2 * (time / 300.0)) * 0.5 + 0.5;
			float size = r3 * mix(0.7, 1.0, twinkle);

			color.a += star(gv - tile - starOffset + 0.5, smoothstep(0.5, 1.0, size)) * size;
		}
	}

	gl_FragColor = color;
}
