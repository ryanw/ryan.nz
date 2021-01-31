uniform mat4 view_proj;
uniform mat4 model;

attribute vec3 position;
attribute vec4 color;

varying vec4 vColor;

void main(void) {
	mat4 mvp = model * view_proj;
	gl_Position = vec4(position, 1.0) * mvp;
	vColor = color;
}

