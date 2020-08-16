import { Mesh } from '../mesh';
import SimplexNoise from '../simplex-noise';

export class Terrain extends Mesh {
	target = WebGLRenderingContext.TRIANGLES;
	offset = [-1, -1];

	height(x: number, z: number): number {
		return 0.5;
	}

	createQuad(x: number, z: number, offsetX: number, offsetY: number) {
		const positions = [];
		for (const point of QUAD_POINTS) {
			const y = this.height(point[0] + x + offsetX, point[2] + z + offsetY);
			positions.push(point[0] + x);
			positions.push(point[1] + y);
			positions.push(point[2] + z);
		}
		return positions;
	}

	build() {
		const positions: number[] = [];
		const w = 24;
		const d = 24;
		const y = 0;

		const [ox, oz] = this.offset;
		for (let z = -d; z <= d; z++) {
			for (let x = -w; x <= w; x++) {
				positions.push(...this.createQuad(x, z, ox, oz));
			}
		}
		this.positions = new Float32Array(positions);
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
			const y = this.height(
				point[0] + x + offsetX,
				point[2] + z + offsetY,
			);
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
		const dx = p[0] - x | 0;
		const dy = p[1] - z | 0;
		const dist = Math.abs(Math.sqrt(dx*dx + dy*dy));
		if (dist <= r) {
			return Math.cos(dist / r) * r;
		}

		return 0.0;
	}
}


export class PerlinTerrain extends Terrain {
	noise = new SimplexNoise(666);

	height(x: number, z: number): number {
		const grid = 20.0;
		const s = 2.0;
		const val = this.noise.noise2D((x | 0) / grid * s, (z | 0) / grid * s);
		return val * 2;
	}
}

export class WirePerlinTerrain extends WireTerrain {
	target = WebGLRenderingContext.LINES;
	noise = new SimplexNoise(666);

	height(x: number, z: number): number {
		const grid = 20.0;
		const s = 2.0;
		const val = this.noise.noise2D((x | 0) / grid * s, (z | 0) / grid * s);
		return val * 2;
	}
}



const QUAD_POINTS = [
	[-0.5, 0, -0.5],
	[-0.5, 0,  0.5],
	[ 0.5, 0, -0.5],

	[ 0.5, 0, -0.5],
	[ 0.5, 0,  0.5],
	[-0.5, 0,  0.5],
];

const QUAD_LINES = [
	[-0.5, 0.0, -0.5],
	[ 0.5, 0.0, -0.5],

	[-0.5, 0.0, -0.5],
	[-0.5, 0.0,  0.5],
];
