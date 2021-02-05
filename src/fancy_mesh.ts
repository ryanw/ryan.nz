import { Matrix4 } from './geom';
import { Vertex } from './renderer/vertex';
export { Vertex };

export interface GeometryOptions {
	transform?: Matrix4;
}

export class Geometry<T extends Vertex> {
	vertices: T[] = [];
	transform: Matrix4 = Matrix4.identity();

	constructor(vertices?: T[], options?: GeometryOptions) {
		if (vertices) {
			this.vertices = [...vertices];
		}
		if (options?.transform) {
			this.transform = options.transform;
		}
	}

	clone(): Geometry<T> {
		return new Geometry(this.vertices.map(v => ({ ...v })), { transform: this.transform.clone() });
	}
}

export class FancyMesh<T extends Vertex> {
	geometries: Geometry<T>[] = [];

	constructor(geom?: Geometry<T> | Geometry<T>[] | T[]) {
		if (geom) {
			if (Array.isArray(geom)) {
				if (geom.length === 0 || geom[0] instanceof Geometry) {
					this.geometries = [...geom] as Geometry<T>[];
				}
				else {
					this.geometries = [new Geometry(geom as T[])];
				}
			}
			else {
				this.geometries = [geom];
			}
		}
	}

	clone(): FancyMesh<T> {
		return new FancyMesh(this.geometries.map(g => g.clone()));
	}

	get vertexCount(): number {
		let count = 0;
		for (const geom of this.geometries) {
			count += geom.vertices.length;
		}
		return count;
	}

	get vertices(): T[] {
		// Preallocate the array as it's much faster than a bunch of `Array.concat`
		const data: T[] = new Array(this.vertexCount);

		let i = 0;
		for (const geom of this.geometries) {
			for (const vertex of geom.vertices) {
				data[i] = {
					...vertex,
					position: geom.transform.transformPoint3(vertex.position)
				};
				i++;
			}
		}

		return data;
	}
}
