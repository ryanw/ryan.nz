uniform float time;
uniform mat4 view_proj;
uniform mat4 model;
uniform vec2 car_position;

attribute vec3 position;
attribute vec3 normal;

varying vec4 frag_color;

void main(void) {
	mat4 car_trans = mat4(
		1.0, 0.0, 0.0, car_position.x,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, car_position.y,
		0.0, 0.0, 0.0, 1.0
	);

	mat4 mvp = model * car_trans * view_proj;

	gl_Position = vec4(position, 1.0) * mvp;
}
