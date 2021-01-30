#extension GL_OES_standard_derivatives : enable

float edgeDistance(vec3 barycentric) {
	vec3 d = fwidth(barycentric);
	vec3 a = smoothstep(vec3(0.0), d * 2.0, barycentric);
	return min(min(a.x, a.y), a.z);
}

#pragma glslify: export(edgeDistance)
