import { Mesh, Geometry, Point3, Vector3, Matrix4, Color } from 'toru';

export type TreeVertex = {
	position: Point3;
	faceColor: Color;
	wireColor: Color;
	barycentric: Point3;
	normal: Vector3;
};

function createCone(
	radius: number = 1,
	segments: number = 12,
	height: number = 1.0,
	faceColor: Color = [0.0, 0.0, 0.0, 1.0],
	wireColor: Color = [0.0, 1.0, 0.0, 1.0]
): TreeVertex[] {
	const vertices: TreeVertex[] = [];

	// Create circle
	const segmentRot = Matrix4.rotation(0.0, (Math.PI * 2) / segments, 0.0);
	let rot = segmentRot;
	for (let i = 0; i < segments; i++) {
		// Triangle from center
		const p0: Point3 = [0.0, height, 0.0];
		const p1: Point3 = rot.transformPoint3([radius, 0.0, 0.0]);
		rot = rot.multiply(segmentRot);
		const p2: Point3 = rot.transformPoint3([radius, 0.0, 0.0]);
		vertices.push({
			position: p0,
			faceColor,
			wireColor,
			barycentric: [1.0, 1.0, 1.0],
			normal: [0.0, 0.0, 1.0],
		});
		vertices.push({
			position: p1,
			faceColor,
			wireColor,
			barycentric: [0.0, 1.0, 1.0],
			normal: [0.0, 0.0, 1.0],
		});
		vertices.push({
			position: p2,
			faceColor,
			wireColor,
			barycentric: [0.0, 1.0, 1.0],
			normal: [0.0, 0.0, 1.0],
		});
	}

	return vertices;
}

function createCircle(
	radius: number = 1,
	segments: number = 12,
	faceColor: Color = [0.0, 0.0, 0.0, 1.0],
	wireColor: Color = [0.0, 1.0, 0.0, 1.0]
): TreeVertex[] {
	return createCone(radius, segments, 0, faceColor, wireColor);
}

function createCylinder(
	radius: number | [number, number],
	length: number,
	segments: number = 12,

	faceColor: Color = [0.0, 0.0, 0.0, 1.0],
	wireColor: Color = [0.0, 1.0, 0.0, 1.0]
): TreeVertex[] {
	const rad0 = typeof radius === 'number' ? radius : radius[0];
	const rad1 = typeof radius === 'number' ? radius : radius[1];
	let vertices: TreeVertex[] = [];

	// End caps
	// Bottom
	const circle0 = createCircle(rad0, segments, faceColor, wireColor);
	vertices = vertices.concat(
		circle0.map(v => {
			const position = [v.position[0], length / 2, v.position[2]] as Point3;
			return { ...v, position };
		})
	);

	// Top
	const circle1 = createCircle(rad1, segments, faceColor, wireColor);
	// Flip faces
	for (let i = 0; i < circle1.length; i += 3) {
		const p0 = circle1[i + 1].position;
		const p1 = circle1[i + 2].position;
		circle1[i + 1].position = p1;
		circle1[i + 2].position = p0;
	}
	vertices = vertices.concat(
		circle1.map(v => {
			const position = [v.position[0], -length / 2, v.position[2]] as Point3;
			return { ...v, position };
		})
	);

	// Sides
	for (let i = 0; i < segments; i++) {
		const idx0 = i * 3;
		const idx1 = idx0 + segments * 3;

		const p0 = vertices[idx1 + 2].position;
		const p1 = vertices[idx1 + 1].position;
		const p2 = vertices[idx0 + 1].position;
		vertices.push({ position: p0, faceColor, wireColor, barycentric: [1.0, 0.0, 0.0], normal: [1.0, 0.0, 0.0] });
		vertices.push({ position: p1, faceColor, wireColor, barycentric: [0.0, 1.0, 0.0], normal: [1.0, 0.0, 0.0] });
		vertices.push({ position: p2, faceColor, wireColor, barycentric: [1.0, 0.0, 1.0], normal: [1.0, 0.0, 0.0] });

		const p3 = vertices[idx1 + 1].position;
		const p4 = vertices[idx0 + 2].position;
		const p5 = vertices[idx0 + 1].position;
		vertices.push({ position: p3, faceColor, wireColor, barycentric: [1.0, 0.0, 1.0], normal: [1.0, 0.0, 0.0] });
		vertices.push({ position: p4, faceColor, wireColor, barycentric: [1.0, 0.0, 0.0], normal: [1.0, 0.0, 0.0] });
		vertices.push({ position: p5, faceColor, wireColor, barycentric: [0.0, 1.0, 0.0], normal: [1.0, 0.0, 0.0] });
	}

	return vertices;
}

export class XmasTree extends Mesh<TreeVertex> {
	constructor() {
		const geoms: Geometry<TreeVertex>[] = [];

		// Leaves
		const leaf = createCone(1.0, 8, 1.0);
		const backLeaf = createCone(1.0, 8, 1.0, [0.0, 1.0, 0.0, 1.0]).reverse();

		let transform;
		for (let i = 0; i < 4; i++) {
			transform = Matrix4.identity()
				.multiply(Matrix4.translation(0.0, 3.5 - i, 0.0))
				.multiply(Matrix4.scaling(1 + i * 0.2));
			geoms.push(new Geometry(leaf, { transform }));
			transform = transform.multiply(Matrix4.translation(0.0, -0.05, 0.0)).multiply(Matrix4.scaling(1.125));
			geoms.push(new Geometry(backLeaf, { transform }));
		}

		// Trunk
		const trunk = createCylinder(0.6, 1.5, 8, [0.0, 0.0, 0.0, 1.0], [1.0, 0.0, 1.0, 1.0]);
		transform = Matrix4.translation(0.0, 0.0, 0.0);
		geoms.push(new Geometry(trunk, { transform }));

		super(geoms);
	}
}
