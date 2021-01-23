import { Mesh } from '../mesh';
import { Point3, Vector3 } from '../geom';

type Face = [number, number, number];

export interface ObjFile {
	vertices: Point3[];
	normals: Vector3[];
}

export class Obj extends Mesh {
	constructor(data: string) {
		super();
		const { vertices } = parseObj(data);
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
	return line.split(' ').filter(s => s).slice(1).map(parseFloat) as Point3;
}

function parseObjFace(line: string): Face {
	return line.split(' ').filter(s => s).slice(1).map(f => parseInt(f.split('/')[0], 10) - 1) as Face
}
