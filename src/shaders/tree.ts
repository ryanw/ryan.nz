import { Shader } from '../shader';
import vertexSource from './tree.vert.glsl';
import fragmentSource from './tree.frag.glsl';

export class TreeShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			uniforms: {
				roadOffset: {
					type: WebGLRenderingContext.FLOAT,
				},
			},
			attributes: {
				barycentric: {
					type: WebGLRenderingContext.FLOAT,
					size: 3,
				},
				color: {
					type: WebGLRenderingContext.FLOAT,
					size: 4,
					location: null,
				},
			},
		});
	}
}
