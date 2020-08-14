import { Matrix4 } from './geom';
import { Mesh } from './mesh';
import { Cube, WireCube } from './meshes/cube';
import { WireTerrain } from './meshes/terrain';
import { Program } from './program';
import { Camera } from './camera';


export class WebGLRenderer {
	canvas: HTMLCanvasElement;
	program: Program;
	meshes: Mesh[] = [];
	models: Matrix4[] = [];
	scale: number = 0.25;
	camera: Camera = new Camera();
	maxFps: number = 30;
	lastFrameAt: number = 0;
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
		const m = this.addMesh(new WireTerrain());
		this.models[m] = Matrix4.translation(0.0, 0.0, 0.0)
			.multiply(Matrix4.scaling(0.33, 0.4, 0.33));

		this.camera.position = [0.0, -1.0, 0.0];
		this.camera.rotation = [0.25,  0.0, 0.0];
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

		const options = {
			antialias: false,
			failIfMajorPerformanceCaveat: true,
			alpha: true,
		};
		return this.context = this.canvas.getContext('webgl', options) as WebGLRenderingContext;
	}

	/**
	 * Creates the WebGL buffers, compiles the shaders, etc.
	 */
	private initWebGL() {
		const gl = this.gl;

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		this.program = new Program(gl);
	}

	clear() {
		const gl = this.gl;
		gl.clearDepth(1.0);
		gl.clearColor(0.03, 0.08, 0.0, 1.0);
		gl.colorMask(true, true, true, false);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	animate(dt: number) {
		for (let i = 0; i < this.meshes.length; i++) {
			const mesh = this.meshes[i];
			const model = this.models[i];
			if (mesh instanceof WireTerrain) {
				mesh.offset[0] += 20.0 * dt;
				this.camera.rotation[1] += 0.25 * dt;
				mesh.build();
			}
		}
	}

	draw(dt: number) {
		const gl = this.gl;
		gl.viewport(0, 0, this.camera.width, this.camera.height);
		this.clear();

		// Uniforms
		const proj = this.camera.projection.clone();
		const view = this.camera.view.clone(); // FIXME need inverse
		const viewProj = proj.multiply(view);
		gl.uniformMatrix4fv(this.program.viewProjUniform, false, viewProj.toArray());

		for (let i = 0; i < this.meshes.length; i++) {
			const mesh = this.meshes[i];
			const model = this.models[i];
			gl.uniformMatrix4fv(this.program.modelUniform, false, model.toArray());

			mesh.bind(gl);
			this.program.bind(gl);

			if (mesh instanceof WireTerrain) {
				mesh.build();
				mesh.upload(gl);
			}
			mesh.draw(gl);
		}

		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.colorMask(false, false, false, true);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	addMesh(mesh: Mesh): number {
		const gl = this.gl;
		mesh.allocate(gl);
		mesh.upload(gl);
		this.models.push(Matrix4.translation(0.0, 0.0, 0.0));
		this.meshes.push(mesh);
		return this.meshes.length - 1;
	}

	/**
	 * Wait for next animation frame and redraw everything
	 */
	async redraw() {
		return new Promise((resolve) => {
			window.requestAnimationFrame(() => {
				const now = performance.now();
				const frametime = now - this.lastFrameAt;
				this.animate(frametime / 1000);
				this.draw(frametime / 1000);
				this.lastFrameAt = now;
				const delay = (1000 / this.maxFps) - frametime;
				setTimeout(resolve, delay);
			});
		});
	}

	/**
	 * Update the framebuffer of the canvas to match its container's size
	 */
	updateSize() {
		const width = this.parentElement.clientWidth * this.scale | 0;
		const height = this.parentElement.clientHeight * this.scale | 0;
		this.camera.resize(width, height);

		this.canvas.style.imageRendering = 'crisp-edges';  // Firefox
		this.canvas.style.imageRendering = 'pixelated';    // Webkit
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
