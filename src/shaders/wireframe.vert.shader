uniform mat4 view_proj;
uniform mat4 model;
uniform vec4 fill_color;
attribute vec3 position;
attribute vec3 normal;
varying vec4 color;

vec4 fog_color = vec4(0.0, 0.0, 0.0, 1.0);
float fog_dist = 50.0;

void main(void) {
	vec3 light = vec3(0.8, 0.4, -0.5);
	mat4 mvp = model * view_proj;
	gl_Position = vec4(position, 1.0) * mvp;
	gl_PointSize = 8.0;

	float fog = max(0.0, min(1.0, gl_Position.z / fog_dist));
	color = mix(fill_color, fog_color, fog);
}
