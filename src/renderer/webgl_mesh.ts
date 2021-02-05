import { Vertex } from './vertex';
import { Mesh } from '../mesh';

const FLOAT32_SIZE: number = 4;

export class WebGLMesh<T extends Vertex> {
	buffer: WebGLBuffer;
	stride: number;
	offsets: Map<keyof T, number> = new Map();
	length: number;
	gl: WebGLRenderingContext;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}

	async upload(mesh: Mesh<T>): Promise<void> {
		const gl = this.gl;
		if (!this.buffer) {
			this.buffer = gl.createBuffer();
		}

		const vertices = mesh.vertices;
		this.length = vertices.length;
		if (vertices.length === 0) {
			return;
		}

		const attributeNames = Object.keys(vertices[0]).sort();

		// Calculate offsets, stride, and vertex size
		let vertexSize = 0;
		for (const name of attributeNames) {
			const attr = vertices[0][name];
			this.offsets.set(name, vertexSize * FLOAT32_SIZE);
			if (Array.isArray(attr)) {
				vertexSize += attr.length;
			} else {
				vertexSize += 1;
			}
		}
		this.stride = vertexSize * FLOAT32_SIZE;

		// Convert Array<Vertex> into Float32Array
		let i = 0;
		const data = new Float32Array(vertices.length * vertexSize);
		for (const vertex of vertices) {
			for (const attr of attributeNames) {
				const value = vertex[attr];
				if (Array.isArray(value)) {
					for (const num of value) {
						data[i] = num;
						i++;
					}
				} else {
					data[i] = value;
					i++;
				}
			}
		}

		// Upload data to the GPU
		this.bind();
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
	}

	bind() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
	}

	draw() {
		this.gl.drawArrays(this.gl.TRIANGLES, 0, this.length);
	}
}
