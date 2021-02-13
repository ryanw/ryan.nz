import { Mesh } from '../mesh';
import { Point3, Point2, Vector3 } from '../geom';
import { Color } from '../material';

export type Vertex = {
	position: Point3;
	uv: Point2;
	color: Color;
	normal: Vector3;
};

export class Quad extends Mesh<Vertex> {
	constructor() {
		super([
			{ position: [1.0, 1.0, 0.0], uv: [1.0, 0.0], color: [0.0, 0.0, 0.0, 1.0], normal: [0.0, 0.0, 1.0] },
			{ position: [-1.0, 1.0, 0.0], uv: [0.0, 0.0], color: [0.0, 0.0, 0.0, 1.0], normal: [0.0, 0.0, 1.0] },
			{ position: [1.0, -1.0, 0.0], uv: [1.0, 1.0], color: [0.0, 0.0, 0.0, 1.0], normal: [0.0, 0.0, 1.0] },

			{ position: [-1.0, -1.0, 0.0], uv: [0.0, 1.0], color: [0.0, 0.0, 0.0, 1.0], normal: [0.0, 0.0, 1.0] },
			{ position: [1.0, -1.0, 0.0], uv: [1.0, 1.0], color: [0.0, 0.0, 0.0, 1.0], normal: [0.0, 0.0, 1.0] },
			{ position: [-1.0, 1.0, 0.0], uv: [0.0, 0.0], color: [0.0, 0.0, 0.0, 1.0], normal: [0.0, 0.0, 1.0] },
		]);
		this.calculateNormals();
	}
}
