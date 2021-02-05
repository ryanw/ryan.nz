import { Mesh } from '../mesh';
import { Vertex } from './vertex';
import { Scene } from '../scene';
import { Texture } from '../texture';

export abstract class Renderer {
	abstract uploadMesh(mesh: Mesh<Vertex>): void;
	abstract uploadTexture(texture: Texture, unit: number): void;
	abstract bindTexture(texture: Texture): number;
	abstract async drawScene(scene: Scene): Promise<number>;
}
