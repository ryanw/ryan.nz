export type Vertex = [number, number, number];

export class Mesh {
	vertexBuffer: WebGLBuffer;
	vertices: Float32Array = new Float32Array();

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
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
	}
}

