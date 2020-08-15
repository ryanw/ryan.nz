import { Mesh } from '../mesh';
import SimplexNoise from '../simplex-noise';

export class Terrain extends Mesh {
	offset = [0, 0];

	constructor() {
		super();
		this.build();
	}

	build() {
		const positions: number[] = [];
		const w = 16;
		const d = 16;
		const y = 0;

		function addVertex(x: number, y: number, z: number) {
			positions.push(x);
			positions.push(y);
			positions.push(z);
		}

		function addQuad(x: number, z: number, offsetX: number, offsetY: number) {
			for (const point of QUAD_POINTS) {
				const vx = point[0] + x;
				const vz = point[2] + z;
				const vy = point[1] + noise(vx + offsetX, vz + offsetY);
				addVertex(vx, vy, vz);
			}
		}

		let [ox, oz] = this.offset;
		const s = 0.1;
		ox *= s;
		oz *= s;
		for (let z = -d; z <= d; z++) {
			for (let x = -w; x <= w; x++) {
				addQuad(x, z, ox, oz);
			}
		}
		this.positions = new Float32Array(positions);
	}

	draw(gl: WebGLRenderingContext) {
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
	}
}

export class WireTerrain extends Mesh {
	offset = [0, 0];

	constructor() {
		super();
		this.build();
	}

	build() {
		const positions: number[] = [];
		const w = 16;
		const d = 16;
		const y = 0;

		function addVertex(x: number, y: number, z: number) {
			positions.push(x);
			positions.push(y);
			positions.push(z);
		}

		let [ox, oz] = this.offset;
		const s = 0.1;
		ox *= s;
		oz *= s;
		for (let z = -d; z <= d; z++) {
			for (let x = -w; x <= w; x++) {
				let vx, vy, vz;

				// Top
				vx = x - 0.5;
				vz = z - 0.5;
				vy = noise(vx + ox, vz + oz);
				addVertex(vx, vy, vz);
				vx = x + 0.5;
				vz = z - 0.5;
				vy = noise(vx + ox, vz + oz);
				addVertex(vx, vy, vz);

				// Left
				vx = x;
				vz = z - 0.5;
				vy = noise(vx + ox, vz + oz);
				addVertex(vx, vy, vz);
				vx = x;
				vz = z + 0.5;
				vy = noise(vx + ox, vz + oz);
				addVertex(vx, vy, vz);
			}
		}
		this.positions = new Float32Array(positions);
	}

	draw(gl: WebGLRenderingContext) {
		gl.drawArrays(gl.LINES, 0, this.vertexCount);
	}
}

const simplex = new SimplexNoise(0);
function noise(x: number, y: number): number {
	const s = 8.0;
	return simplex.noise2D(x / s, y / s);
}


const QUAD_POINTS = [
	[-0.5, 0, -0.5],
	[-0.5, 0,  0.5],
	[ 0.5, 0, -0.5],

	[ 0.5, 0, -0.5],
	[ 0.5, 0,  0.5],
	[-0.5, 0,  0.5],
];
