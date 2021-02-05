import { FancyMesh as Mesh } from '../fancy_mesh';
import { Mesh as LegacyMesh } from '../mesh';
import { Vertex } from './vertex';
import { Scene } from '../scene';

export abstract class Renderer {
	abstract uploadMesh(_mesh: Mesh<Vertex> | LegacyMesh): void;
	abstract async drawScene(_scene: Scene): Promise<number>;
}
