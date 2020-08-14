import { Mesh } from '../mesh';
import SimplexNoise from '../simplex-noise';

export class WireTerrain extends Mesh {
	offset = [0, 0];

	constructor() {
		super();
		this.build();
	}

	build() {
		const vertices: number[] = [];
		const w = 16;
		const d = 16;
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
		this.vertices = new Float32Array(vertices);
	}

	draw(gl: WebGLRenderingContext) {
		this.bind(gl);
		gl.drawArrays(gl.LINES, 0, this.vertexCount);
	}
}

const simplex = new SimplexNoise(0);
function noise(x: number, y: number): number {
	const s = 8.0;
	return simplex.noise2D(x / s, y / s);
}

