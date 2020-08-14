uniform mat4 view_proj;
uniform mat4 model;
attribute vec3 position;
varying vec4 color;


float map(float s, float a1, float a2, float b1, float b2) {
    return b1 + (s-a1)*(b2-b1)/(a2-a1);
}

void main(void) {
	mat4 mvp = model * view_proj ;
	gl_Position = vec4(position, 1.0) * mvp;
  float alpha = (1.0 - gl_Position.z / 3.0);
	color = vec4(
      map(position.y, -1.0, 1.0, 0.0, 0.7),
      map(position.y, -1.0, 1.0, 0.5, 0.7),
      map(position.y, -1.0, 1.0, 0.7, 0.0),
      alpha
    );
}
