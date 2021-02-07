uniform mat4 uViewProj;
uniform mat4 uModel;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 uvs;

varying vec2 vTexCoord;

void main(void) {
	mat4 mvp = uModel * uViewProj;
	gl_Position = vec4(position, 1.0) * mvp;
	vTexCoord = position.xy;
}

