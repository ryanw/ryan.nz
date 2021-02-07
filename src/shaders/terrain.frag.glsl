precision highp float;

uniform vec4 uFogColor;
uniform float uLineWidth;

varying float vFogDepth;
varying vec4 vColor;
varying vec3 vBarycentric;

#pragma glslify: edgeDistance = require('./utils/edge_distance')

void main(void) {
	vec4 color = vec4(0.0);
	float d = edgeDistance(vBarycentric);
	if (d < 1.0) {
		color = vec4(vColor.xyz * (1.0 - d), vColor.a);
	}
	else {
		color = vec4(0.05, 0.0, 0.003, 1.0);
	}

	gl_FragColor = mix(color, uFogColor, vFogDepth);
}
