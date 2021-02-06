import { Shader } from '../shader';
import vertexSource from './road.vert.glsl';
import fragmentSource from './road.frag.glsl';

export class RoadShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			uniforms: {
				roadOffset: {
					type: WebGLRenderingContext.FLOAT,
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
