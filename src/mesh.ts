export type Vertex = [number, number, number];

export class Mesh {
	vertexBuffer: WebGLBuffer;
	vertices: Float32Array = new Float32Array();

	static createCube(): Mesh {
		const mesh = new Mesh();
		mesh.vertices = new Float32Array(CUBE_VERTICES);
		return mesh;
	}

	get isAllocated(): boolean {
		return Boolean(this.vertexBuffer);
	}

	get vertexCount(): number {
		return this.vertices.length / 3;
	}

	allocate(gl: WebGLRenderingContext) {
		if (this.isAllocated) {
			return;
		}
		this.vertexBuffer = gl.createBuffer();
	}

	bind(gl: WebGLRenderingContext) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	}

	upload(gl: WebGLRenderingContext) {
		this.bind(gl);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	}

	draw(gl: WebGLRenderingContext) {
		this.bind(gl);
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
	}
}

const CUBE_VERTICES = [
	-1.0, -1.0, -1.0,
	-1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,

	1.0, 1.0, -1.0,
	-1.0, -1.0, -1.0,
	-1.0, 1.0, -1.0,

	1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,
	1.0, -1.0, -1.0,

	1.0, 1.0, -1.0,
	1.0, -1.0, -1.0,
	-1.0, -1.0, -1.0,

	-1.0, -1.0, -1.0,
	-1.0, 1.0, 1.0,
	-1.0, 1.0, -1.0,

	1.0, -1.0, 1.0,
	-1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,

	-1.0, 1.0, 1.0,
	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,

	1.0, 1.0, 1.0,
	1.0, -1.0, -1.0,
	1.0, 1.0, -1.0,

	1.0, -1.0, -1.0,
	1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,

	1.0, 1.0, 1.0,
	1.0, 1.0, -1.0,
	-1.0, 1.0, -1.0,

	1.0, 1.0, 1.0,
	-1.0, 1.0, -1.0,
	-1.0, 1.0, 1.0,

	1.0, 1.0, 1.0,
	-1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,
]; 
