import { Mesh } from '../mesh';
import { Vertex } from './vertex';
import { Scene } from '../scene';

export abstract class Renderer {
	abstract uploadMesh(_mesh: Mesh<Vertex>): void;
	abstract async drawScene(_scene: Scene): Promise<number>;
}
