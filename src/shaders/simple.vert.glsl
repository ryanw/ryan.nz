uniform mat4 uViewProj;
uniform mat4 uView;
uniform mat4 uModel;

attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;

varying vec4 vColor;
varying vec3 vNormal;
varying vec3 vPosition;

void main(void) {
	mat4 mvp = uModel  * uViewProj;
	gl_Position = vec4(position, 1.0) * mvp;
	vColor = color;
	vPosition = (vec4(position, 1.0) * uModel * uView).xyz;
	vNormal = normalize((vec4(normal, 0.0) * uModel)).xyz;
}
