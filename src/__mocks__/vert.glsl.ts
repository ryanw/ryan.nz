const glsl = `
// Mock Vertex Shader
uniform mat4 uViewProj;
uniform mat4 uModel;

attribute vec3 position;
attribute vec4 color;

varying vec4 vColor;

void main(void) {
	mat4 mvp = uModel * uViewProj;
	gl_Position = vec4(position, 1.0) * mvp;
	vColor = color;
}

`;
export default glsl;
