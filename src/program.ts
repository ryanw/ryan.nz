import { Mesh } from './mesh';
import vertSource from './shaders/wireframe.vert.shader';
import fragSource from './shaders/wireframe.frag.shader';

export class Program {
	prog: WebGLProgram;
	positionAttrib: number;
	normalAttrib: number;
	viewProjUniform: WebGLUniformLocation;
	modelUniform: WebGLUniformLocation;

	constructor(gl?: WebGLRenderingContext) {
		if (gl) {
			this.make(gl);
		}
	}

	make(gl: WebGLRenderingContext) {
		const program = gl.createProgram();

		const vert = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vert, vertSource);
		gl.attachShader(program, vert);
		gl.compileShader(vert);

		const frag = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(frag, fragSource);
		gl.attachShader(program, frag);
		gl.compileShader(frag);
		gl.linkProgram(program);

		// Did it compile ok?
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const info = gl.getProgramInfoLog(program);
			throw `Could not compile WebGL program: ${info}`;
		}

		// Attribute/Uniform locations
		this.viewProjUniform = gl.getUniformLocation(program, 'view_proj');
		this.modelUniform = gl.getUniformLocation(program, 'model');
		this.positionAttrib = gl.getAttribLocation(program, 'position');
		this.normalAttrib = gl.getAttribLocation(program, 'normal');

		if (this.positionAttrib === -1 || this.normalAttrib === -1) {
			console.error("Sad", this.positionAttrib, this.normalAttrib, vertSource);
			throw `Failed to locate all shader attributes`;
		}

		this.prog = program;
	}

	use(gl: WebGLRenderingContext) {
		gl.useProgram(this.prog);
	}

	bind(gl: WebGLRenderingContext, mesh: Mesh) {
		// Position; 3x float
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
		gl.enableVertexAttribArray(this.positionAttrib);
		gl.vertexAttribPointer(this.positionAttrib, 3, gl.FLOAT, false, 0, 0);

		// Normal; 3x float
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
		gl.enableVertexAttribArray(this.normalAttrib);
		gl.vertexAttribPointer(this.normalAttrib, 3, gl.FLOAT, false, 0, 0);
	}
}
