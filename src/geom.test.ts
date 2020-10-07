import { Matrix4, Point3, Vector3, Vector4 } from './geom';

const DEGREE = Math.PI / 180;

describe('Matrix4', () => {
	it('creates an identity', () => {
		const mat = Matrix4.identity();
		expect(mat.toArray()).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		]);
	});

	it('has columns', () => {
		const mat = new Matrix4([
			1.0, 0.0, 2.0, 0.0,
			0.0, 1.0, 0.0, 7.0,
			4.0, 0.0, 3.0, 1.0,
			0.0, 2.0, 0.0, 2.0,
		]);

		const cols = mat.columns;
		expect(cols[0]).toEqual([1, 0, 4, 0]);
		expect(cols[1]).toEqual([0, 1, 0, 2]);
		expect(cols[2]).toEqual([2, 0, 3, 0]);
		expect(cols[3]).toEqual([0, 7, 1, 2]);
	});

	it('has rows', () => {
		const mat = new Matrix4([
			1.0, 0.0, 2.0, 0.0,
			0.0, 1.0, 0.0, 7.0,
			4.0, 0.0, 3.0, 1.0,
			0.0, 2.0, 0.0, 2.0,
		]);

		const rows = mat.rows;
		expect(rows[0]).toEqual([1, 0, 2, 0]);
		expect(rows[1]).toEqual([0, 1, 0, 7]);
		expect(rows[2]).toEqual([4, 0, 3, 1]);
		expect(rows[3]).toEqual([0, 2, 0, 2]);
	});

	it('transforms a Point3', () => {
		const mat = new Matrix4([
			1.0, 0.0, 2.0, 0.0,
			0.0, 1.0, 0.0, 7.0,
			4.0, 0.0, 3.0, 1.0,
			0.0, 2.0, 0.0, 2.0,
		]);

		const point: Point3 = [4, 5, 6];
		const result = mat.transformPoint3(point);
		expect(result[0]).toBeCloseTo(1.333);
		expect(result[1]).toBeCloseTo(1.000);
		expect(result[2]).toBeCloseTo(2.916);
	});

	it('multiplies a Vector4', () => {
		const mat = new Matrix4([
			1, 0, 2, 0,
			0, 1, 0, 7,
			4, 0, 3, 1,
			0, 2, 0, 2,
		]);

		const vec: Vector4 = [4, 5, 6, 1];
		const result = mat.multiplyVector4(vec);
		expect(result[0]).toBe(16);
		expect(result[1]).toBe(12);
		expect(result[2]).toBe(35);
		expect(result[3]).toBe(12);
	});

	it('multiplies a Point3', () => {
		const mat = new Matrix4([
			1, 0, 2, 0,
			0, 1, 0, 7,
			4, 0, 3, 1,
			0, 2, 0, 2,
		]);

		const point: Point3 = [4, 5, 6];
		const result = mat.transformPoint3(point);
		expect(result[0]).toBeCloseTo(1.333);
		expect(result[1]).toBeCloseTo(1.000);
		expect(result[2]).toBeCloseTo(2.917);
	});


	it('multiplies with another Matrix4', () => {
		const mat1 = new Matrix4([
			1, 0, 2, 0,
			0, 1, 0, 7,
			4, 0, 3, 1,
			0, 2, 0, 2,
		]);
		const mat2 = new Matrix4([
			3, 7, 2, 3,
			3, 1, 3, 5,
			5, 4, 2, 0,
			8, 5, 1, 1,
		]);

		const result = mat1.multiply(mat2).toArray();
		expect(result).toEqual([
			13, 15,  6,  3,
			59, 36, 10, 12,
			35, 45, 15, 13,
			22, 12,  8, 12,
		]);
	});

	it('creates a rotation', () => {
		const rotation = Matrix4.rotation(0, 45 * DEGREE, 0).toArray();
		const expectedRotation = [
			 0.707, 0.0,   0.707, 0.0,
			 0.0,   1.0,   0.0,   0.0,
			-0.707, 0.0,   0.707, 0.0,
			 0.0,   0.0,   0.0,   1.0,
		];

		for (const i in expectedRotation) {
			expect(rotation[i]).toBeCloseTo(expectedRotation[i]);
		}
	});

	it('rotates a point', () => {
		const point: Point3 = [4, 5, 6];
		const rotation = Matrix4.rotation(0, 45 * DEGREE, 0);
		const rotatedPoint = rotation.transformPoint3(point);
		expect(rotatedPoint[0]).toBeCloseTo(7.071);
		expect(rotatedPoint[1]).toBeCloseTo(5.000);
		expect(rotatedPoint[2]).toBeCloseTo(1.414);
	});

	it('translates a point', () => {
		const point: Point3 = [4, 5, 6];
		const mat = Matrix4.translation(1, 2, 3);
		const result = mat.transformPoint3(point);
		expect(result[0]).toBe(5);
		expect(result[1]).toBe(7);
		expect(result[2]).toBe(9);
	});

	describe('perspective', () => {
		it('creates a perspective matrix', () => {
			const mat = Matrix4.perspective(16.0/9.0, 45.0, 0.1, 10.0).toArray();

			const expectedMat = [
				1.3579, 0,       0,       0,
				0,      2.4142,  0,       0,
				0,      0,      -1.0202, -0.2020,
				0,      0,      -1,       0,
			];

			for (const i in expectedMat) {
				expect(mat[i]).toBeCloseTo(expectedMat[i]);
			}
		});

		it('perspective transforms a Vector4', () => {
			const vec: Vector4 = [4, 5, 6, 1];
			const mat = Matrix4.perspective(16.0/9.0, 45.0, 0.1, 10.0);
			const result = mat.multiplyVector4(vec);
			expect(result[0]).toBeCloseTo( 5.432);
			expect(result[1]).toBeCloseTo(12.071);
			expect(result[2]).toBeCloseTo(-6.323);
			expect(result[3]).toBeCloseTo(-6.000);
		});

		it('perspective transforms a point', () => {
			const point: Point3 = [4, 5, -6];
			const mat = Matrix4.perspective(16.0/9.0, 45.0, 0.01, 1000.0);
			const result = mat.transformPoint3(point);
			expect(result[0]).toBeCloseTo(0.905);
			expect(result[1]).toBeCloseTo(2.011);
			expect(result[2]).toBeCloseTo(0.996);
		});
	});
});
