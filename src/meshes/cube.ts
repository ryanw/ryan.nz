import { Mesh } from '../mesh';
import { Point3, Point2, Vector3 } from '../geom';
import { Color } from '../material';

export type CubeVertex = {
	position: Point3;
	uv: Point2;
	normal: Vector3;
	color: Color;
};

export class Cube extends Mesh<CubeVertex> {
	constructor() {
		const data: CubeVertex[] = new Array(FACE_VERTICES.length / 3);
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

			const normal: Vector3 = [0.0, 0.0, 0.0];
			data[i] = { position, uv, normal, color: [0.0, 1.0, 0.0, 1.0] };
		}

		super(data);
		this.calculateNormals();
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
