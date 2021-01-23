import { Mesh } from '../mesh';

export class Sun extends Mesh {
	constructor() {
		super();
		this.data.positions = new Float32Array(VERTICES);

		// prettier-ignore
		this.data.uvs = new Float32Array([
			-1.0, 1.0, 0.0,
			1.0, 1.0, 0.0,
			-1.0, -1.0, 0.0,

			-1.0, 1.0, 1.0,
			1.0, 1.0, 1.0,
			-1.0, -1.0, 1.0,
		]);
	}

	allocate(gl: WebGLRenderingContext) {
		if (this.isAllocated) {
			return;
		}
		super.allocate(gl);
		this.buffers.uvs = gl.createBuffer();
	}

	upload(gl: WebGLRenderingContext) {
		super.upload(gl);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uvs);
		gl.bufferData(gl.ARRAY_BUFFER, this.data.uvs, gl.DYNAMIC_DRAW);
	}
}

// prettier-ignore
const VERTICES = [
	// Near
	1.0, 1.0, 1.0,
	-1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,

	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,
];
