import { Shader } from 'toru';
import vertexSource from './road.vert.glsl';
import fragmentSource from './road.frag.glsl';

export class RoadShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			uniforms: {
				uRoadOffset: {
					type: WebGLRenderingContext.FLOAT,
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
				direction: {
					size: 1,
					type: WebGLRenderingContext.FLOAT,
				},
				barycentric: {
					type: WebGLRenderingContext.FLOAT,
					size: 3,
				},
			},
		});
	}
}
