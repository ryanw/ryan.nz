import { Shader } from 'toru';
import vertexSource from './terrain.vert.glsl';
import fragmentSource from './terrain.frag.glsl';

export class TerrainShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			uniforms: {
				uRoadOffset: {
					type: WebGLRenderingContext.FLOAT,
				},
				uHeightMap: {
					type: WebGLRenderingContext.INT,
				},
				uLight: {
					type: WebGLRenderingContext.FLOAT_MAT4,
				},
				uLightDir: {
					type: WebGLRenderingContext.FLOAT_VEC3,
				},
				uShadowMap: {
					type: WebGLRenderingContext.INT,
				},
			},
			attributes: {
				barycentric: {
					type: WebGLRenderingContext.FLOAT,
					size: 3,
				},
			},
		});
	}
}
