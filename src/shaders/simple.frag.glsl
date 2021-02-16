precision mediump float;

uniform float uTime;
uniform vec4 uFillColor;
uniform sampler2D uShadow;
uniform vec3 uLightDir;

varying vec4 vColor;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 vPositionInLight;
varying vec2 vTexCoord;

void main(void) {
	vec3 lightColor = vec3(1.0);
	vec3 ambient = 0.1 * lightColor;


	float diff = max(dot(vNormal, uLightDir), 0.0);
	vec3 diffuse = diff * lightColor;

	vec3 viewDir = normalize(-vPosition);
	vec3 reflectDir = reflect(-uLightDir, vNormal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);
	vec3 specular = 0.5 * spec * lightColor;

	vec3 color = (ambient + diffuse + specular) * vColor.rgb;


	vec3 shadowPos = (vPositionInLight.xyz / vPositionInLight.w) * 0.5 + 0.5;
	vec4 shadowColor = texture2D(uShadow, vec2(shadowPos.x, shadowPos.y));

	float nearestToLight = shadowColor.r;
	float distanceFromLight = shadowPos.z;

	if (uFillColor.a > 0.0) {
		gl_FragColor = uFillColor;
		if (distanceFromLight < nearestToLight + 0.00001) {
			// In light
			gl_FragColor = vec4(uFillColor.rgb, vColor.a);
		} else {
			// In shadow
			gl_FragColor = vec4(uFillColor.rgb * 0.2, vColor.a);
		}
	} else {
		gl_FragColor = vec4(color, vColor.a);
	}
}
