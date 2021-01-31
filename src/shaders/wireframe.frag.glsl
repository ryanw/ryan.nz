precision mediump float;

varying vec4 frag_fog_color;
varying float fog_depth;
varying vec3 frag_barycentric;
varying float frag_line_width;
varying vec4 vColor;

#pragma glslify: edgeDistance = require('./utils/edge_distance')

void main(void) {
	vec4 lineColor = vColor;
	vec4 faceColor = vec4(0.0, 0.0, 0.0, vColor.a);
	vec4 color;
	float d = edgeDistance(frag_barycentric);
	if (d < 1.0) {
		color = mix(lineColor, faceColor, d);
	}
	else {
		color = faceColor;
	}

	gl_FragColor = mix(color, frag_fog_color, fog_depth);
}
