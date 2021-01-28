uniform mat4 view_proj;
uniform mat4 model;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 barycentric;
attribute vec2 scale;
attribute vec2 uv;

varying float fog_depth;
varying vec2 frag_uv;
varying vec2 window_space;
varying vec2 window_count;
varying float seed;
varying vec3 frag_barycentric;

float fog_dist = 1000.0;
float window_mul = 3.0;
float window_gap = 0.5;

void main(void) {

	mat4 mvp = model * view_proj;
	gl_Position = vec4(position, 1.0) * mvp;


	vec2 round_scale = floor(scale);
	window_space = vec2(window_gap) * vec2(1.0 / window_mul) * (1.0 / scale);
	window_count = vec2(window_mul) * round_scale;

	vec2 remainder = vec2(scale.x - round_scale.x, scale.y - round_scale.y);
	window_space.x += (remainder.x / scale.x) / (window_count.x + 1.0);
	window_space.y += (remainder.y / scale.y) / (window_count.y + 1.0);

	seed = scale.x * scale.y;
	fog_depth = max(0.0, min(1.0, gl_Position.z / fog_dist));
	frag_barycentric = barycentric;
	frag_uv = uv;
}

