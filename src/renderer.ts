import { Matrix4 } from './geom';
import { Mesh } from './mesh';
import { Cube, WireCube } from './meshes/cube';
import { Terrain, WireTerrain } from './meshes/terrain';
import { Program } from './program';
import { Camera } from './camera';

export type Color = [number, number, number, number];
export class Material {
	color: Color;
}

export class Pawn {
	mesh: Mesh;
	model: Matrix4 = Matrix4.identity();
	material: Material = new Material();

	constructor(mesh: Mesh) {
		this.mesh = mesh;
	}
}

export class WebGLRenderer {
	canvas: HTMLCanvasElement;
	program: Program;
	pawns: Pawn[] = [];
	scale = 1.0;
	lineWidth = 4.0;
	antiAlias = true;
	camera = new Camera();
	maxFps = 6000;
	lastFrameAt = 0;
	isGrabbed = false;
	heldKeys = new Set();
	mouseMovement = [0.0, 0.0];
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
			antialias: this.antiAlias,
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
		gl.lineWidth(this.lineWidth);
		this.program = new Program(gl);
	}

	grab() {
		this.isGrabbed = true;
		this.canvas.requestPointerLock();
		this.addEventListeners();
	}

	release() {
		this.isGrabbed = false;
		document.exitPointerLock();
		this.removeEventListeners();
	}

	addEventListeners() {
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
		window.addEventListener('mousemove', this.onMouseMove);
	}

	removeEventListeners() {
		this.heldKeys.clear();
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
		window.removeEventListener('mousemove', this.onMouseMove);
	}

	onKeyDown = (e: KeyboardEvent) => {
		this.heldKeys.add(e.key);
	}

	onKeyUp = (e: KeyboardEvent) => {
		this.heldKeys.delete(e.key);
	}

	onMouseMove = (e: MouseEvent) => {
		// FIXME firefox is off by 2 pixels?!
		const mX = e.movementX;
		const mY = e.movementY;
		this.mouseMovement[0] += mX;
		this.mouseMovement[1] += mY;
	}

	clear() {
		const gl = this.gl;
		gl.clearDepth(1.0);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.colorMask(true, true, true, false);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	draw(dt: number) {
		const gl = this.gl;
		this.program.use(gl);
		gl.viewport(0, 0, this.camera.width, this.camera.height);
		this.clear();

		// Uniforms
		const proj = this.camera.projection.clone();
		const view = this.camera.view.inverse(); // FIXME need inverse
		const viewProj = proj.multiply(view);
		gl.uniformMatrix4fv(this.program.viewProjUniform, false, viewProj.toArray());

		for (const pawn of this.pawns) {
			const { mesh, model, material } = pawn;

			gl.uniformMatrix4fv(this.program.modelUniform, false, model.toArray());
			gl.uniform4fv(this.program.fillColorUniform, material.color);

			this.program.bind(gl, mesh);

			if (mesh instanceof Terrain) {
				mesh.build();
				mesh.upload(gl);
			}
			mesh.draw(gl);
		}

		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.colorMask(false, false, false, true);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	addPawn(pawn: Pawn): number {
		const gl = this.gl;
		pawn.mesh.allocate(gl);
		pawn.mesh.upload(gl);
		this.pawns.push(pawn);
		return this.pawns.length - 1;
	}

	/**
	 * Wait for next animation frame and redraw everything
	 */
	async redraw(): Promise<number> {
		return new Promise((resolve) => {
			window.requestAnimationFrame(() => {
				const now = performance.now();
				let dt = (now - this.lastFrameAt) / 1000.0;
				this.lastFrameAt = now;

				this.draw(dt);

				const frametime = performance.now() - now;
				const delay = (1000 / this.maxFps) - frametime;
				if (delay > 0.0) {
					dt += delay / 1000.0;
					setTimeout(() => resolve(dt), delay);
				}
				else {
					resolve(dt);
				}
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
