import { Shader } from '../shader';
import vertexSource from './sprite.vert.glsl';
import fragmentSource from './sprite.frag.glsl';

export class SpriteShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			attributes: {
				uv: {
					type: WebGLRenderingContext.FLOAT,
					size: 2,
				}
			},
			uniforms: {
				uSampler: {
					type: WebGLRenderingContext.INT,
				},
			},
		});
	}
}
