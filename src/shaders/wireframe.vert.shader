uniform mat4 view_proj;
uniform mat4 model;
attribute vec3 position;
varying vec4 color;

void main(void) {
	//mat4 mvp = view_proj * model;
	//gl_Position = mvp * vec4(position, 1.0);
	gl_Position = vec4(position * 0.5, 1.0);
	//color = (vec4(position, 1.0) * 0.5 + 0.5) * (2.0 - (gl_Position.z / 1.5));
	color = vec4(0.1, 0.2, 0.0, 1.0);
}
