import { Mesh } from '../mesh';

export type HeightFunction = (x: number, y: number, t?: number) => number;

export class Terrain extends Mesh {
	target = WebGLRenderingContext.TRIANGLES;
	offset = [-1, -1];
	private time = performance.now();
	private heightFunc: HeightFunction = () => 0.0;

	constructor(heightFunc?: HeightFunction) {
		super();
		if (heightFunc) {
			this.heightFunc = heightFunc;
		}
	}

	height(x: number, z: number): number {
		return this.heightFunc(x, z, this.time / 1000.0);
	}

	appendQuad(positions: number[], x: number, z: number, offsetX: number, offsetY: number) {
		for (const point of QUAD_POINTS) {
			const y = this.height(point[0] + x + offsetX, point[2] + z + offsetY);
			positions.push(point[0] + x);
			positions.push(point[1] + y);
			positions.push(point[2] + z);
		}
	}

	upload(gl: WebGLRenderingContext) {
		if (this.data.positions.length === 0) {
			this.build();
		}
		super.upload(gl);
	}

	build() {
		const positions: number[] = [];
		const barycentrics: number[] = [];
		const w = 64;
		const d = 16;

		const [ox, oz] = this.offset;
		for (let z = -d; z <= d; z++) {
			for (let x = -w; x <= w; x++) {
				this.appendQuad(positions, x, z, ox, oz);

				// Add barycentric coords for every triangle
				for (let i = 0; i < QUAD_POINTS.length; i++) {
					if (i % 3 === 0) {
						barycentrics.push(1.0);
						barycentrics.push(0.0);
						barycentrics.push(0.0);
					} else if (i % 3 === 1) {
						barycentrics.push(1.0);
						barycentrics.push(1.0);
						barycentrics.push(0.0);
					} else {
						barycentrics.push(0.0);
						barycentrics.push(0.0);
						barycentrics.push(1.0);
					}
				}
			}
		}
		this.data.positions = new Float32Array(positions);
		this.data.barycentrics = new Float32Array(barycentrics);
		this.time = performance.now();
	}

	draw(gl: WebGLRenderingContext) {
		gl.drawArrays(this.target, 0, this.vertexCount);
	}
}

const QUAD_POINTS = [
	[-0.5, 0, -0.5],
	[-0.5, 0, 0.5],
	[0.5, 0, -0.5],

	[0.5, 0, 0.5],
	[0.5, 0, -0.5],
	[-0.5, 0, 0.5],
];
