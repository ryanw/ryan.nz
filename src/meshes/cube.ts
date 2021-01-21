import { Mesh } from '../mesh';

export class Cube extends Mesh {
	constructor() {
		super();
		this.data.positions = new Float32Array(CUBE_VERTICES);

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

	// Left
	-1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,
	-1.0, -1.0, -1.0,

	-1.0, 1.0, -1.0,
	-1.0, -1.0, -1.0,
	-1.0, 1.0, 1.0,


	// Bottom
	1.0, -1.0, -1.0,
	1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,

	-1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,
	1.0, -1.0, 1.0,


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

	// Near
	1.0, 1.0, 1.0,
	-1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,

	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,
]; 
