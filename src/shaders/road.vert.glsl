uniform float road_offset;
uniform mat4 view_proj;
uniform mat4 model;
uniform vec4 fill_color;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 barycentric;
attribute float direction;

varying float fog_depth;
varying vec4 frag_color;
varying vec3 frag_barycentric;
varying float frag_direction;
varying float frag_dash_length;

float fog_dist = 700.0;
float dash_length = 0.6;

void main(void) {
	vec3 light = vec3(0.8, 0.4, -0.5);
	float shade = dot(normalize(light), (model * normalize(vec4(position, 1.0))).xyz);

	mat4 road_trans = mat4(
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, mod(road_offset, dash_length * 40.0),
		0.0, 0.0, 0.0, 1.0
	);

	mat4 mvp = model * road_trans * view_proj;

	gl_Position = vec4(position, 1.0) * mvp;
	fog_depth = max(0.0, min(1.0, gl_Position.z / fog_dist));

	vec4 surface = vec4(fill_color.xyz, 1.0);
	frag_color = surface;
	frag_barycentric = barycentric;
	frag_direction = direction;
	frag_dash_length = dash_length;
}

