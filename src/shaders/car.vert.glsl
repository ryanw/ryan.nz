uniform float time;
uniform mat4 view_proj;
uniform mat4 model;
uniform vec4 fill_color;

attribute vec3 position;
attribute vec3 normal;

varying vec4 frag_color;

void main(void) {
	mat4 mvp = model * view_proj;
	vec3 offset_position = position;
	offset_position.x += sin(time / 1000.0);

	gl_Position = vec4(offset_position, 1.0) * mvp;

	frag_color = fill_color;
}
