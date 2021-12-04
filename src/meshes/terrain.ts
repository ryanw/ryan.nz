import { Mesh, Geometry, Point3 } from 'toru';

export type HeightFunction = (x: number, y: number, t?: number) => number;

export type Vertex = {
	position: Point3;
	barycentric: Point3;
};

export class Terrain extends Mesh<Vertex> {
	width = 32;
	depth = 16;

	constructor() {
		super();
		this.build();
	}

	build() {
		const geom = new Geometry<Vertex>();

		for (let z = -this.depth; z <= this.depth; z++) {
			for (let x = -this.width; x <= this.width; x++) {
				for (let i = 0; i < QUAD_POINTS.length; i++) {
					const point = QUAD_POINTS[i];
					const position: Point3 = [point[0] + x, point[1], point[2] + z];
					const barycentric: Point3 = [0.0, 0.0, 0.0];
					barycentric[i % 3] = 1.0;
					// Hide diagonal edge
					if (i % 3 === 1) barycentric[0] = 1.0;
					geom.vertices.push({ position, barycentric });
				}
			}
		}

		this.geometries = [geom];
	}
}

const QUAD_POINTS = [
	[-0.5, 0.0, -0.5],
	[-0.5, 0.0, 0.5],
	[0.5, 0.0, -0.5],
	[0.5, 0.0, 0.5],
	[0.5, 0.0, -0.5],
	[-0.5, 0.0, 0.5],
];
