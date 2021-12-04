precision highp float;

uniform vec4 uFogColor;
uniform float uLineWidth;
uniform sampler2D uShadowMap;
uniform vec3 uLightDir;

varying float vFogDepth;
varying vec4 vColor;
varying vec3 vBarycentric;
varying vec4 vPositionInLight;

#pragma glslify: edgeDistance = require('toru/src/shaders/utils/edge_distance')

void main(void) {
	vec4 color = vec4(0.0);
	float d = edgeDistance(vBarycentric);
	if (d < 1.0) {
		color = vec4(vColor.xyz * (1.0 - d), vColor.a);
	}
	else {
		color = vec4(0.05, 0.0, 0.003, 1.0);
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
