import { Mesh } from '../mesh';
import { Point2, Point3, Vector3, Matrix4 } from '../geom';

type Face = [number[], number[], number[]];

export type ObjVertex = {
	position: Point3;
	normal: Vector3;
	uv: Point2;
};

export interface ObjOptions {
	flipFaces?: boolean;
	scale?: number;
}

export interface ObjFile {
	vertices: Point3[];
	normals: Vector3[];
	uvs: Point2[];
}

export class Obj extends Mesh<ObjVertex> {
	constructor(data: string, options?: ObjOptions) {
		let { vertices, normals, uvs } = parseObj(data);
		if (options?.scale) {
			const scaling = Matrix4.scaling(options.scale, options.scale, options.scale);
			vertices = vertices.map(v => scaling.transformPoint3(v));
		}
		if (options?.flipFaces) {
			for (let i = 0; i < vertices.length; i += 3) {
				const v0 = vertices[i];
				const v1 = vertices[i + 2];
				vertices[i] = v1;
				vertices[i + 2] = v0;
			}
		}

		const geom: ObjVertex[] = vertices.map((position, i) => {
			return {
				position,
				normal: normals[i],
				uv: uvs[i],
			};
		});
		super(geom);
	}

	static async fromUrl(url: string): Promise<Obj> {
		const response = await fetch(url);
		const data = await response.text();
		return new Obj(data);
	}
}

function parseObj(data: string): ObjFile {
	const vertices: Point3[] = [];
	const faces: Face[] = [];
	const normals: Vector3[] = [];
	const uvs: Point2[] = [];

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
				uvs.push(parseObjUV(line));
				break;

			// Vertex Normal
			case 'vn':
				normals.push(parseObjNormal(line));
				break;
		}
	}

	return {
		vertices: (faces as any).flat().map((f: number[]) => vertices[f[0]]),
		normals: (faces as any).flat().map((f: number[]) => normals[f[2]]),
		uvs: (faces as any).flat().map((f: number[]) => uvs[f[1]]),
	};
}

function parseObjVertex(line: string): Point3 {
	return line
		.split(' ')
		.filter(s => s)
		.slice(1)
		.map(parseFloat) as Point3;
}

function parseObjNormal(line: string): Vector3 {
	return line
		.split(' ')
		.filter(s => s)
		.slice(1)
		.map(parseFloat) as Vector3;
}

function parseObjUV(line: string): Point2 {
	const p = line
		.split(' ')
		.filter(s => s)
		.slice(1)
		.map(i => parseFloat(i)) as Point2;

	return [p[0], 1 - p[1]];
}

function parseObjFace(line: string): Face {
	return line
		.split(' ')
		.filter(s => s)
		.slice(1)
		.map(f => f.split('/').map(i => parseInt(i, 10) - 1)) as Face;
}
