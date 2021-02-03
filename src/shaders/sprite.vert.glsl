uniform mat4 view_proj;
uniform mat4 model;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vTexCoord;

void main(void) {
	mat4 mvp = model * view_proj;
	gl_Position = vec4(position, 1.0) * mvp;
	vTexCoord = uv;
}

