import { FancyMesh as Mesh, Vertex, Geometry } from '../fancy_mesh';
import { Point3, Matrix4 } from '../geom';
import { Color } from '../material';

export type TreeVertex = {
	position: Point3;
	color: Color;
	barycentric: Point3;
}

function createCircle(radius: number = 1, segments: number = 12): TreeVertex[] {
	const vertices: TreeVertex[] = [];

	// Create circle
	const segmentRot = Matrix4.rotation(0.0, 0.0, (Math.PI * 2) / segments);
	let rot = segmentRot;
	for (let i = 0; i < segments; i++) {
		// Triangle from center
		const p0: Point3 = [0.0, 0.0, 0.0];
		const p1: Point3 = rot.transformPoint3([radius, 0.0, 0.0]);
		rot = rot.multiply(segmentRot);
		const p2: Point3 = rot.transformPoint3([radius, 0.0, 0.0]);
		vertices.push({ position: p0, color: [1.0, 0.0, 0.0, 1.0], barycentric: [1.0, 1.0, 1.0] });
		vertices.push({ position: p1, color: [1.0, 0.0, 0.0, 1.0], barycentric: [0.0, 1.0, 1.0] });
		vertices.push({ position: p2, color: [1.0, 0.0, 0.0, 1.0], barycentric: [0.0, 1.0, 1.0] });
	}

	return vertices;
}

function createCylinder(radius: number | [number, number], length: number, segments: number = 12): TreeVertex[] {
	const rad0 = typeof radius === 'number' ? radius : radius[0];
	const rad1 = typeof radius === 'number' ? radius : radius[1];
	let vertices: TreeVertex[] = [];

	// End caps
	// Bottom
	const circle0 = createCircle(rad0, segments);
	vertices = vertices.concat(circle0.map(v => {
		const position = [v.position[0], v.position[1], length / 2] as Point3;
		return { ...v, position };
	}));

	// Top
	const circle1 = createCircle(rad1, segments);
	// Flip faces
	for (let i = 0; i < circle1.length; i += 3) {
		const p0 = circle1[i + 1].position;
		const p1 = circle1[i + 2].position;
		circle1[i + 1].position = p1;
		circle1[i + 2].position = p0;
	}
	vertices = vertices.concat(circle1.map(v => {
		const position = [v.position[0], v.position[1], -length / 2] as Point3;
		return { ...v, position };
	}));

	// Sides
	for (let i = 0; i < segments; i++) {
		const idx0 = i * 3;
		const idx1 = idx0 + segments * 3;

		const p0 = vertices[idx1 + 2].position;
		const p1 = vertices[idx1 + 1].position;
		const p2 = vertices[idx0 + 1].position;
		vertices.push({ position: p0, color: [0.0, 1.0, 0.0, 1.0], barycentric: [1.0, 0.0, 0.0] });
		vertices.push({ position: p1, color: [0.0, 1.0, 0.0, 1.0], barycentric: [0.0, 1.0, 0.0] });
		vertices.push({ position: p2, color: [0.0, 1.0, 0.0, 1.0], barycentric: [1.0, 0.0, 1.0] });


		const p3 = vertices[idx1 + 1].position;
		const p4 = vertices[idx0 + 2].position;
		const p5 = vertices[idx0 + 1].position;
		vertices.push({ position: p3, color: [1.0, 0.0, 1.0, 1.0], barycentric: [1.0, 0.0, 1.0] });
		vertices.push({ position: p4, color: [1.0, 0.0, 1.0, 1.0], barycentric: [1.0, 0.0, 0.0] });
		vertices.push({ position: p5, color: [1.0, 0.0, 1.0, 1.0], barycentric: [0.0, 1.0, 0.0] });
	}

	return vertices;
}

export class Tree extends Mesh<TreeVertex> {
	constructor() {
		const geoms: Geometry<TreeVertex>[] = [];

		// Trunk
		const rot = Matrix4.rotation(Math.PI / 2.0, 0.0, 0.0);
		const vertices = createCylinder([0.13, 0.2], 0.66, 8);
		vertices.forEach(v => v.color = [1.0, 0.0, 1.0, 1.0]);
		geoms.push(new Geometry(vertices, { transform: rot }));
		for (let i = 0; i < 12; i++) {
			const geom = geoms[geoms.length - 1].clone();
			geom.transform = geom.transform.multiply(Matrix4.translation(0.0, 0.0, -0.66));
			geom.transform = geom.transform.multiply(Matrix4.rotation(0.0, 0.05, 0.0));
			geoms.push(geom);
		}

		// Leaves
		const leafColor: Color = [0.0, 1.0, 0.0, 1.0];
		const leafColor2: Color = [1.0, 0.0, 0.0, 1.0];
		const leaf: TreeVertex[] = [
			// Tip
			{ position: [-5.0, -1.0, -1.0], barycentric: [1.0, 0.0, 0.0], color: leafColor },
			{ position: [-5.0,	1.0, -1.0], barycentric: [0.0, 1.0, 0.0], color: leafColor },
			{ position: [-7.0,	0.0, -4.0], barycentric: [0.0, 0.0, 1.0], color: leafColor },

			// Middle
			{ position: [-2.0, -0.8,	0.0], barycentric: [1.0, 0.0, 0.0], color: leafColor },
			{ position: [-2.0,	0.8,	0.0], barycentric: [0.0, 1.0, 0.0], color: leafColor },
			{ position: [-5.0, -1.0, -1.0], barycentric: [1.0, 0.0, 1.0], color: leafColor },

			{ position: [-5.0, -1.0, -1.0], barycentric: [1.0, 0.0, 0.0], color: leafColor },
			{ position: [-2.0,  0.8,  0.0], barycentric: [0.0, 1.0, 1.0], color: leafColor },
			{ position: [-5.0,  1.0, -1.0], barycentric: [0.0, 1.0, 1.0], color: leafColor },

			// Base
			{ position: [ 0.0, -0.5, -0.5], barycentric: [1.0, 0.0, 0.0], color: leafColor },
			{ position: [ 0.0,  0.5, -0.5], barycentric: [0.0, 1.0, 0.0], color: leafColor },
			{ position: [-2.0, -1.0,  0.0], barycentric: [1.0, 0.0, 1.0], color: leafColor },

			{ position: [-2.0, -1.0,  0.0], barycentric: [1.0, 0.0, 1.0], color: leafColor },
			{ position: [ 0.0,  0.5, -0.5], barycentric: [0.0, 1.0, 1.0], color: leafColor },
			{ position: [-2.0,  1.0,  0.0], barycentric: [0.0, 0.0, 1.0], color: leafColor },
		];
		// Duplicate and flip faces for backside
		for (let i = 0, len = leaf.length; i < len; i += 3) {
			const v0 = leaf[i];
			const v1 = leaf[i + 1];
			const v2 = leaf[i + 2];

			leaf.push({ position: [...v2.position], barycentric: [...v2.barycentric], color: leafColor });
			leaf.push({ position: [...v1.position], barycentric: [...v1.barycentric], color: leafColor });
			leaf.push({ position: [...v0.position], barycentric: [...v0.barycentric], color: leafColor });
		}
		
		for (let i = 0; i < 8; i++) {
			const transform = Matrix4.identity()
				.multiply(Matrix4.rotation(-Math.PI / 2, 0.0, 0.0))
				.multiply(Matrix4.translation(-2.3, 0.0, 8.15))
				.multiply(Matrix4.rotation(0.0, -0.4, 0.0))
				.multiply(Matrix4.rotation(0.0, 0.0, (Math.PI / 2) * (i / 2)))
				.multiply(Matrix4.scaling(0.6, 0.6, 0.6)) ;
			geoms.push(new Geometry(leaf, { transform }));
		}

		super(geoms);
	}
}
