import { Shader } from '../shader';
import vertexSource from './sun.vert.glsl';
import fragmentSource from './sun.frag.glsl';

export class SunShader extends Shader {
	make(gl: WebGLRenderingContext) {
		super.make(gl, vertexSource, fragmentSource);
	}
}
