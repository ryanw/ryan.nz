import { Mesh } from '../mesh';
import { Point3, Point2 } from '../geom';

export type Vertex = {
	position: Point3;
	uv: Point2;
};

export class SnowFlake extends Mesh<Vertex> {
	constructor() {
		super([
			{ position: [1.0, 1.0, 0.0], uv: [1.0, 0.0] },
			{ position: [-1.0, 1.0, 0.0], uv: [0.0, 0.0] },
			{ position: [1.0, -1.0, 0.0], uv: [1.0, 1.0] },

			{ position: [-1.0, -1.0, 0.0], uv: [0.0, 1.0] },
			{ position: [1.0, -1.0, 0.0], uv: [1.0, 1.0] },
			{ position: [-1.0, 1.0, 0.0], uv: [0.0, 0.0] },
		]);
	}
}
