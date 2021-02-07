import { Shader } from '../shader';
import vertexSource from './building.vert.glsl';
import fragmentSource from './building.frag.glsl';

export class BuildingShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			attributes: {
				// Determines how many windows will fit
				scale: {
					type: WebGLRenderingContext.FLOAT,
					size: 2,
				},
				uv: {
					type: WebGLRenderingContext.FLOAT,
					size: 2,
				},
				barycentric: {
					type: WebGLRenderingContext.FLOAT,
					size: 3,
				},
			},
		});
	}
}
