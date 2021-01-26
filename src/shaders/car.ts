import { Shader } from '../shader';
import vertexSource from './car.vert.glsl';
import fragmentSource from './car.frag.glsl';

export class CarShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			uniforms: {
				carPosition: {
					type: WebGLRenderingContext.FLOAT_VEC2,
				},
			},
		});
	}
}
