import { Point3 } from '../geom';

export interface Vertex {
	position: Point3;
	[key: string]: number[];
}
