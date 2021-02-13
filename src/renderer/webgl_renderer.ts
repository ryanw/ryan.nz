import { Renderer } from './renderer';
import { Shader, ShaderOptions } from '../shader';
import { Vertex } from './vertex';
import { Actor, Instance } from '../actor';
import { Matrix4 } from '../geom';
import { Mesh } from '../mesh';
import { Scene } from '../scene';
import { Texture } from '../texture';
import { WebGLMesh } from './webgl_mesh';
import { WebGLRendererTexture } from './webgl_texture';
import { WebGLRenderTarget } from './webgl_render_target';
import { StaticMesh } from '../components/static_mesh';
import { RenderTexture } from '../render_texture';
import defaultVertSource from '../shaders/wireframe.vert.glsl';
import defaultFragSource from '../shaders/wireframe.frag.glsl';

const DEBUG_ENABLED = !PRODUCTION || window.location.search.indexOf('debug') !== -1;

export class WebGLRenderer extends Renderer {
	canvas: HTMLCanvasElement;
	debugEl: HTMLElement;
	defaultShader: Shader;
	scale = 1.0 * window.devicePixelRatio;
	lineWidth = 2 * window.devicePixelRatio;
	antiAlias = true;
	vsync = true;
	lastFrameAt = 0;
	frameAverage = 0;
	frame = 0;
	isGrabbed = false;
	seed = Math.random();
	private context: WebGLRenderingContext;
	private textures: Map<Texture, WebGLRendererTexture> = new Map();
	private meshes: Map<Mesh<Vertex>, WebGLMesh<Vertex>> = new Map();
	private renderTargets: Map<RenderTexture, WebGLRenderTarget> = new Map();

	constructor(el: HTMLElement) {
		super();
		if (el instanceof HTMLCanvasElement) {
			this.canvas = el;
		} else {
			this.canvas = document.createElement('canvas');
			if (el instanceof HTMLElement) {
				this.attach(el);
			}
		}

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
			this.parentElement.innerHTML = 'Failed to create a WebGL context';
			throw 'Failed to create WebGL context';
		}

		return this.context;
	}

	get width(): number {
		return this.canvas.clientWidth;
	}

	get height(): number {
		return this.canvas.clientHeight;
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

	grab(lock: boolean = false) {
		if (lock) {
			this.canvas.requestPointerLock();
		}
		this.isGrabbed = true;
		this.addEventListeners();
	}

	release() {
		this.isGrabbed = false;
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
		this.mousePosition[0] = e.clientX;
		this.mousePosition[1] = e.clientY;
		this.mouseMovement[0] += e.movementX;
		this.mouseMovement[1] += e.movementY;
	};

	clear() {
		const gl = this.gl;
		gl.clearDepth(1.0);
		gl.clearColor(...this.backgroundColor);
		gl.colorMask(true, true, true, false);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	drawActor(actor: Actor, projection?: Matrix4, parentModel?: Matrix4) {
		const { model, material, children } = actor;
		const actorModel = parentModel ? parentModel.multiply(model) : model;

		// TODO support multiple meshes on one actor?
		const mesh = actor.getComponentsOfType(StaticMesh)[0]?.mesh;

		if (actor.shader && !actor.shader.compiled) {
			actor.shader.make(this.gl);
		}

		if (mesh instanceof Mesh) {
			const gl = this.gl;
			const shader = actor.shader || this.defaultShader;
			const uniforms = shader.uniforms;
			shader.use(gl);

			let glMesh = this.meshes.get(mesh);
			if (!glMesh) {
				this.uploadMesh(mesh);
				glMesh = this.meshes.get(mesh);
			}

			if (projection) {
				gl.uniformMatrix4fv(uniforms.uViewProj.location, false, projection.toArray());
			}
			gl.uniform4fv(uniforms.uFogColor.location, this.backgroundColor);
			gl.uniform1f(uniforms.uLineWidth.location, this.lineWidth);
			gl.uniform1f(uniforms.uTime.location, performance.now());
			gl.uniform2fv(uniforms.uResolution.location, [this.camera.width, this.camera.height]);
			gl.uniform1f(uniforms.uSeed.location, this.seed);
			gl.uniformMatrix4fv(uniforms.uModel.location, false, actorModel.toArray());
			if (material?.color) {
				gl.uniform4fv(uniforms.uFillColor.location, material.color);
			}

			for (const uniformName in actor.uniforms) {
				const uniform = shader.uniforms[uniformName];
				if (!uniform) {
					throw `Unable to find '${uniformName}' uniform in shader`;
				}
				const value = actor.uniforms[uniformName];
				switch (uniform.type) {
					case WebGLRenderingContext.FLOAT:
						if (typeof value !== 'number') {
							throw `Uniform '${uniformName}' expected number but got: ${typeof value}`;
						}
						gl.uniform1f(uniform.location, value);
						break;

					case WebGLRenderingContext.INT:
						if (typeof value !== 'number') {
							throw `Uniform '${uniformName}' expected number but got: ${typeof value}`;
						}
						gl.uniform1i(uniform.location, value);
						break;

					case WebGLRenderingContext.FLOAT_VEC2:
						if (
							!Array.isArray(value) ||
							value.length !== 2 ||
							typeof value[0] !== 'number' ||
							typeof value[1] !== 'number'
						) {
							throw `Uniform '${uniformName}' expected an array of 2 numbers but got something else`;
						}
						gl.uniform2fv(uniform.location, value);
						break;

					// TODO other uniform types
					default:
						throw `Unsupported uniform type: ${uniform.type}`;
				}
			}

			shader.bind(gl, glMesh);
			if (actor.hasInstances) {
				shader.bindInstances(gl, glMesh);
				glMesh.drawInstances();
			} else {
				glMesh.draw();
			}
		}

		for (const child of children) {
			this.drawActor(child, projection, actorModel);
		}
	}

	uploadMesh(mesh: Mesh) {
		const gl = this.gl;

		// Link a Mesh with its WebGLMesh
		let glMesh = this.meshes.get(mesh);
		if (!glMesh) {
			glMesh = new WebGLMesh(gl);
			this.meshes.set(mesh, glMesh);
		}
		glMesh.upload(mesh);
	}

	uploadMeshInstances<I extends Instance = Instance>(mesh: Mesh, instances: I[]) {
		const gl = this.gl;

		// Link a Mesh with its WebGLMesh
		let glMesh = this.meshes.get(mesh);
		if (!glMesh) {
			glMesh = new WebGLMesh(gl);
			this.meshes.set(mesh, glMesh);
			glMesh.upload(mesh);
		}
		glMesh.uploadInstances(instances);
	}

	removeMesh(mesh: Mesh<Vertex>) {
		const glMesh = this.meshes.get(mesh);
		if (!glMesh) return;
		throw 'not yet implemented';
	}

	uploadTexture(texture: Texture, unit: number = null): number {
		const gl = this.gl;

		// Link a Texture with its WebGLRendererTexture
		let glTexture = this.textures.get(texture);
		if (!glTexture) {
			glTexture = new WebGLRendererTexture(gl);
			this.textures.set(texture, glTexture);
		}
		if (!unit && !glTexture.unit) {
			unit = this.textures.size;
		}
		glTexture.upload(texture, unit != null ? unit : glTexture.unit);

		return unit;
	}

	bindTexture(texture: Texture): number {
		let glTexture = this.textures.get(texture);
		if (!glTexture) {
			throw `Unable to find WebGLRendererTexture`;
		}
		return glTexture.bind();
	}

	createShader(vertSource: string, fragSource: string, options?: ShaderOptions): Shader {
		return new Shader(this.gl, vertSource, fragSource, options);
	}

	/**
	 * Wait for next animation frame and redraw everything
	 */
	async drawScene(scene: Scene, target?: RenderTexture): Promise<number> {
		return new Promise((resolve) => {
			const draw = () => {
				const now = performance.now();
				const dt = (now - this.lastFrameAt) / 1000.0;
				this.drawSync(scene, target);

				this.frame++;
				if (DEBUG_ENABLED && this.frame % 60 === 0) {
					const frameRate = (performance.now() - this.frameAverage) / 60;
					this.frameAverage = performance.now();
					const fps = (1 / (frameRate / 1000)) | 0;
					this.debugEl.innerHTML = `${fps} fps`;
					console.log('Draw time %o fps', fps);
				}

				resolve(dt);
			};
			if (target) {
				draw();
			} else if (this.vsync) {
				window.requestAnimationFrame(draw);
			} else {
				setTimeout(draw, 0);
			}
		});
	}

	drawSync(scene: Scene, target?: RenderTexture) {
		// Drawing to a texture
		let glTarget;
		if (target) {
			glTarget = this.renderTargets.get(target);
			if (!glTarget) {
				this.uploadTexture(target);
				const glTexture = this.textures.get(target);
				glTarget = new WebGLRenderTarget(this.gl, target.size, glTexture);
				this.renderTargets.set(target, glTarget);
			}
			
			// Resize to match size of texture
			this.updateSize(target.size, target.size);
			glTarget.bind();
		}

		this.backgroundColor = [...scene.backgroundColor];
		const now = performance.now();
		this.lastFrameAt = now;

		this.gl.viewport(0, 0, this.camera.width, this.camera.height);
		this.clear();

		// Uniforms
		const proj = this.camera.projection.clone();
		const view = this.camera.view.inverse();
		const viewProj = proj.multiply(view);

		for (const actor of scene.actors) {
			this.drawActor(actor, viewProj);
		}

		// Cleanup after drawing to texture
		if (target) {
			glTarget.unbind();
			this.updateSize();
		}
	}

	/**
	 * Update the framebuffer of the canvas to match its container's size
	 */
	updateSize(width?: number, height?: number) {
		if (!this.parentElement) {
			return;
		}
		const parentWidth = this.parentElement.clientWidth * this.scale | 0;
		const parentHeight = this.parentElement.clientHeight * this.scale | 0;
		width = width != null ? width : parentWidth;
		height = height != null ? height : parentHeight;
		this.camera.resize(width, height);

		this.canvas.style.imageRendering = 'crisp-edges'; // Firefox
		this.canvas.style.imageRendering = 'pixelated'; // Webkit
		this.canvas.style.width = this.parentElement.clientWidth + 'px';
		this.canvas.style.height = this.parentElement.clientHeight + 'px';
		this.canvas.setAttribute('width', parentWidth.toString());
		this.canvas.setAttribute('height', parentHeight.toString());
	}

	/**
	 * Insert the canvas into a HTMLElement
	 */
	attach(el: HTMLElement = null) {
		el?.appendChild(this.canvas);
		window.addEventListener('resize', this.updateSize.bind(this));
		this.updateSize();
		this.initWebGL();
		this.addEventListeners();

		if (DEBUG_ENABLED) {
			this.debugEl = document.createElement('div');
			this.canvas.parentElement?.appendChild(this.debugEl);
			Object.assign(this.debugEl.style, {
				position: 'fixed',
				borderRadius: '12px',
				zIndex: 10,
				right: '10px',
				top: '10px',
				color: 'red',
				fontSize: '32px',
				background: 'rgba(0, 0, 0, 0.5)',
				padding: '10px',
			});
		}
	}
}
