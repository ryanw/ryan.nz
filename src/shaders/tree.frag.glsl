precision mediump float;

varying vec4 vFogColor;
varying float vFogDepth;
varying vec3 vBarycentric;
varying float vLineWidth;
varying vec4 vColor;

#pragma glslify: edgeDistance = require('toru/src/shaders/utils/edge_distance')

void main(void) {
	vec4 lineColor = vColor;
	vec4 faceColor = vec4(0.0, 0.0, 0.0, vColor.a);
	vec4 color;
	float d = edgeDistance(vBarycentric);
	if (d < 1.0) {
		color = mix(lineColor, faceColor, d);
	}
	else {
		color = faceColor;
	}

	gl_FragColor = mix(color, vFogColor, vFogDepth);
}
