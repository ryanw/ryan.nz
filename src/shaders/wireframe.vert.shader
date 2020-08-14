uniform mat4 view_proj;
uniform mat4 model;
attribute vec3 position;
varying vec4 color;

void main(void) {
	mat4 mvp = model * view_proj ;
	gl_Position = vec4(position, 1.0) * mvp;
  float alpha = (1.0 - gl_Position.z / 10.0);
	color = vec4(0.2, 0.4, 0.0, alpha);
}
