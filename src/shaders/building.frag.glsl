precision highp float;

uniform vec4 uFillColor;
uniform vec4 uFogColor;

varying float vFogDepth;
varying vec2 vTexCoord;
varying vec2 vWindowSpace;
varying vec2 vWindowCount;
varying vec3 vBarycentric;
varying float vSeed;

#define WINDOW_COLOR vec4(0.9, 0.9, 0.3, 1.0)
#define BUILDING_COLOR vec4(0.05, 0.0, 0.003, 1.0)
#define EDGE_COLOR vec4(1.0, 0.0, 1.0, 1.0)

#pragma glslify: rand = require('toru/src/shaders/utils/rand')
#pragma glslify: edgeDistance = require('toru/src/shaders/utils/edge_distance')

void main(void) {
	// FIXME rounding off to avoid floating point errors
	float seed = floor(0.5 + vSeed) / 10000.0;

	vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
	float step_x = mod(vTexCoord.x, (1.0 - vWindowSpace.x) / vWindowCount.x);
	float step_y = mod(vTexCoord.y, (1.0 - vWindowSpace.y) / vWindowCount.y);
	float win_x = floor(vTexCoord.x * vWindowCount.x);
	float win_y = floor(vTexCoord.y * vWindowCount.y);

	vec2 win_coord = vec2(win_x, win_y);
	float d = edgeDistance(vBarycentric);
	if (d < 1.0) {
		color = EDGE_COLOR * vTexCoord.y;
		color.a = 1.0;
		gl_FragColor = mix(color, uFogColor, vFogDepth);
	}
	else if (vTexCoord != vec2(0.0) && step_x > vWindowSpace.x && step_y > vWindowSpace.y && rand(win_coord, seed) > 0.6) {
		color = WINDOW_COLOR;
		gl_FragColor = color;
	}
	else {
		color = BUILDING_COLOR;
		gl_FragColor = mix(color, uFogColor, vFogDepth);
	}
}

