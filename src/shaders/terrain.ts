import { Shader } from '../shader';
import vertexSource from './terrain.vert.glsl';
import fragmentSource from './terrain.frag.glsl';

export class TerrainShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource, {
			uniforms: {
				roadOffset: {
					type: WebGLRenderingContext.FLOAT,
				},
			},
		});
	}
}