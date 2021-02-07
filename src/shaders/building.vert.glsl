uniform mat4 uViewProj;
uniform mat4 uModel;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 barycentric;
attribute vec2 scale;
attribute vec2 uv;

varying float vFogDepth;
varying vec2 vTexCoord;
varying vec2 vWindowSpace;
varying vec2 vWindowCount;
varying vec3 vBarycentric;
varying float vSeed;

#define FOG_DIST 1000.0
#define WINDOW_MUL 3.0
#define WINDOW_GAP 0.5

void main(void) {
	// FIXME rounding off to avoid floating point errors
	vSeed = floor(scale.x * scale.y * 10000.0);

	mat4 mvp = uModel * uViewProj;
	gl_Position = vec4(position, 1.0) * mvp;

	vec2 roundScale = floor(scale);
	vWindowSpace = vec2(WINDOW_GAP) * vec2(1.0 / WINDOW_MUL) * (1.0 / scale);
	vWindowCount = vec2(WINDOW_MUL) * roundScale;

	vec2 remainder = vec2(scale.x - roundScale.x, scale.y - roundScale.y);
	vWindowSpace.x += (remainder.x / scale.x) / (vWindowCount.x + 1.0);
	vWindowSpace.y += (remainder.y / scale.y) / (vWindowCount.y + 1.0);

	vFogDepth = max(0.0, min(1.0, gl_Position.z / FOG_DIST));
	vBarycentric = barycentric;
	vTexCoord = uv;
}

