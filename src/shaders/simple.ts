import { Shader } from '../shader';
import vertexSource from './simple.vert.glsl';
import fragmentSource from './simple.frag.glsl';

export class SimpleShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			attributes: {
				color: {
					type: WebGLRenderingContext.FLOAT,
					size: 4,
				}
			},
		});
	}
}
