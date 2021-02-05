import { Mesh } from '../mesh';
import { Point3, Point2 } from '../geom';

export type BuildingVertex = {
	position: Point3;
	uv: Point2;
	barycentric: Point3;
	scale: Point2;
};

export class Building extends Mesh<BuildingVertex> {
	constructor(width: number = 1, height: number = 1, depth: number = 1) {
		const data: BuildingVertex[] = new Array(6 * 6);
		for (let i = 0; i < data.length; i++) {
			// prettier-ignore
			const position: Point3 = [
				FACE_VERTICES[i * 3 + 0],
				FACE_VERTICES[i * 3 + 1],
				FACE_VERTICES[i * 3 + 2],
			];
			// prettier-ignore
			const uv: Point2 = [
				FACE_UV[(i * 2 + 0) % FACE_UV.length],
				FACE_UV[(i * 2 + 1) % FACE_UV.length],
			];
			// prettier-ignore
			const barycentric: Point3 = [
				FACE_BARY[(i * 3 + 0) % FACE_BARY.length],
				FACE_BARY[(i * 3 + 1) % FACE_BARY.length],
				FACE_BARY[(i * 3 + 2) % FACE_BARY.length],
			];

			let scale: Point2 = [0, 0];
			switch (Math.floor(i / 6)) {
				case 0: // Far
				case 1: // Near
					scale = [width, height];
					break;
				case 2: // Left
				case 3: // Right
					scale = [depth, height];
					break;
			}

			data[i] = { position, uv, barycentric, scale };
		}

		super(data);
	}
}

// prettier-ignore
const FACE_UV = [
	1.0, 1.0,
	0.0, 1.0,
	1.0, 0.0,

	0.0, 0.0,
	1.0, 0.0,
	0.0, 1.0,
];

// prettier-ignore
const FACE_BARY = [
	1.0, 0.0, 0.0,
	0.0, 1.0, 0.0,
	1.0, 0.0, 1.0,
];

// prettier-ignore
const FACE_VERTICES = [
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
