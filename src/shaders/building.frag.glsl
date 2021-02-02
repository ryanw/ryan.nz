precision highp float;

uniform vec4 fill_color;
uniform vec4 fog_color;
varying float fog_depth;
varying vec2 frag_uv;
varying vec2 window_space;
varying vec2 window_count;
varying vec3 frag_barycentric;
varying float vSeed;

#define WINDOW_COLOR vec4(0.9, 0.9, 0.3, 1.0)
#define BUILDING_COLOR vec4(0.05, 0.0, 0.003, 1.0)
#define EDGE_COLOR vec4(1.0, 0.0, 1.0, 1.0)

#pragma glslify: rand = require('./utils/rand')
#pragma glslify: edgeDistance = require('./utils/edge_distance')

void main(void) {
	// FIXME rounding off to avoid floating point errors
	float seed = floor(0.5 + vSeed) / 10000.0;

	vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
	float step_x = mod(frag_uv.x, (1.0 - window_space.x) / window_count.x);
	float step_y = mod(frag_uv.y, (1.0 - window_space.y) / window_count.y);
	float win_x = floor(frag_uv.x * window_count.x);
	float win_y = floor(frag_uv.y * window_count.y);

	vec2 win_coord = vec2(win_x, win_y);
	float d = edgeDistance(frag_barycentric);
	if (d < 1.0) {
		color = EDGE_COLOR * frag_uv.y;
		color.a = 1.0;
		gl_FragColor = mix(color, fog_color, fog_depth);
	}
	else if (frag_uv != vec2(0.0) && step_x > window_space.x && step_y > window_space.y && rand(win_coord, seed) > 0.6) {
		color = WINDOW_COLOR;
		gl_FragColor = color;
	}
	else {
		color = BUILDING_COLOR;
		gl_FragColor = mix(color, fog_color, fog_depth);
	}
}

