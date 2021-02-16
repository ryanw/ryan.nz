uniform mat4 uViewProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat4 uLight;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;
varying vec4 vPositionInLight;

void main(void) {
	mat4 mvp = uModel  * uViewProj;
	gl_Position = vec4(position, 1.0) * mvp;
	vPosition = (vec4(position, 1.0) * uModel * uView).xyz;
	vNormal = normalize((vec4(normal, 0.0) * uModel)).xyz;
	vPositionInLight = vec4(position, 1.0) * uModel * uLight;
	vTexCoord = uv;
}
