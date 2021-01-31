import { Point3, Matrix4 } from './geom';

export interface Vertex {
	position: Point3;
	[key: string]: number[];
}

export interface GeometryOptions {
	transform?: Matrix4;
}

export class Geometry<T extends Vertex> {
	vertices: T[];
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
	buffer: WebGLBuffer;

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

	get isAllocated(): boolean {
		return Boolean(this.buffer);
	}

	get vertexCount(): number {
		let count = 0;
		for (const geom of this.geometries) {
			count += geom.vertices.length;
		}
		return count;
	}

	get stride(): number {
		for (const geom of this.geometries) {
			const vertex = geom.vertices[0];
			if (!vertex) continue;

			let size = 0;
			for (const attr of Object.values(vertex)) {
				size += attr.length;
			}
			return size * 4;
		}
		return 0;
	}

	get data(): Float32Array {
		// Fill data with T; data is sorted by the property name
		let data: number[] = [];
		for (const geom of this.geometries) {
			for (const vertex of geom.vertices) {
				for (const attr of Object.keys(vertex).sort()) {
					if (attr === 'position') {
						data = data.concat(geom.transform.transformPoint3(vertex[attr]));
					} else {
						data = data.concat(vertex[attr]);
					}
				}
			}
		}
		return new Float32Array(data);
	}

	attributeOffset(name: string): number {
		for (const geom of this.geometries) {
			const vertex = geom.vertices[0];
			if (!vertex) continue;

			let offset = 0;
			for (const attr of Object.keys(vertex).sort()) {
				if (attr === name) {
					return offset;
				}
				offset += vertex[attr].length * 4;
			}
			return offset;
		}
		return 0;
	}

	hasAttribute(name: string): boolean {
		for (const geom of this.geometries) {
			const vertex = geom.vertices[0];
			if (!vertex) continue;
			return name in vertex;
		}
		return false;
	}

	upload(gl: WebGLRenderingContext) {
		if (!this.buffer) {
			this.buffer = gl.createBuffer();
		}


		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW);
	}

	draw(gl: WebGLRenderingContext) {
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
	}
}
