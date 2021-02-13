import { Mesh } from '../mesh';
import { Instance } from '../actor';
import { Scene } from '../scene';
import { Texture } from '../texture';
import { Camera } from '../camera';
import { RenderTexture } from '../render_texture';
import { Color } from '../material';

export abstract class Renderer {
	camera: Camera = new Camera();
	mousePosition = [0.0, 0.0];
	mouseMovement = [0.0, 0.0];
	mouseButtons = new Set();
	heldKeys = new Set();
	backgroundColor: Color = [0.0, 0.0, 0.0, 1.0];
	updateSize(width?: number, height?: number): void {}
	resetMouseMovement() {
		this.mouseMovement[0] = 0;
		this.mouseMovement[1] = 0;
	}
	abstract uploadMesh(mesh: Mesh): void;
	abstract uploadMeshInstances<I extends Instance = Instance>(mesh: Mesh, instances: I[]): void;
	abstract uploadTexture(texture: Texture, unit?: number): number;
	abstract bindTexture(texture: Texture): number;
	abstract async drawScene(scene: Scene, target?: RenderTexture): Promise<number>;
	abstract get width(): number;
	abstract get height(): number;
}
