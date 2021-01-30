import { Mesh } from '../mesh';

// prettier-ignore
const FACE_UV = [
	1.0, 1.0,
	0.0, 1.0,
	1.0, 0.0,

	0.0, 0.0,
	1.0, 0.0,
	0.0, 1.0,
];

function createScale(width: number, height: number): number[] {
	return [
			width, height,
			width, height,
			width, height,
			width, height,
			width, height,
			width, height,
	];
}

export class Building extends Mesh {
	constructor(width: number = 1, height: number = 1, depth: number = 1) {
		super();
		this.data.positions = new Float32Array(CUBE_VERTICES);

		// Every face has the same UVs
		this.data.uvs = new Float32Array([
			// Far
			...FACE_UV,

			// Near
			...FACE_UV,

			// Left
			...FACE_UV,

			// Right
			...FACE_UV,

			// Top
			...FACE_UV,

			// Bottom
			...FACE_UV,
		]);

		this.data.scales = new Float32Array([
			// Near
			...createScale(width, height),

			// Far
			...createScale(width, height),

			// Left
			...createScale(depth, height),

			// Right
			...createScale(depth, height),

			// Top
			...createScale(0, 0),

			// Bottom
			...createScale(0, 0),
		]);

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
				barycentrics.push(1.0);
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
		this.buffers.uv = gl.createBuffer();
		this.buffers.scale = gl.createBuffer();
	}

	upload(gl: WebGLRenderingContext) {
		super.upload(gl);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv);
		gl.bufferData(gl.ARRAY_BUFFER, this.data.uvs, gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.scale);
		gl.bufferData(gl.ARRAY_BUFFER, this.data.scales, gl.DYNAMIC_DRAW);
	}
}

// prettier-ignore
const CUBE_VERTICES = [
	// Far
	-1.0, 1.0, -1.0,
	1.0, 1.0, -1.0,
	-1.0, -1.0, -1.0,

	1.0, -1.0, -1.0,
	-1.0, -1.0, -1.0,
	1.0, 1.0, -1.0,

	// Near
	1.0, 1.0, 1.0,
	-1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,

	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,

	// Left
	-1.0, 1.0, 1.0,
	-1.0, 1.0, -1.0,
	-1.0, -1.0, 1.0,

	-1.0, -1.0, -1.0,
	-1.0, -1.0, 1.0,
	-1.0, 1.0, -1.0,

	// Right
	1.0, 1.0, -1.0,
	1.0, 1.0, 1.0,
	1.0, -1.0, -1.0,

	1.0, -1.0, 1.0,
	1.0, -1.0, -1.0,
	1.0, 1.0, 1.0,

	// Top
	1.0, 1.0, -1.0,
	-1.0, 1.0, -1.0,
	1.0, 1.0, 1.0,

	-1.0, 1.0, 1.0,
	1.0, 1.0, 1.0,
	-1.0, 1.0, -1.0,

	// Bottom
	1.0, -1.0, -1.0,
	1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,

	-1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,
	1.0, -1.0, 1.0,
];
