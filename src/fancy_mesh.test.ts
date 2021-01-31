import { Point3, Vector3, Matrix4 } from './geom';
import { FancyMesh as Mesh, Geometry } from './fancy_mesh';
import { Color } from './material';

describe('Mesh', () => {
	it('should calculate stride', () => {
		type TestVertex = {
			position: Point3;
			normal: Vector3;
			color: Color;
		};
		const vertices: TestVertex[] = [
			{ position: [1.0, 2.0, 3.0], normal: [0.1, 0.2, 0.3], color: [1.0, 0.0, 0.0, 0.0] },
		];
		const mesh = new Mesh(new Geometry(vertices));

		// (3 + 3 + 4) * 32bit
		expect(mesh.stride).toEqual(40);
	});

	it('should calculate offset for each attribute', () => {
		type TestVertex = {
			position: Point3;
			normal: Vector3;
			color: Color;
		};
		const vertices: TestVertex[] = [
			{ position: [1.0, 2.0, 3.0], normal: [0.1, 0.2, 0.3], color: [1.0, 0.0, 0.0, 0.0] },
		];
		const mesh = new Mesh(new Geometry(vertices));

		expect(mesh.attributeOffset('color')).toEqual(0);
		expect(mesh.attributeOffset('normal')).toEqual(16);
		expect(mesh.attributeOffset('position')).toEqual(28);
	});

	it('should transform the geometry', () => {
		type TestVertex = {
			position: Point3;
			normal: Vector3;
			color: Color;
		};
		const vertices: TestVertex[] = [
			{ position: [1.0, 2.0, 3.0], normal: [0.1, 0.2, 0.3], color: [1.0, 0.0, 0.0, 0.0] },
		];
		const transform = Matrix4.translation(3.12, 4.56, 5.67);
		const mesh = new Mesh(new Geometry(vertices, { transform }));

		const point = Array.from(mesh.data).splice(7);
		expect(point[0]).toBeCloseTo(1.0 + 3.12);
		expect(point[1]).toBeCloseTo(2.0 + 4.56);
		expect(point[2]).toBeCloseTo(3.0 + 5.67);
	});
});
