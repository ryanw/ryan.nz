import { Mesh } from './mesh';
import { Program } from './program';


export class WebGLRenderer {
	canvas: HTMLCanvasElement;
	program: Program;
	meshes: Mesh[] = [];
	scale: number = 0.25;
	private context: WebGLRenderingContext;

	constructor() {
		this.canvas = document.createElement('canvas');
		Object.assign(this.canvas.style, {
			position: 'fixed',
			zIndex: -1,
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		});

		this.initWebGL();
		this.addMesh(Mesh.createCube());
	}

	/**
	 * The canvas's parent element
	 */
	get parentElement(): HTMLCanvasElement['parentElement'] {
		return this.canvas.parentElement;
	}

	/**
	 * The WebGL drawing context
	 */
	get gl(): WebGLRenderingContext {
		if (this.context) {
			return this.context;
		}

		return this.context = this.canvas.getContext('webgl');
	}

	/**
	 * Creates the WebGL buffers, compiles the shaders, etc.
	 */
	private initWebGL() {
		const gl = this.gl;

		this.program = new Program(gl);
	}

	clear() {
		const gl = this.gl;
		gl.clearColor(0.03, 0.08, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	animate() {
	}

	draw() {
		const gl = this.gl;
		this.program.bind(gl);
		this.clear();

		for (const mesh of this.meshes) {
			mesh.draw(gl);
		}
	}

	addMesh(mesh: Mesh) {
		const gl = this.gl;
		mesh.allocate(gl);
		mesh.upload(gl);
		this.meshes.push(mesh);
	}

	/**
	 * Wait for next animation frame and redraw everything
	 */
	async redraw() {
		return new Promise((resolve) => {
			window.requestAnimationFrame(() => {
				this.draw();
				resolve();
			});
		});
	}

	/**
	 * Update the framebuffer of the canvas to match its container's size
	 */
	updateSize() {
		const width = this.parentElement.clientWidth * this.scale | 0;
		const height = this.parentElement.clientHeight * this.scale | 0;

		this.canvas.style.imageRendering = 'crisp-edges';
		this.canvas.style.width = this.parentElement.clientWidth + 'px';
		this.canvas.style.height = this.parentElement.clientHeight + 'px';
		this.canvas.setAttribute('width', width.toString());
		this.canvas.setAttribute('height', height.toString());
	}

	/**
	 * Insert the canvas into a HTMLElement
	 */
	attach(el: HTMLElement) {
		el.appendChild(this.canvas);
		window.addEventListener('resize', this.updateSize.bind(this));
		this.updateSize();
	}
}
