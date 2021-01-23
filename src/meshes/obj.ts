import { Mesh } from '../mesh';
import { Point3, Vector3, Matrix4 } from '../geom';

type Face = [number, number, number];

export interface ObjOptions {
	flipFaces?: boolean;
	scale?: number;
}

export interface ObjFile {
	vertices: Point3[];
	normals: Vector3[];
}

export class Obj extends Mesh {
	constructor(data: string, options?: ObjOptions) {
		super();
		let { vertices } = parseObj(data);
		if (options?.scale) {
			const scaling = Matrix4.scaling(options.scale, options.scale, options.scale);
			vertices = vertices.map((v) => scaling.transformPoint3(v));
		}
		if (options?.flipFaces) {
			for (let i = 0; i < vertices.length; i += 3) {
				const v0 = vertices[i];
				const v1 = vertices[i + 2];
				vertices[i] = v1;
				vertices[i + 2] = v0;
			}
		}
		this.data.positions = new Float32Array((vertices as any).flat());
	}
}

function parseObj(data: string): ObjFile {
	const vertices: Point3[] = [];
	const faces: Face[] = [];

	for (const line of data.split('\n')) {
		const leader = line.split(' ')[0];
		switch (leader) {
			// Vertex
			case 'v':
				vertices.push(parseObjVertex(line));
				break;

			// Face
			case 'f':
				faces.push(parseObjFace(line));
				break;

			// Vertex Texture
			case 'vt':
				break;

			// Vertex Normal
			case 'vn':
				break;
		}
	}

	return {
		vertices: (faces as any).flat().map((f: number) => vertices[f]),
		normals: [],
	};
}

function parseObjVertex(line: string): Point3 {
	return line
		.split(' ')
		.filter((s) => s)
		.slice(1)
		.map(parseFloat) as Point3;
}

function parseObjFace(line: string): Face {
	return line
		.split(' ')
		.filter((s) => s)
		.slice(1)
		.map((f) => parseInt(f.split('/')[0], 10) - 1) as Face;
}
