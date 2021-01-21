#extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec4 frag_fog_color;
varying float fog_depth;
varying vec4 frag_color;
varying vec3 frag_barycentric;
varying float frag_line_width;

float edge_distance() {
	vec3 d = fwidth(frag_barycentric);
	vec3 a = smoothstep(vec3(0.0), d * frag_line_width, frag_barycentric);
	return min(min(a.x, a.y), a.z);
}

void main(void) {
	vec4 color = vec4(0.0);
	float d = edge_distance();
	if (d < 1.0) {
		color = vec4(frag_color.xyz * (1.0 - d), frag_color.a);
	}
	else {
		color = vec4(0.05, 0.0, 0.003, 1.0);
	}

	gl_FragColor = mix(color, frag_fog_color, fog_depth);
}
