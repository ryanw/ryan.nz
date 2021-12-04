precision mediump float;

varying vec4 vFogColor;
varying float vFogDepth;
varying vec3 vBarycentric;
varying float vLineWidth;
varying vec4 vFaceColor;
varying vec4 vWireColor;

#pragma glslify: edgeDistance = require('toru/src/shaders/utils/edge_distance')

void main(void) {
	vec4 color;
	float d = edgeDistance(vBarycentric);
	if (d < 1.0) {
		color = mix(vWireColor, vFaceColor, d);
	}
	else {
		color = vFaceColor;
	}

	gl_FragColor = mix(color, vFogColor, vFogDepth);
}
