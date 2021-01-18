import { Mesh } from '../mesh';

export class Cityscape extends Mesh {
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
		this.barycentrics = new Float32Array(barycentrics);
	}
}

const CUBE_VERTICES = [
	-1.0,
	-1.0,
	-1.0,
	-1.0,
	-1.0,
	1.0,
	-1.0,
	1.0,
	1.0,

	1.0,
	1.0,
	-1.0,
	-1.0,
	-1.0,
	-1.0,
	-1.0,
	1.0,
	-1.0,

	1.0,
	-1.0,
	1.0,
	-1.0,
	-1.0,
	-1.0,
	1.0,
	-1.0,
	-1.0,

	1.0,
	1.0,
	-1.0,
	1.0,
	-1.0,
	-1.0,
	-1.0,
	-1.0,
	-1.0,

	-1.0,
	-1.0,
	-1.0,
	-1.0,
	1.0,
	1.0,
	-1.0,
	1.0,
	-1.0,

	1.0,
	-1.0,
	1.0,
	-1.0,
	-1.0,
	1.0,
	-1.0,
	-1.0,
	-1.0,

	-1.0,
	1.0,
	1.0,
	-1.0,
	-1.0,
	1.0,
	1.0,
	-1.0,
	1.0,

	1.0,
	1.0,
	1.0,
	1.0,
	-1.0,
	-1.0,
	1.0,
	1.0,
	-1.0,

	1.0,
	-1.0,
	-1.0,
	1.0,
	1.0,
	1.0,
	1.0,
	-1.0,
	1.0,

	1.0,
	1.0,
	1.0,
	1.0,
	1.0,
	-1.0,
	-1.0,
	1.0,
	-1.0,

	1.0,
	1.0,
	1.0,
	-1.0,
	1.0,
	-1.0,
	-1.0,
	1.0,
	1.0,

	1.0,
	1.0,
	1.0,
	-1.0,
	1.0,
	1.0,
	1.0,
	-1.0,
	1.0,
];
