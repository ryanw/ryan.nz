import { Mesh } from '../mesh';
import { Point3 } from '../geom';

export type RoadVertex = {
	position: Point3;
	barycentric: Point3;
	direction: number;
};

export class Road extends Mesh<RoadVertex> {
	constructor() {
		super([
			{ position: [-1.0, 1.0, -1.0], barycentric: [1.0, 0.0, 0.0], direction: 1 },
			{ position: [1.0, 1.0, 1.0], barycentric: [0.0, 1.0, 0.0], direction: 1 },
			{ position: [1.0, 1.0, -1.0], barycentric: [0.0, 0.0, 1.0], direction: 1 },

			{ position: [1.0, 1.0, 1.0], barycentric: [1.0, 0.0, 0.0], direction: 0 },
			{ position: [-1.0, 1.0, -1.0], barycentric: [0.0, 1.0, 0.0], direction: 0 },
			{ position: [-1.0, 1.0, 1.0], barycentric: [0.0, 0.0, 1.0], direction: 0 },
		]);
	}
}
