import vertSource from './shaders/wireframe.vert.shader';
import fragSource from './shaders/wireframe.frag.shader';

export class Program {
	prog: WebGLProgram;
	positionAttrib: number;
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
		this.positionAttrib = gl.getAttribLocation(program, 'position');
		this.viewProjUniform = gl.getUniformLocation(program, 'view_proj');
		this.modelUniform = gl.getUniformLocation(program, 'model');

		this.prog = program;
	}

	bind(gl: WebGLRenderingContext) {
		gl.useProgram(this.prog);

		// Attributes
		// Position
		gl.enableVertexAttribArray(this.positionAttrib);
		gl.vertexAttribPointer(this.positionAttrib, 3, gl.FLOAT, false, 0, 0);
	}
}
