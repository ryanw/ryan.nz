import { Mesh } from '../mesh';

export class Road extends Mesh {
	constructor() {
		super();
		this.data.positions = new Float32Array(VERTICES);
		this.data.direction = new Float32Array([1, 1, 1, 0, 0, 0]);
		this.uniforms = { roadOffset: 0.0 };

		const barycentrics = [];
		for (let i = 0; i < this.data.positions.length / 3; i++) {
			if (i % 3 === 0) {
				barycentrics.push(1.0);
				barycentrics.push(0.0);
				barycentrics.push(0.0);
			} else if (i % 3 === 1) {
				barycentrics.push(0.0);
				barycentrics.push(1.0);
				barycentrics.push(0.0);
			} else {
				barycentrics.push(0.0);
				barycentrics.push(0.0);
				barycentrics.push(1.0);
			}
		}
		this.data.barycentrics = new Float32Array(barycentrics);
	}

	allocate(gl: WebGLRenderingContext) {
		if (this.isAllocated) {
			return;
		}
		super.allocate(gl);
		this.buffers.direction = gl.createBuffer();
	}

	upload(gl: WebGLRenderingContext) {
		super.upload(gl);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.direction);
		gl.bufferData(gl.ARRAY_BUFFER, this.data.direction, gl.DYNAMIC_DRAW);
	}
}

// prettier-ignore
const VERTICES = [
	// Top
	-1.0, 1.0, -1.0,
	1.0, 1.0, 1.0,
	1.0, 1.0, -1.0,

	1.0, 1.0, 1.0,
	-1.0, 1.0, -1.0,
	-1.0, 1.0, 1.0,
];
