import { Mesh } from '../mesh';

export class Cube extends Mesh {
	constructor() {
		super();
		this.positions = new Float32Array(CUBE_VERTICES);

		const barycentrics = [];
		for (let i = 0; i < this.positions.length / 3; i++) {
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
		this.barycentrics = new Float32Array(barycentrics)
	}
}

export class WireCube extends Mesh {
	constructor() {
		super();
		this.positions = new Float32Array(WIRE_CUBE_VERTICES);
	}

	draw(gl: WebGLRenderingContext) {
		gl.drawArrays(gl.LINES, 0, this.vertexCount);
	}
}

const CUBE_VERTICES = [
	-1.0, -1.0, -1.0,
	-1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,

	1.0, 1.0, -1.0,
	-1.0, -1.0, -1.0,
	-1.0, 1.0, -1.0,

	1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,
	1.0, -1.0, -1.0,

	1.0, 1.0, -1.0,
	1.0, -1.0, -1.0,
	-1.0, -1.0, -1.0,

	-1.0, -1.0, -1.0,
	-1.0, 1.0, 1.0,
	-1.0, 1.0, -1.0,

	1.0, -1.0, 1.0,
	-1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,

	-1.0, 1.0, 1.0,
	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,

	1.0, 1.0, 1.0,
	1.0, -1.0, -1.0,
	1.0, 1.0, -1.0,

	1.0, -1.0, -1.0,
	1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,

	1.0, 1.0, 1.0,
	1.0, 1.0, -1.0,
	-1.0, 1.0, -1.0,

	1.0, 1.0, 1.0,
	-1.0, 1.0, -1.0,
	-1.0, 1.0, 1.0,

	1.0, 1.0, 1.0,
	-1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,
]; 

const WIRE_CUBE_VERTICES = [
	// Front
	1.0, 1.0, 1.0,
	-1.0, 1.0, 1.0,

	-1.0, 1.0, 1.0,
	-1.0, -1.0, 1.0,

	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,

	1.0, -1.0, 1.0,
	1.0, 1.0, 1.0,

	// Back
	1.0, 1.0, -1.0,
	-1.0, 1.0, -1.0,

	-1.0, 1.0, -1.0,
	-1.0, -1.0, -1.0,

	-1.0, -1.0, -1.0,
	1.0, -1.0, -1.0,

	1.0, -1.0, -1.0,
	1.0, 1.0, -1.0,


	// Left
	-1.0, 1.0, 1.0,
	-1.0, 1.0, -1.0,

	-1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,

	// Right
	1.0, 1.0, 1.0,
	1.0, 1.0, -1.0,

	1.0, -1.0, 1.0,
	1.0, -1.0, -1.0,
]; 
