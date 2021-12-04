import { Shader } from 'toru';
import vertexSource from './tree.vert.glsl';
import fragmentSource from './tree.frag.glsl';

export class TreeShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			uniforms: {
				uRoadOffset: {
					type: WebGLRenderingContext.FLOAT,
				},
			},
			attributes: {
				barycentric: {
					type: WebGLRenderingContext.FLOAT,
					size: 3,
				},
				faceColor: {
					type: WebGLRenderingContext.FLOAT,
					size: 4,
					location: null,
				},
				wireColor: {
					type: WebGLRenderingContext.FLOAT,
					size: 4,
					location: null,
				},
			},
			instanceAttributes: {
				model: {
					type: WebGLRenderingContext.FLOAT,
					size: 4 * 4,
					location: null,
				},
			},
		});
	}
}
