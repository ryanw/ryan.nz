import { Mesh } from '../mesh';

export class Sun extends Mesh {
	constructor() {
		super();
		this.data.positions = new Float32Array(VERTICES);

		// prettier-ignore
		const barycentrics = [
			-1.0, 1.0, 0.0,
			1.0, 1.0, 0.0,
			-1.0, -1.0, 0.0,

			-1.0, 1.0, 1.0,
			1.0, 1.0, 1.0,
			-1.0, -1.0, 1.0,
		];
		this.data.barycentrics = new Float32Array(barycentrics);
	}
}

const VERTICES = [
	// Near
	1.0, 1.0, 1.0,
	-1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,

	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,
]; 
