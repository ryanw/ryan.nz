import 'jest-extended';

import MockWebGLRenderingContext from '../__mocks__/webgl';
import { WebGLMesh } from './webgl_mesh';
import { Point2, Point3 } from '../geom';
import { Mesh } from '../mesh';

describe('WebGLMesh', () => {
	type TestVertex = {
		position: Point3;
		foo: Point2;
		bar: number;
	};

	class TestMesh extends Mesh<TestVertex> {
		constructor() {
			super([
				{ position: [1, 2, 3], foo: [4, 5], bar: 6 },
				{ position: [11, 22, 33], foo: [44, 55], bar: 66 },
				{ position: [111, 222, 333], foo: [444, 555], bar: 666 },
			]);
		}
	}

	beforeEach(() => {
		MockWebGLRenderingContext.mockClear();
	});

	it('uploads vertex data to a WebGLBuffer', () => {
		const gl = new MockWebGLRenderingContext();
		const mesh = new TestMesh();
		const glMesh = new WebGLMesh(gl);
		glMesh.upload(mesh);

		expect(gl.createBuffer).toHaveBeenCalled();
		expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, 'TEST_CREATEBUFFER');
		expect(gl.bufferData).toHaveBeenCalledWith(gl.ARRAY_BUFFER, expect.any(Float32Array), gl.DYNAMIC_DRAW);
		expect(Array.from(gl.bufferData.mock.calls[0][1])).toEqual(expect.arrayContaining([
			6, 4, 5, 1, 2, 3,
			66, 44, 55, 11, 22, 33,
			666, 444, 555, 111, 222, 333,
		]));
		expect(gl.bindBuffer).toHaveBeenCalledBefore(gl.bufferData);
	});

	it('binds the mesh buffer', () => {
		const gl = new MockWebGLRenderingContext();
		const mesh = new TestMesh();
		const glMesh = new WebGLMesh(gl);
		glMesh.upload(mesh);

		glMesh.bind();
		expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, 'TEST_CREATEBUFFER');
	});

	it('draws the mesh', () => {
		const gl = new MockWebGLRenderingContext();
		const mesh = new TestMesh();
		const glMesh = new WebGLMesh(gl);
		glMesh.upload(mesh);

		glMesh.draw();
		expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 3);
	});

	it('calculates the stride', () => {
		const gl = new MockWebGLRenderingContext();
		const mesh = new TestMesh();
		const glMesh = new WebGLMesh(gl);
		glMesh.upload(mesh);

		const expectedStride = (3 + 2 + 1) * 4;
		expect(glMesh.stride).toEqual(expectedStride);
	});

	it('calculates the attribute offsets', () => {
		const gl = new MockWebGLRenderingContext();
		const mesh = new TestMesh();
		const glMesh = new WebGLMesh(gl);
		glMesh.upload(mesh);

		expect(glMesh.offsets.get('bar')).toEqual(0);
		expect(glMesh.offsets.get('foo')).toEqual(4);
		expect(glMesh.offsets.get('position')).toEqual(12);
	});
});

