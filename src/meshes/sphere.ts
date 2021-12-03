import { Mesh } from '../mesh';
import { Point3, Point2, Vector3, normalize } from '../geom';
import { Color } from '../material';

export type SphereVertex = {
	position: Point3;
	uv: Point2;
	normal: Vector3;
	color: Color;
};

export class Sphere extends Mesh<SphereVertex> {
	constructor(lonSegments: number, latSegments: number) {
		const data: SphereVertex[] = [];

		for (let y = latSegments * -0.5; y < latSegments * 0.5; y++) {
			const lat0 = Math.PI * (y / latSegments);
			const lat1 = Math.PI * ((y + 1) / latSegments);

			for (let x = lonSegments * -0.5; x < lonSegments * 0.5; x++) {
				const lon0 = 2 * Math.PI * (x / lonSegments);
				const lon1 = 2 * Math.PI * ((x + 1) / lonSegments);

				const quad: [number, number][] = [
					[lon1, lat1],
					[lon0, lat1],
					[lon0, lat0],
					[lon1, lat0],
					[lon1, lat1],
					[lon0, lat0],
				];

				for (const p of quad) {
					const position = sphericalToCartesian(p[0], p[1]);
					const normal = normalize(position);
					const vertex: SphereVertex = {
						position,
						normal,
						uv: sphericalToUV(p[0], p[1]),
						color: [1.0, 0.0, 0.0, 1.0],
					};

					data.push(vertex);
				}
			}
		}
		super(data);
	}
}

function sphericalToCartesian(lon: number, lat: number): Point3 {
	return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
}

function sphericalToUV(lon: number, lat: number): Point2 {
	const x = lon / Math.PI / 2 + 0.5;
	const y = -lat / Math.PI + 0.5;
	return [x, y];
}
