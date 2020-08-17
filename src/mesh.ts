import * as geom from './geom';

export type Vertex = [number, number, number];

export class Mesh {
	positionBuffer: WebGLBuffer;
	positions: Float32Array = new Float32Array();
	normalBuffer: WebGLBuffer;
	normals: Float32Array = new Float32Array();
	barycentricBuffer: WebGLBuffer;
	barycentrics: Float32Array = new Float32Array();


	get isAllocated(): boolean {
		return Boolean(this.positionBuffer);
	}

	get vertexCount(): number {
		return this.positions.length / 3;
	}

	allocate(gl: WebGLRenderingContext) {
		if (this.isAllocated) {
			return;
		}
		this.positionBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
		this.barycentricBuffer = gl.createBuffer();
	}


	upload(gl: WebGLRenderingContext) {
		this.calculateNormals();

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.barycentricBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.barycentrics, gl.DYNAMIC_DRAW);
	}

	draw(gl: WebGLRenderingContext) {
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
	}

	private calculateNormals() {
		const normals: number[] = [];

		for (let i = 0; i < this.positions.length; i += 3 * 3) {
			const p0: geom.Point3 = [
				this.positions[i + 0],
				this.positions[i + 1],
				this.positions[i + 2],
			];
			const p1: geom.Point3 = [
				this.positions[i + 3],
				this.positions[i + 4],
				this.positions[i + 5],
			];
			const p2: geom.Point3 = [
				this.positions[i + 6],
				this.positions[i + 7],
				this.positions[i + 8],
			];

			const v0: geom.Vector3 = [
				p1[0] - p0[0],
				p1[1] - p0[1],
				p1[2] - p0[2],
			];
			const v1: geom.Vector3 = [
				p2[0] - p0[0],
				p2[1] - p0[1],
				p2[2] - p0[2],
			];
			const normal = geom.normalize(geom.cross(v0, v1));

			for (let i = 3; i > 0; i--) {
				normals.push(normal[0]);
				normals.push(normal[1]);
				normals.push(normal[2]);
			}
		}
		this.normals = new Float32Array(normals);
	}
}

