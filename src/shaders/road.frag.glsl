#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform float time;
varying vec4 frag_fog_color;
varying float fog_depth;
varying vec4 frag_color;
varying vec3 frag_barycentric;
varying float frag_direction;

float road_line_width = 0.0075;
vec4 side_color = vec4(1.0, 0.3, 0.8, 1.0);
vec4 tarmac_color = vec4(0.05, 0.0, 0.003, 1.0);
vec4 line_color = vec4(1.0, 0.7, 0.8, 1.0);

void main(void) {
	vec4 color = tarmac_color;
	float road_offset = (time / 200.0);


	if (frag_direction > 0.9999) {
		road_offset *= -1.0;
	}

	// Sides
	if (frag_barycentric.x < road_line_width * 4.0) {
		color = side_color;
	} else if (
		(frag_barycentric.x > 1.0/3.0 - road_line_width && frag_barycentric.x < 1.0/3.0 + road_line_width)
		|| (frag_barycentric.x > 1.0 - 1.0/3.0 - road_line_width && frag_barycentric.x < 1.0 - 1.0/3.0 + road_line_width)
	) {
		// Dashed lines
		if (mod(road_offset + frag_barycentric.y * 100.0, 3.0) > 1.5) {
			// Paint
			color = line_color;
		}
	}
	else {
	}

	gl_FragColor = mix(color, frag_fog_color, fog_depth);
}

