import { Matrix4 } from './geom';
import { Vertex } from './renderer/vertex';
export { Vertex };

export interface GeometryOptions {
	transform?: Matrix4;
}

export class Geometry<V extends Vertex> {
	vertices: V[] = [];
	transform: Matrix4 = Matrix4.identity();

	constructor(vertices?: V[], options?: GeometryOptions) {
		if (vertices) {
			this.vertices = [...vertices];
		}
		if (options?.transform) {
			this.transform = options.transform;
		}
	}

	clone(): Geometry<V> {
		return new Geometry(
			this.vertices.map((v) => ({ ...v })),
			{ transform: this.transform.clone() }
		);
	}
}

export class Mesh<V extends Vertex = Vertex> {
	geometries: Geometry<V>[] = [];

	constructor(geom?: Geometry<V> | Geometry<V>[] | V[]) {
		if (geom) {
			if (Array.isArray(geom)) {
				if (geom.length === 0 || geom[0] instanceof Geometry) {
					this.geometries = [...geom] as Geometry<V>[];
				} else {
					this.geometries = [new Geometry(geom as V[])];
				}
			} else {
				this.geometries = [geom];
			}
		}
	}

	clone(): Mesh<V> {
		return new Mesh(this.geometries.map((g) => g.clone()));
	}

	get vertexCount(): number {
		let count = 0;
		for (const geom of this.geometries) {
			count += geom.vertices.length;
		}
		return count;
	}

	get vertices(): V[] {
		// Preallocate the array as it's much faster than a bunch of `Array.concat`
		const data: V[] = new Array(this.vertexCount);

		let i = 0;
		for (const geom of this.geometries) {
			for (const vertex of geom.vertices) {
				data[i] = {
					...vertex,
					position: geom.transform.transformPoint3(vertex.position),
				};
				i++;
			}
		}

		return data;
	}
}
