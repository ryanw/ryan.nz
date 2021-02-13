precision mediump float;

uniform vec4 uFillColor;

varying vec4 vColor;
varying vec3 vNormal;
varying vec3 vPosition;

void main(void) {
	vec3 lightColor = vec3(1.0);
	vec3 ambient = 0.1 * lightColor;


	vec3 lightPos = vec3(-0.3, 0.7, 1.0);
	vec3 lightDir = normalize(lightPos  - vPosition);
	float diff = max(dot(vNormal, lightDir), 0.0);
	vec3 diffuse = diff * lightColor;

	vec3 viewDir = normalize(-vPosition);
	vec3 reflectDir = reflect(-lightDir, vNormal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);
	vec3 specular = 0.5 * spec * lightColor;

	vec3 color = (ambient + diffuse + specular) * vColor.rgb;

	if (uFillColor.a > 0.0) {
		gl_FragColor = uFillColor;
	} else {
		gl_FragColor = vec4(color, vColor.a);
	}
}
