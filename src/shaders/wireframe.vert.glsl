uniform mat4 view_proj;
uniform mat4 model;
uniform vec4 fog_color;
uniform float line_width;

attribute vec3 position;
attribute vec3 barycentric;
attribute vec4 color;

varying vec4 frag_fog_color;
varying float fog_depth;
varying vec3 frag_barycentric;
varying float frag_line_width;
varying vec4 vColor;

float fog_dist = 1000.0;

void main(void) {
	mat4 mvp = model * view_proj;

	gl_Position = vec4(position, 1.0) * mvp;
	fog_depth = max(0.0, min(1.0, gl_Position.z / fog_dist));
	frag_fog_color = fog_color;
	frag_line_width = line_width;

	vColor = color;
	frag_barycentric = barycentric;
}
