uniform mat4 uViewProj;
uniform mat4 uModel;
uniform vec4 uFogColor;
uniform float uLineWidth;

attribute vec3 position;
attribute vec3 barycentric;
attribute vec4 color;

varying vec4 vFogColor;
varying float vFogDepth;
varying vec3 vBarycentric;
varying float vLineWidth;
varying vec4 vColor;

float fog_dist = 1000.0;

void main(void) {
	mat4 mvp = uModel * uViewProj;

	gl_Position = vec4(position, 1.0) * mvp;
	vFogDepth = max(0.0, min(1.0, gl_Position.z / fog_dist));
	vFogColor = uFogColor;
	vLineWidth = uLineWidth;

	vColor = color;
	vBarycentric = barycentric;
}
