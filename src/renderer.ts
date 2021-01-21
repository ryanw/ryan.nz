import { Shader } from './shader';
import { Pawn } from './pawn';
import { Camera } from './camera';
import { Color } from './material';
import { Matrix4 } from './geom';
import defaultVertSource from './shaders/wireframe.vert.glsl';
import defaultFragSource from './shaders/wireframe.frag.glsl';

export class WebGLRenderer {
	canvas = document.createElement('canvas');
	defaultShader: Shader;
	pawns: Pawn[] = [];
	scale = 1.0 * window.devicePixelRatio;
	lineWidth = 2 * window.devicePixelRatio;
	antiAlias = true;
	camera: Camera = new Camera();
	maxFps = 200;
	lastFrameAt = 0;
	heldKeys = new Set();
	mousePosition = [0.0, 0.0];
	mouseMovement = [0.0, 0.0];
	mouseButtons = new Set();
	backgroundColor: Color = [0.2, 0.05, 0.4, 1.0];
	frame = 0;
	private context: WebGLRenderingContext;

	constructor() {
		Object.assign(this.canvas.style, {
			position: 'fixed',
			zIndex: -1,
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		});
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
		};

		this.context = this.canvas.getContext('webgl', options) as WebGLRenderingContext;
		if (!this.context) {
			console.error('Failed to create WebGL context');
		}

		return this.context;
	}

	/**
	 * Creates the WebGL buffers, compiles the shaders, etc.
	 */
	private initWebGL() {
		const gl = this.gl;

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		this.defaultShader = this.createShader(defaultVertSource, defaultFragSource);
	}

	get isGrabbed() {
		return document.pointerLockElement === this.canvas;
	}

	grab() {
		this.canvas.requestPointerLock();
		this.addEventListeners();
	}

	release() {
		document.exitPointerLock();
		this.removeEventListeners();
	}

	addEventListeners() {
		document.addEventListener('pointerlockchange', this.onPointerLockChange);
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('mouseup', this.onMouseUp);
		window.addEventListener('mousedown', this.onMouseDown);
	}

	removeEventListeners() {
		this.heldKeys.clear();
		document.removeEventListener('pointerlockchange', this.onPointerLockChange);
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('mouseup', this.onMouseUp);
		window.removeEventListener('mousedown', this.onMouseDown);
	}

	onPointerLockChange = () => {
		if (!this.isGrabbed) {
			this.removeEventListeners();
		}
	};

	onKeyDown = (e: KeyboardEvent) => {
		this.heldKeys.add(e.key.toLowerCase());
	};

	onKeyUp = (e: KeyboardEvent) => {
		this.heldKeys.delete(e.key.toLowerCase());
	};

	onMouseDown = (e: MouseEvent) => {
		this.mouseButtons.add(e.button);
	};

	onMouseUp = (e: MouseEvent) => {
		this.mouseButtons.delete(e.button);
	};

	onMouseMove = (e: MouseEvent) => {
		this.mousePosition[0] = e.offsetX;
		this.mousePosition[1] = e.offsetY;
		this.mouseMovement[0] += e.movementX;
		this.mouseMovement[1] += e.movementY;
	};

	resetMouseMovement() {
		this.mouseMovement[0] = 0;
		this.mouseMovement[1] = 0;
	}

	clear() {
		const gl = this.gl;
		gl.clearDepth(1.0);
		gl.clearColor(...this.backgroundColor);
		gl.colorMask(true, true, true, false);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	draw(_dt: number) {
		const gl = this.gl;
		gl.viewport(0, 0, this.camera.width, this.camera.height);
		this.clear();

		// Uniforms
		const proj = this.camera.projection.clone();
		const view = this.camera.view.inverse();
		const viewProj = proj.multiply(view);

		for (const pawn of this.pawns) {
			const shader = pawn.shader || this.defaultShader;
			shader.use(gl);
			gl.uniformMatrix4fv(shader.uniforms.viewProj, false, viewProj.toArray());
			gl.uniform4fv(shader.uniforms.fogColor, this.backgroundColor);
			gl.uniform1f(shader.uniforms.lineWidth, this.lineWidth);
			gl.uniform1f(shader.uniforms.time, performance.now());
			this.drawPawn(pawn);
		}

		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.colorMask(false, false, false, true);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	drawPawn(pawn: Pawn, parentModel?: Matrix4) {
		const { mesh, model, material, children } = pawn;
		const pawnModel = parentModel ? parentModel.multiply(model) : model;

		if (mesh) {
			const gl = this.gl;
			const shader = pawn.shader || this.defaultShader;
			gl.uniformMatrix4fv(shader.uniforms.model, false, pawnModel.toArray());
			if (material?.color) {
				gl.uniform4fv(shader.uniforms.fillColor, material.color);
			}
			shader.bind(gl, mesh);
			mesh.draw(gl);
		}

		for (const child of children) {
			this.drawPawn(child, pawnModel);
		}
	}

	uploadPawn(pawn: Pawn) {
		const gl = this.gl;
		if (pawn.mesh) {
			pawn.mesh.allocate(gl);
			pawn.mesh.upload(gl);
		}
		for (const child of pawn.children) {
			this.uploadPawn(child);
		}
	}

	addPawn(pawn: Pawn): number {
		this.uploadPawn(pawn);
		this.pawns.push(pawn);
		return this.pawns.length - 1;
	}

	createShader(vertSource: string, fragSource: string): Shader {
		return new Shader(this.gl, vertSource, fragSource);
	}

	/**
	 * Wait for next animation frame and redraw everything
	 */
	async redraw(): Promise<number> {
		return new Promise((resolve) => {
			window.requestAnimationFrame(() => {
				const now = performance.now();
				const dt = (now - this.lastFrameAt) / 1000.0;
				this.lastFrameAt = now;

				this.draw(dt);
				this.frame++;
				const frametime = performance.now() - now;
				if (this.frame % 60 === 0) {
					console.log('Draw time: %o ms', ((frametime * 100) | 0) / 100);
				}

				const delay = 1000 / this.maxFps - frametime;
				if (delay > 0.0) {
					setTimeout(() => resolve(dt), delay);
				} else {
					resolve(dt);
				}
			});
		});
	}

	/**
	 * Update the framebuffer of the canvas to match its container's size
	 */
	updateSize() {
		const width = (this.parentElement.clientWidth * this.scale) | 0;
		const height = (this.parentElement.clientHeight * this.scale) | 0;
		this.camera.resize(width, height);

		this.canvas.style.imageRendering = 'crisp-edges'; // Firefox
		this.canvas.style.imageRendering = 'pixelated'; // Webkit
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
		this.initWebGL();
	}
}
