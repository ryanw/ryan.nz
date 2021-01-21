import { Mesh } from '../mesh';

export class Sun extends Mesh {
	constructor() {
		super();
		this.data.positions = new Float32Array(VERTICES);

		const barycentrics = [];
		for (let i = 0; i < this.data.positions.length / 3; i++) {
			if (i % 3 === 0) {
				// BL
				barycentrics.push(-1.0);
				barycentrics.push(1.0);
				barycentrics.push(0.0);
			} else if (i % 3 === 1) {
				// BR
				barycentrics.push(1.0);
				barycentrics.push(1.0);
				barycentrics.push(0.0);
			} else {
				// TL
				barycentrics.push(-1.0);
				barycentrics.push(-1.0);
				barycentrics.push(0.0);
			}
		}
		this.data.barycentrics = new Float32Array(barycentrics);
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
