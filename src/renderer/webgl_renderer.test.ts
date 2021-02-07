import 'jest-extended';

import MockCanvas from '../__mocks__/canvas';
import '../__mocks__/webgl';

import { WebGLRenderer } from './webgl_renderer';
import { Point2, Point3 } from '../geom';
import { Mesh } from '../mesh';
import { Pawn } from '../pawn';
import { Scene } from '../scene';

describe('WebGLRenderer', () => {
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
		MockCanvas.mockClear();
	});

	it('sets up the WebGL environment', () => {
		const renderer = new WebGLRenderer(new MockCanvas());
		const gl = renderer.gl;
		renderer.attach();

		expect(gl.enable).toHaveBeenCalledWith(gl.DEPTH_TEST);
		expect(gl.enable).toHaveBeenCalledWith(gl.BLEND);
		expect(gl.blendFunc).toHaveBeenCalledWith(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	});

	it('should clear using the backgroundColor', () => {
		const renderer = new WebGLRenderer(new MockCanvas());
		renderer.backgroundColor = [0.1, 0.2, 0.3, 0.4];
		const gl = renderer.gl;
		renderer.attach();

		renderer.clear();
		expect(gl.clearDepth).toHaveBeenCalledWith(1.0);
		expect(gl.clearColor).toHaveBeenCalledWith(0.1, 0.2, 0.3, 0.4);
		expect(gl.colorMask).toHaveBeenCalledWith(true, true, true, false);
		expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	});

	it('should upload a mesh to the GPU', () => {
		const renderer = new WebGLRenderer(new MockCanvas());
		const gl = renderer.gl as any;

		const mesh = new TestMesh();
		renderer.uploadMesh(mesh);

		expect(gl.createBuffer).toHaveBeenCalled();
		expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, 'TEST_CREATEBUFFER');
		expect(gl.bufferData).toHaveBeenCalledWith(gl.ARRAY_BUFFER, expect.any(Float32Array), gl.DYNAMIC_DRAW);
		expect(Array.from(gl.bufferData.mock.calls[0][1])).toEqual(
			expect.arrayContaining([6, 4, 5, 1, 2, 3, 66, 44, 55, 11, 22, 33, 666, 444, 555, 111, 222, 333])
		);
		expect(gl.bindBuffer).toHaveBeenCalledBefore(gl.bufferData);
	});

	it('should draw a Pawn', () => {
		const renderer = new WebGLRenderer(new MockCanvas());
		renderer.attach();
		const gl = renderer.gl as any;

		const pawn = new Pawn(new TestMesh());
		renderer.drawPawn(pawn);

		expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 3);
	});

	it('should draw a Scene', async () => {
		const renderer = new WebGLRenderer(new MockCanvas());
		renderer.attach();
		const gl = renderer.gl as any;

		const scene = new Scene(renderer);
		scene.addPawn(new Pawn(new TestMesh()));
		scene.addPawn(
			new Pawn(
				new Mesh([
					{ position: [1.0, 2.0, 3.0], foo: [4.0, 5.0], bar: 6.0 },
					{ position: [1.1, 2.2, 3.3], foo: [4.4, 5.5], bar: 6.6 },
					{ position: [1.11, 2.22, 3.33], foo: [4.44, 5.55], bar: 6.66 },
					{ position: [1.111, 2.222, 3.333], foo: [4.444, 5.555], bar: 6.666 },
				])
			)
		);
		await renderer.drawScene(scene);

		// First pawn
		expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 3);
		// Second pawn
		expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 4);
	});
});
