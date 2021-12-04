import { Shader } from 'toru';
import vertexSource from './snow.vert.glsl';
import fragmentSource from './snow.frag.glsl';

export class SnowShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			instanceAttributes: {
				speed: {
					type: WebGLRenderingContext.FLOAT,
					size: 1,
				},
				freq: {
					type: WebGLRenderingContext.FLOAT,
					size: 1,
				},
				model: {
					type: WebGLRenderingContext.FLOAT,
					size: 4 * 4,
				},
			},
		});
	}
}
