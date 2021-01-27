uniform mat4 view_proj;
uniform mat4 model;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 uvs;

varying vec2 frag_uv;

void main(void) {
	mat4 mvp = model * view_proj;
	gl_Position = vec4(position, 1.0) * mvp;
	frag_uv = position.xy;
}

