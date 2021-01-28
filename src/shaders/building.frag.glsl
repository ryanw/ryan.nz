#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform vec4 fill_color;
uniform vec4 fog_color;
varying float fog_depth;
varying vec2 frag_uv;
varying vec2 window_space;
varying vec2 window_count;
varying float seed;
varying vec3 frag_barycentric;

highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = seed + 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

float edge_distance() {
	vec3 d = fwidth(frag_barycentric);
	vec3 a = smoothstep(vec3(0.0), d * 2.0, frag_barycentric);
	return min(min(a.x, a.y), a.z);
}

void main(void) {
	vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
	float step_x = mod(frag_uv.x, (1.0 - window_space.x) / window_count.x);
	float step_y = mod(frag_uv.y, (1.0 - window_space.y) / window_count.y);
	float win_x = floor(frag_uv.x * window_count.x);
	float win_y = floor(frag_uv.y * window_count.y);

	vec2 win_coord = vec2(win_x, win_y);
	if (frag_uv != vec2(0.0) && step_x > window_space.x && step_y > window_space.y && rand(win_coord) > 0.6) {
		gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
	}
	else {
		float d = edge_distance();
		if (d < 1.0) {
			color = vec4(frag_uv.y, 0.0, frag_uv.y, 1.0);
		}
		else {
			color = vec4(0.05, 0.0, 0.003, 1.0);
		}
		gl_FragColor = mix(color, fog_color, fog_depth);
	}
}
