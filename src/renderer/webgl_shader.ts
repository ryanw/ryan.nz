import { Vertex } from './vertex';
import { WebGLMesh } from './webgl_mesh';

export interface ShaderOptions {
	attributes?: { [key: string]: WebGLAttribute };
	instanceAttributes?: { [key: string]: WebGLAttribute };
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

export type WebGLUniformMap = { [key: string]: WebGLUniform };
export type WebGLAttributeMap = { [key: string]: WebGLAttribute };

export class WebGLShader {
	compiled = false;
	program: WebGLProgram;
	attributes: WebGLAttributeMap = {
		position: {
			type: WebGLRenderingContext.FLOAT,
			size: 3,
			location: null,
		},
	};
	instanceAttributes: WebGLAttributeMap = {
	};
	uniforms: WebGLUniformMap = {
		uTime: {
			type: WebGLRenderingContext.FLOAT,
			location: null,
		},
		uViewProj: {
			type: WebGLRenderingContext.FLOAT_MAT4,
			location: null,
		},
		uModel: {
			type: WebGLRenderingContext.FLOAT_MAT4,
			location: null,
		},
		uFillColor: {
			type: WebGLRenderingContext.FLOAT_VEC4,
			location: null,
		},
		uFogColor: {
			type: WebGLRenderingContext.FLOAT_VEC4,
			location: null,
		},
		uLineWidth: {
			type: WebGLRenderingContext.FLOAT,
			location: null,
		},
		uResolution: {
			type: WebGLRenderingContext.FLOAT_VEC2,
			location: null,
		},
		uSeed: {
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

		if (options?.instanceAttributes) {
			this.instanceAttributes = {
				...this.instanceAttributes,
				...options.instanceAttributes,
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
			this.uniforms[uniformName].location = gl.getUniformLocation(program, uniformName);
		}

		// Attribute locations
		for (const attributeName in this.attributes) {
			this.attributes[attributeName].location = gl.getAttribLocation(program, attributeName);
		}
		for (const attributeName in this.instanceAttributes) {
			this.instanceAttributes[attributeName].location = gl.getAttribLocation(program, attributeName);
		}

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		this.program = program;
		this.compiled = true;
	}

	use(gl: WebGLRenderingContext) {
		gl.useProgram(this.program);
	}

	bind(gl: WebGLRenderingContext, mesh: WebGLMesh) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
		const ext = gl.getExtension('ANGLE_instanced_arrays');
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
			ext.vertexAttribDivisorANGLE(attribute.location, 0);
		}
	}


	bindInstances(gl: WebGLRenderingContext, mesh: WebGLMesh) {
		const ext = gl.getExtension('ANGLE_instanced_arrays');
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instanceBuffer);
		for (const attributeName in this.instanceAttributes) {
			const attribute = this.instanceAttributes[attributeName];
			if (attribute.location == null || attribute.location === -1) {
				continue;
			}

			const stride = mesh.instanceStride;
			let offset = mesh.instanceOffsets.get(attributeName);
			if (offset == null) {
				throw `Unable to find instanceOffset for ${attributeName}`;
			}
			// mat4 is really 4x vec4
			if (attribute.size === 4 * 4) {
				for (let i = 0; i < 4; i++) {
					const location = attribute.location + i;
					gl.enableVertexAttribArray(location);
					gl.vertexAttribPointer(location, 4, attribute.type, false, stride, offset);
					ext.vertexAttribDivisorANGLE(location, 1);
					offset += 4 * 4;
				}
			}
		}
	}
}
