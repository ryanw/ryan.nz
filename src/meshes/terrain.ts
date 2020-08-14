import { Mesh } from '../mesh';

export class WireTerrain extends Mesh {
	constructor() {
		super();
		this.build();
	}

	private build() {
		const vertices = [];
		const w = 10;
		const d = 8;
		for (let z = -d; z < d; z++) {
			for (let x = -w; x < w; x++) {
				let y = -1.0;

				// Top
				vertices.push(x - 0.5);
				vertices.push(y);
				vertices.push(z - 0.5);
				vertices.push(x + 0.5);
				vertices.push(y);
				vertices.push(z - 0.5);

				// Left
				vertices.push(x);
				vertices.push(y);
				vertices.push(z - 0.5);
				vertices.push(x);
				vertices.push(y);
				vertices.push(z + 0.5);
			}
		}
		this.vertices = new Float32Array(vertices);
	}

	draw(gl: WebGLRenderingContext) {
		this.bind(gl);
		gl.drawArrays(gl.LINES, 0, this.vertexCount);
	}
}

