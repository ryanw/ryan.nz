precision mediump float;

uniform float time;
uniform vec4 fog_color;

varying float fog_depth;
varying vec4 frag_color;
varying vec3 frag_barycentric;
varying float frag_direction;
varying float frag_dash_length;

float road_line_width = 0.0075;
vec4 side_color = vec4(1.0, 0.3, 0.8, 1.0);
vec4 tarmac_color = vec4(0.05, 0.0, 0.003, 1.0);
vec4 line_color = vec4(1.0, 1.0, 0.2, 1.0);

void main(void) {
	vec4 color = tarmac_color;

	// Sides
	if (frag_barycentric.x < road_line_width * 4.0) {
		color = side_color;
	} else if (
		(frag_barycentric.x > 1.0/3.0 - road_line_width && frag_barycentric.x < 1.0/3.0 + road_line_width)
		|| (frag_barycentric.x > 1.0 - 1.0/3.0 - road_line_width && frag_barycentric.x < 1.0 - 1.0/3.0 + road_line_width)
	) {
		// Dashed lines
		if (mod(frag_barycentric.y * 100.0, frag_dash_length * 5.0) > 1.5) {
			// Paint
			color = line_color;
		}
	}
	else {
	}

	gl_FragColor = mix(color, fog_color, fog_depth);
}

