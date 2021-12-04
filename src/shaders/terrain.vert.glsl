uniform mat4 uViewProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat4 uLight;
uniform vec4 uFillColor;
uniform float uRoadOffset;
uniform sampler2D uHeightMap;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 barycentric;

varying float vFogDepth;
varying vec4 vColor;
varying vec3 vBarycentric;
varying vec4 vPositionInLight;

float fog_dist = 500.0;

void main(void) {
	vec2 uv = vec2(position.x / 32.0, position.z / 16.0) * 0.5 + 0.5;
	vec4 height = texture2D(uHeightMap, uv);
	float vert = smoothstep(0.0, 1.0, height.a) * 30.0;

	vec4 pos = vec4(
		position.x,
		position.y + vert,
		position.z + fract(uRoadOffset / 20.0),
		1.0
	);

	// Flatten near buildings
	pos.y *= smoothstep(-20.0, 0.0, pos.z);


	float grad = min(1.0, max(0.1, abs(pos.y) * 0.1));
	vec4 surface = mix(vec4(uFillColor.xyz, 1.0), vec4(0.0, 1.0, 0.0, 1.0), grad);

	gl_Position = pos * uModel * uViewProj;

	vFogDepth = max(0.0, min(1.0, gl_Position.z / fog_dist));
	vColor = surface;
	vBarycentric = barycentric;
	vPositionInLight = pos * uModel * uLight;
}
