uniform float time;
uniform mat4 view_proj;
uniform mat4 model;
uniform vec4 fill_color;
uniform vec4 fog_color;
uniform float line_width;
uniform float road_offset;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 barycentric;

varying vec4 frag_fog_color;
varying float fog_depth;
varying vec4 frag_color;
varying vec3 frag_barycentric;
varying float frag_line_width;

float fog_dist = 700.0;

void main(void) {
	vec3 light = vec3(0.8, 0.4, -0.5);
	float shade = dot(normalize(light), (model * normalize(vec4(position, 1.0))).xyz);

	mat4 road_trans = mat4(
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, mod(road_offset, 20.0),
		0.0, 0.0, 0.0, 1.0
	);

	mat4 mvp = model * road_trans * view_proj;
	gl_Position = vec4(position, 1.0) * mvp;

	fog_depth = max(0.0, min(1.0, gl_Position.z / fog_dist));
	frag_fog_color = fog_color;
	frag_line_width = line_width;

	vec4 surface = vec4(fill_color.xyz, 1.0);
	// Using the alpha as a "special" flag
	if (fill_color.a == 0.0) {
		float grad = min(1.0, max(0.1, abs(position.y) * 0.1));
		surface = mix(surface, vec4(0.0, 1.0, 0.0, 1.0), grad);
		surface.w = 1.0;
	}
	frag_color = surface;
	frag_barycentric = barycentric;
}
