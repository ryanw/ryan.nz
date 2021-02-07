uniform float uTime;
uniform mat4 uViewProj;
uniform mat4 uModel;
uniform vec2 uCarPosition;

attribute vec3 position;

varying vec4 vFragColor;

void main(void) {
	mat4 carTrans = mat4(
		1.0, 0.0, 0.0, uCarPosition.x,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, uCarPosition.y,
		0.0, 0.0, 0.0, 1.0
	);

	mat4 mvp = uModel * carTrans * uViewProj;

	gl_Position = vec4(position, 1.0) * mvp;
}
