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
		if (this.positions.length === 0) {
			this.build();
		}
		super.upload(gl);
	}

	build() {
		const positions: number[] = [];
		const barycentrics: number[] = [];
		const w = 24;
		const d = 48;

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
		this.positions = new Float32Array(positions);
		this.barycentrics = new Float32Array(barycentrics);
		this.time = performance.now();
	}

	draw(gl: WebGLRenderingContext) {
		gl.drawArrays(this.target, 0, this.vertexCount);
	}
}

export class WireTerrain extends Terrain {
	target = WebGLRenderingContext.LINES;

	createQuad(x: number, z: number, offsetX: number, offsetY: number): number[] {
		const positions = [];
		for (const point of QUAD_LINES) {
			const y = this.height(point[0] + x + offsetX, point[2] + z + offsetY);
			positions.push(point[0] + x);
			positions.push(point[1] + y);
			positions.push(point[2] + z);
		}
		return positions;
	}
}

export class WeirdTerrain extends WireTerrain {
	height(x: number, z: number): number {
		const r = 4.0;
		const p = [0.0, 0.0];
		const dx = (p[0] - x) | 0;
		const dy = (p[1] - z) | 0;
		const dist = Math.abs(Math.sqrt(dx * dx + dy * dy));
		if (dist <= r) {
			return Math.cos(dist / r) * r;
		}

		return 0.0;
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

const QUAD_LINES = [
	[-0.5, 0.0, -0.5],
	[0.5, 0.0, -0.5],

	[-0.5, 0.0, -0.5],
	[-0.5, 0.0, 0.5],
];
