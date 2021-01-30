import { Shader } from '../shader';
import vertexSource from './sky.vert.glsl';
import fragmentSource from './sky.frag.glsl';

export class SkyShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource);
	}
}
