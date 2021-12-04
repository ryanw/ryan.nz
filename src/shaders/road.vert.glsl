uniform mat4 uViewProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat4 uLight;
uniform vec4 uFillColor;
uniform float uRoadOffset;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 barycentric;
attribute float direction;

varying float vFogDepth;
varying vec4 vColor;
varying vec3 vBarycentric;
varying float vDirection;
varying float vDashLength;
varying vec4 vPositionInLight;

#define FOG_DIST 700.0
#define DASH_LENGTH 0.6

void main(void) {
	mat4 roadTrans = mat4(
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, mod(uRoadOffset, DASH_LENGTH * 40.0),
		0.0, 0.0, 0.0, 1.0
	);

	mat4 mvp = uModel * roadTrans * uViewProj;

	gl_Position = vec4(position, 1.0) * mvp;
	vFogDepth = max(0.0, min(1.0, gl_Position.z / FOG_DIST));

	vec4 surface = vec4(uFillColor.xyz, 1.0);
	vColor = surface;
	vBarycentric = barycentric;
	vDirection = direction;
	vDashLength = DASH_LENGTH;
	vPositionInLight = vec4(position, 1.0) * uModel * roadTrans * uLight;
}

