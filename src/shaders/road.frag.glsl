#extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec4 frag_fog_color;
varying float fog_depth;
varying vec4 frag_color;
varying vec3 frag_barycentric;
varying float frag_time;
float road_line_width = 0.01;

float edge_distance() {
	vec3 d = fwidth(frag_barycentric);
	vec3 a = smoothstep(vec3(0.0), d * 200.0, frag_barycentric);
	return min(min(a.x, a.y), a.z);
}

void main(void) {
	vec4 color = vec4(0.0);
	float d = edge_distance();

	if (frag_barycentric.x < road_line_width * 2.0) {
		color = vec4(0.0, 1.0, 0.0, 1.0);
	} else if (
			(frag_barycentric.x > 1.0/3.0 - road_line_width && frag_barycentric.x < 1.0/3.0 + road_line_width)
			|| (frag_barycentric.x > 1.0 - 1.0/3.0 - road_line_width && frag_barycentric.x < 1.0 - 1.0/3.0 + road_line_width)
		) {
		if (mod((frag_time / 20.0) + frag_barycentric.y * 1000.0, 30.0) < 15.0) {
			color = vec4(0.05, 0.0, 0.003, 1.0);
		} else {
			color = vec4(1.0, 0.0, 0.0, 1.0);
		}
	}
	else {
		color = vec4(0.05, 0.0, 0.003, 1.0);
	}

	gl_FragColor = mix(color, frag_fog_color, fog_depth);
}

