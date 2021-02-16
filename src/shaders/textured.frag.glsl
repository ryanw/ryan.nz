precision mediump float;

uniform vec4 uFillColor;
uniform sampler2D uTexture;
uniform sampler2D uShadow;
uniform vec3 uLightDir;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;
varying vec4 vPositionInLight;

void main(void) {
	vec3 lightColor = vec3(1.0);
	vec3 ambient = 0.1 * lightColor;


	float diff = max(dot(vNormal, uLightDir), 0.0);
	vec3 diffuse = diff * lightColor;

	vec3 viewDir = normalize(-vPosition);
	vec3 reflectDir = reflect(-uLightDir, vNormal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
	vec3 specular = 0.5 * spec * lightColor;


	vec4 texColor = texture2D(uTexture, vTexCoord);
	vec3 color = (ambient + diffuse + specular) * texColor.rgb;

	vec3 shadowPos = (vPositionInLight.xyz / vPositionInLight.w) * 0.5 + 0.5;
	vec4 shadowColor = texture2D(uShadow, vec2(shadowPos.x, shadowPos.y));

	float nearestToLight = shadowColor.r;
	float distanceFromLight = shadowPos.z;

	if (distanceFromLight < nearestToLight + 0.0001) {
		gl_FragColor = vec4(color, texColor.a);
	} else {
		gl_FragColor = vec4(color * 0.4, texColor.a);
	}
}
