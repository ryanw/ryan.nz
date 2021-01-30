import { Mesh } from '../mesh';

export class Quad extends Mesh {
	constructor() {
		super();
		// prettier-ignore
		this.data.positions = new Float32Array([
			1.0, 1.0, 0.0,
			-1.0, 1.0, 0.0,
			1.0, -1.0, 0.0,

			-1.0, -1.0, 0.0,
			1.0, -1.0, 0.0,
			-1.0, 1.0, 0.0,
		]);
	}
}
