precision mediump float;

uniform float uTime;
uniform vec4 uFogColor;

varying float vFogDepth;
varying vec4 vColor;
varying vec3 vBarycentric;
varying float vDirection;
varying float vDashLength;

float road_uLineWidth = 0.0075;
vec4 side_color = vec4(1.0, 0.3, 0.8, 1.0);
vec4 tarmac_color = vec4(0.05, 0.0, 0.003, 1.0);
vec4 line_color = vec4(1.0, 1.0, 0.2, 1.0);

void main(void) {
	vec4 color = tarmac_color;

	// Sides
	if (vBarycentric.x < road_uLineWidth * 4.0) {
		color = side_color;
	} else if (
		(vBarycentric.x > 1.0/3.0 - road_uLineWidth && vBarycentric.x < 1.0/3.0 + road_uLineWidth)
		|| (vBarycentric.x > 1.0 - 1.0/3.0 - road_uLineWidth && vBarycentric.x < 1.0 - 1.0/3.0 + road_uLineWidth)
	) {
		// Dashed lines
		if (mod(vBarycentric.y * 100.0, vDashLength * 5.0) > 1.5) {
			// Paint
			color = line_color;
		}
	}
	else {
	}

	gl_FragColor = mix(color, uFogColor, vFogDepth);
}

