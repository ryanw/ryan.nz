import { Mesh } from './mesh';
import { Vertex } from './renderer/vertex';
import { WebGLMesh } from './renderer/webgl_mesh';

export interface ShaderOptions {
	attributes?: { [key: string]: WebGLAttribute };
	uniforms?: { [key: string]: WebGLUniform };
}

export interface WebGLAttribute {
	location?: number;
	size: number;
	type: number;
}

export interface WebGLUniform {
	location?: WebGLUniformLocation;
	type: number;
}

function camelToSnake(camel: string): string {
	return camel.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export type WebGLUniformMap = { [key: string]: WebGLUniform };
export type WebGLAttributeMap = { [key: string]: WebGLAttribute };

export class Shader {
	compiled = false;
	program: WebGLProgram;
	attributes: WebGLAttributeMap = {
		position: {
			type: WebGLRenderingContext.FLOAT,
			size: 3,
			location: null,
		},
		normal: {
			type: WebGLRenderingContext.FLOAT,
			size: 3,
			location: null,
		},
		barycentric: {
			type: WebGLRenderingContext.FLOAT,
			size: 3,
			location: null,
		},
		color: {
			type: WebGLRenderingContext.FLOAT,
			size: 4,
			location: null,
		},
	};
	uniforms: WebGLUniformMap = {
		time: {
			type: WebGLRenderingContext.FLOAT,
			location: null,
		},
		viewProj: {
			type: WebGLRenderingContext.FLOAT_MAT4,
			location: null,
		},
		model: {
			type: WebGLRenderingContext.FLOAT_MAT4,
			location: null,
		},
		fillColor: {
			type: WebGLRenderingContext.FLOAT_VEC4,
			location: null,
		},
		fogColor: {
			type: WebGLRenderingContext.FLOAT_VEC4,
			location: null,
		},
		lineWidth: {
			type: WebGLRenderingContext.FLOAT,
			location: null,
		},
		resolution: {
			type: WebGLRenderingContext.FLOAT_VEC2,
			location: null,
		},
		seed: {
			type: WebGLRenderingContext.FLOAT,
			location: null,
		},
	};

	constructor(gl?: WebGLRenderingContext, vertSource?: string, fragSource?: string, options?: ShaderOptions) {
		if (gl) {
			this.make(gl, vertSource, fragSource, options);
		}
	}

	make(gl: WebGLRenderingContext, vertSource?: string, fragSource?: string, options?: ShaderOptions) {
		if (!vertSource) {
			throw 'You must provide vertex shader source code';
		}
		if (!fragSource) {
			throw 'You must provide fragment shader source code';
		}

		const program = gl.createProgram();

		if (options?.attributes) {
			this.attributes = {
				...this.attributes,
				...options.attributes,
			};
		}

		if (options?.uniforms) {
			this.uniforms = {
				...this.uniforms,
				...options.uniforms,
			};
		}

		// Enable `fwidth` in shader
		gl.getExtension('OES_standard_derivatives');

		const vert = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vert, vertSource);
		gl.attachShader(program, vert);
		gl.compileShader(vert);
		// Did the vertex shader compile?
		if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
			const info = gl.getShaderInfoLog(vert);
			throw `Could not compile Vertex shader: ${info}`;
		}

		const frag = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(frag, fragSource);
		gl.attachShader(program, frag);
		gl.compileShader(frag);
		// Did the fragment shader compile?
		if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
			const info = gl.getShaderInfoLog(frag);
			throw `Could not compile Fragment shader: ${info}`;
		}

		gl.linkProgram(program);
		// Did the program link successfully?
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const info = gl.getProgramInfoLog(program);
			const shaderName = this.constructor.name;
			throw `Could not link WebGL program (${shaderName}): ${info}`;
		}

		// Uniform locations
		for (const uniformName in this.uniforms) {
			this.uniforms[uniformName].location = gl.getUniformLocation(program, camelToSnake(uniformName));
		}

		// Attribute locations
		for (const attributeName in this.attributes) {
			this.attributes[attributeName].location = gl.getAttribLocation(program, camelToSnake(attributeName));
		}

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		this.program = program;
		this.compiled = true;
	}

	use(gl: WebGLRenderingContext) {
		gl.useProgram(this.program);
	}

	bind<T extends Vertex>(gl: WebGLRenderingContext, mesh: WebGLMesh<T> | Mesh) {
		if (mesh instanceof Mesh) {
			return this.legacyBind(gl, mesh);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
		for (const attributeName in this.attributes) {
			const attribute = this.attributes[attributeName];
			if (attribute.location == null || attribute.location === -1) {
				continue;
			}

			const stride = mesh.stride;
			const offset = mesh.offsets.get(attributeName);
			if (offset == null) {
				throw `Unable to find offset for ${attributeName}`;
			}
			gl.enableVertexAttribArray(attribute.location);
			gl.vertexAttribPointer(attribute.location, attribute.size, attribute.type, false, stride, offset);
		}
	}

	legacyBind(gl: WebGLRenderingContext, mesh: Mesh) {
		console.warn("Called `bind` with deprecated mesh");

		for (const attributeName in this.attributes) {
			const attribute = this.attributes[attributeName];
			if (attribute.location == null || attribute.location === -1) {
				continue;
			}
			if (mesh instanceof Mesh) {
				const buffer = mesh.buffers[attributeName];
				if (!buffer) {
					throw `Unable to find ${attributeName} buffer on mesh`;
				}
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
				gl.enableVertexAttribArray(attribute.location);
				gl.vertexAttribPointer(attribute.location, attribute.size, attribute.type, false, 0, 0);
			}
		}
	}
}
