import { Matrix4, Point3, Vector3, normalize, cross } from './geom';
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
			this.vertices.map(v => ({ ...v })),
			{ transform: this.transform.clone() }
		);
	}

	calculateNormals() {
		if (this.vertices.length === 0) return;
		const vertices = (this.vertices as any[]) as { position: Point3; normal: Vector3 }[];

		if (!('normal' in vertices[0])) {
			throw `Geometry Vertex doesn't have a 'normal' attribute`;
		}

		for (let i = 0; i < this.vertices.length; i += 3) {
			const p0 = vertices[i + 0].position;
			const p1 = vertices[i + 1].position;
			const p2 = vertices[i + 2].position;

			const v0: Vector3 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
			const v1: Vector3 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
			const normal = normalize(cross(v0, v1));
			vertices[i + 0].normal = normal;
			vertices[i + 1].normal = normal;
			vertices[i + 2].normal = normal;
		}
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
		return new Mesh(this.geometries.map(g => g.clone()));
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

	calculateNormals() {
		for (const geom of this.geometries) {
			geom.calculateNormals();
		}
	}
}
