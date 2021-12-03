uniform mat4 uViewProj;
uniform mat4 uModel;
uniform float uTime;

attribute float speed;
attribute float freq;
attribute mat4 model;
attribute vec3 position;

varying vec2 vTexCoord;

void main(void) {
	vec4 pos = vec4(position, 1.0) * model * uModel;
	pos /= pos.w;
	pos.y = mod(pos.y - (uTime / 200.0) * speed, 70.0);
	pos.x += sin((uTime / 500.0) * freq) * 10.0;
	pos.z += mod(uTime * 0.02 * speed, 100.0);
	gl_Position = pos * uViewProj;
	vTexCoord = position.xy;
}

