uniform mat4 view_proj;
uniform mat4 model;
uniform vec4 fill_color;
uniform vec4 fog_color;
uniform float line_width;

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
	mat4 mvp = model * view_proj;
	float shade = dot(normalize(light), (model * normalize(vec4(position, 1.0))).xyz);

	gl_Position = vec4(position, 1.0) * mvp;
	gl_PointSize = 8.0;
	fog_depth = max(0.0, min(1.0, gl_Position.z / fog_dist));
	frag_fog_color = fog_color;
	frag_line_width = line_width;

	vec4 surface = vec4(fill_color.xyz, 1.0);
	// Using the alpha as a "special" flag
	if (fill_color.a == 0.0) {
		if (position.y > 0.6) {
			surface = vec4(1.0, 0.0, 1.0, 1.0);
		}
		else if (position.y > 0.1) {
			surface = vec4(0.0, 1.0, 0.5, 1.0);
		}
	}
	frag_color = surface;
	frag_barycentric = barycentric;
}
