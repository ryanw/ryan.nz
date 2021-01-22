uniform mat4 view_proj;
uniform mat4 model;
uniform vec4 fill_color;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 barycentric;

varying vec4 frag_color;
varying vec3 frag_uv;

void main(void) {
	mat4 mvp = model * view_proj;

	gl_Position = vec4(position, 1.0) * mvp;
	gl_PointSize = 8.0;

	frag_uv = barycentric.xyz;
	frag_color = vec4(fill_color.xyz, 1.0);
}

