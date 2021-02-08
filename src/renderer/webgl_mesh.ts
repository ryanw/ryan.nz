import { Matrix4 } from '../geom';
import { Vertex } from './vertex';
import { Mesh } from '../mesh';
import { Instance } from '../pawn';

const FLOAT32_SIZE: number = 4;

export class WebGLMesh<T extends Vertex = Vertex> {
	buffer: WebGLBuffer;
	stride: number;
	offsets: Map<keyof T, number> = new Map();
	length: number;
	instanceBuffer: WebGLBuffer;
	instanceStride: number;
	instanceOffsets: Map<keyof T, number> = new Map();
	instanceLength: number;
	gl: WebGLRenderingContext;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}

	upload(mesh: Mesh<T>): Promise<void> {
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

	uploadInstances<I extends Instance>(instances: I[]) {
		if (instances.length === 0) {
			return;
		}
		const gl = this.gl;

		const attributeNames = Object.keys(instances[0]).sort();

		// Calculate offsets, stride, and instance size
		let instanceSize = 0;
		for (const name of attributeNames) {
			const attr = instances[0][name];
			this.instanceOffsets.set(name, instanceSize * FLOAT32_SIZE);
			if (Array.isArray(attr)) {
				instanceSize += attr.length;
			} else if (attr instanceof Matrix4) {
				instanceSize += attr.toArray().length;
			} else {
				instanceSize += 1;
			}
		}
		this.instanceStride = instanceSize * FLOAT32_SIZE;

		// Convert Array<Instance> into Float32Array
		let i = 0;
		const data = new Float32Array(instances.length * instanceSize);
		for (const instance of instances) {
			for (const attr of attributeNames) {
				const value = instance[attr];
				if (Array.isArray(value)) {
					for (const num of value) {
						data[i] = num;
						i++;
					}
				} else if (value instanceof Matrix4) {
					for (const num of value.toArray()) {
						data[i] = num;
						i++;
					}
				} else {
					data[i] = value;
					i++;
				}
			}
		}

		if (!this.instanceBuffer) {
			this.instanceBuffer = gl.createBuffer();
		}

		this.instanceLength = instances.length;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
	}

	bind() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
	}

	draw() {
		this.gl.drawArrays(this.gl.TRIANGLES, 0, this.length);
	}

	drawInstances() {
		const ext = this.gl.getExtension('ANGLE_instanced_arrays');
		ext.drawArraysInstancedANGLE(this.gl.TRIANGLES, 0, this.length, this.instanceLength);
	}
}
