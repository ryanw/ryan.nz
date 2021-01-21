import { Mesh } from './mesh';

export class Shader {
	program: WebGLProgram;
	attributes = {
		position: -1,
		normal: -1,
		barycentric: -1,
	};
	uniforms: {
		time?: WebGLUniformLocation;
		viewProj?: WebGLUniformLocation;
		model?: WebGLUniformLocation;
		fillColor?: WebGLUniformLocation;
		fogColor?: WebGLUniformLocation;
		lineWidth?: WebGLUniformLocation;
	} = {};

	constructor(gl?: WebGLRenderingContext, vertSource?: string, fragSource?: string) {
		if (gl) {
			this.make(gl, vertSource, fragSource);
		}
	}

	make(gl: WebGLRenderingContext, vertSource: string, fragSource: string) {
		if (!vertSource) {
			throw new Error("You must provide vertex shader source code");
		}
		if (!fragSource) {
			throw new Error("You must provide fragment shader source code");
		}

		const program = gl.createProgram();

		// Enable `fwidth` in shader
		gl.getExtension('OES_standard_derivatives');

		const vert = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vert, vertSource);
		gl.attachShader(program, vert);
		gl.compileShader(vert);
		if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
			const info = gl.getShaderInfoLog(vert);
			throw `Could not compile Vertex shader: ${info}`;
		}

		const frag = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(frag, fragSource);
		gl.attachShader(program, frag);
		gl.compileShader(frag);
		gl.linkProgram(program);
		if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
			const info = gl.getShaderInfoLog(frag);
			throw `Could not compile Fragment shader: ${info}`;
		}

		// Did it compile ok?
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const info = gl.getProgramInfoLog(program);
			throw `Could not compile WebGL program: ${info}`;
		}

		// Attribute/Uniform locations
		this.uniforms.time = gl.getUniformLocation(program, 'time');
		this.uniforms.viewProj = gl.getUniformLocation(program, 'view_proj');
		this.uniforms.model = gl.getUniformLocation(program, 'model');
		this.uniforms.fogColor = gl.getUniformLocation(program, 'fog_color');
		this.uniforms.fillColor = gl.getUniformLocation(program, 'fill_color');
		this.uniforms.lineWidth = gl.getUniformLocation(program, 'line_width');
		this.attributes.position = gl.getAttribLocation(program, 'position');
		this.attributes.normal = gl.getAttribLocation(program, 'normal');
		this.attributes.barycentric = gl.getAttribLocation(program, 'barycentric');

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		this.program = program;
	}

	use(gl: WebGLRenderingContext) {
		gl.useProgram(this.program);
	}

	bind(gl: WebGLRenderingContext, mesh: Mesh) {
		// Position; 3x float
		if (this.attributes.position > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
			gl.enableVertexAttribArray(this.attributes.position);
			gl.vertexAttribPointer(this.attributes.position, 3, gl.FLOAT, false, 0, 0);
		}

		// Normal; 3x float
		if (this.attributes.normal > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
			gl.enableVertexAttribArray(this.attributes.normal);
			gl.vertexAttribPointer(this.attributes.normal, 3, gl.FLOAT, false, 0, 0);
		}

		// Barycentric coords; 3x float
		if (this.attributes.barycentric > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.barycentricBuffer);
			gl.enableVertexAttribArray(this.attributes.barycentric);
			gl.vertexAttribPointer(this.attributes.barycentric, 3, gl.FLOAT, false, 0, 0);
		}
	}
}
