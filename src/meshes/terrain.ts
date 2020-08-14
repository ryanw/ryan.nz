import { Mesh } from '../mesh';

export class WireTerrain extends Mesh {
	offset = [0, 0];

	constructor() {
		super();
		this.build();
	}

	build() {
		noiseHistory = {};
		const vertices: number[] = [];
		const w = 10;
		const d = 8;
		const y = 0;

		function addVertex(x: number, y: number, z: number) {
			vertices.push(x);
			vertices.push(y);
			vertices.push(z);
		}

		let [ox, oz] = this.offset;
		const s = 0.1;
		ox *= s;
		oz *= s;
		for (let z = -d; z < d; z++) {
			for (let x = -w; x < w; x++) {
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
		this.vertices = new Float32Array(vertices);
	}

	draw(gl: WebGLRenderingContext) {
		this.bind(gl);
		gl.drawArrays(gl.LINES, 0, this.vertexCount);
	}
}

let noiseHistory: { [key: string]: number } = {};
function noise(x: number, y: number): number {
	const key = `${x.toFixed(2)},${y.toFixed(2)}`;
	if (noiseHistory[key]) {
		return noiseHistory[key];
	}
	return noiseHistory[key] = (Math.sin(x * 1.0) * Math.cos(y * 1.0)) - 1.0;
}

