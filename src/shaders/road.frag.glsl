precision mediump float;

uniform float uTime;
uniform vec4 uFogColor;
uniform sampler2D uShadowMap;

varying float vFogDepth;
varying vec4 vColor;
varying vec3 vBarycentric;
varying float vDirection;
varying float vDashLength;
varying vec4 vPositionInLight;

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

	vec3 shadowPos = (vPositionInLight.xyz / vPositionInLight.w) * 0.5 + 0.5;
	bool inShadowMap = (shadowPos.x < 1.0 && shadowPos.y < 1.0 && shadowPos.x > 0.0 && shadowPos.y > 0.0);
	float shadow = texture2D(uShadowMap, vec2(shadowPos.x, shadowPos.y)).r;
	float distanceFromLight = shadowPos.z;
	if (inShadowMap && distanceFromLight > shadow + 1.0/100000.0) {
		gl_FragColor = mix(vec4(1.0, 0.0, 1.0, 1.0), uFogColor, vFogDepth);
	}
	else {
		gl_FragColor = mix(color, uFogColor, vFogDepth);
	}
}

