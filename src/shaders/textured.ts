import { Shader } from '../shader';
import vertexSource from './textured.vert.glsl';
import fragmentSource from './textured.frag.glsl';

export class TexturedShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			attributes: {
				color: {
					type: WebGLRenderingContext.FLOAT,
					size: 4,
				},
				normal: {
					type: WebGLRenderingContext.FLOAT,
					size: 3,
				},
				uv: {
					type: WebGLRenderingContext.FLOAT,
					size: 2,
				},
			},
			uniforms: {
				uTexture: {
					type: WebGLRenderingContext.INT,
				},
				uLight: {
					type: WebGLRenderingContext.FLOAT_MAT4,
				},
				uLightDir: {
					type: WebGLRenderingContext.FLOAT_VEC3,
				},
				uShadow: {
					type: WebGLRenderingContext.INT,
				},
			},
		});
	}
}
