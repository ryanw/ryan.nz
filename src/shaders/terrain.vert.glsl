uniform mat4 view_proj;
uniform mat4 model;
uniform vec4 fill_color;
uniform float road_offset;
uniform sampler2D uHeightMap;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 barycentric;

varying float fog_depth;
varying vec4 frag_color;
varying vec3 frag_barycentric;

float fog_dist = 500.0;

void main(void) {
	vec3 light = vec3(0.8, 0.4, -0.5);
	float shade = dot(normalize(light), (model * normalize(vec4(position, 1.0))).xyz);

	vec2 uv = vec2(position.x / 32.0, position.z / 16.0) * 0.5 + 0.5;
	vec4 height = texture2D(uHeightMap, uv);
	float vert = smoothstep(0.0, 1.0, height.a) * 30.0;

	vec4 pos = vec4(
		position.x,
		position.y + vert,
		position.z + fract(road_offset / 20.0),
		1.0
	);

	// Flatten near buildings
	pos.y *= smoothstep(-20.0, 0.0, pos.z);


	float grad = min(1.0, max(0.1, abs(pos.y) * 0.1));
	vec4 surface = mix(vec4(fill_color.xyz, 1.0), vec4(0.0, 1.0, 0.0, 1.0), grad);

	gl_Position = pos * model * view_proj;

	fog_depth = max(0.0, min(1.0, gl_Position.z / fog_dist));
	frag_color = surface;
	frag_barycentric = barycentric;

}
