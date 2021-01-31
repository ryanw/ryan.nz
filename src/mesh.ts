import * as geom from './geom';

export type Vertex = [number, number, number];

export class Mesh {
	buffers: { [key: string]: WebGLBuffer } = {};
	data: { [key: string]: Float32Array } = {
		positions: new Float32Array(),
		normals: new Float32Array(),
		barycentrics: new Float32Array(),
	};

	get isAllocated(): boolean {
		return Boolean(this.buffers.position);
	}

	get vertexCount(): number {
		return this.data.positions.length / 3;
	}

	allocate(gl: WebGLRenderingContext) {
		if (this.isAllocated) {
			return;
		}
		this.buffers = {
			position: gl.createBuffer(),
			normal: gl.createBuffer(),
			barycentric: gl.createBuffer(),
		};
	}

	upload(gl: WebGLRenderingContext) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
		gl.bufferData(gl.ARRAY_BUFFER, this.data.positions, gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
		gl.bufferData(gl.ARRAY_BUFFER, this.data.normals, gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.barycentric);
		gl.bufferData(gl.ARRAY_BUFFER, this.data.barycentrics, gl.DYNAMIC_DRAW);
	}

	draw(gl: WebGLRenderingContext) {
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
	}

	private calculateNormals() {
		const normals: number[] = [];
		const { positions } = this.data;

		for (let i = 0; i < positions.length; i += 3 * 3) {
			const p0: geom.Point3 = [positions[i + 0], positions[i + 1], positions[i + 2]];
			const p1: geom.Point3 = [positions[i + 3], positions[i + 4], positions[i + 5]];
			const p2: geom.Point3 = [positions[i + 6], positions[i + 7], positions[i + 8]];

			const v0: geom.Vector3 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
			const v1: geom.Vector3 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
			const normal = geom.normalize(geom.cross(v0, v1));

			for (let i = 3; i > 0; i--) {
				normals.push(normal[0]);
				normals.push(normal[1]);
				normals.push(normal[2]);
			}
		}
		this.data.normals = new Float32Array(normals);
	}
}
