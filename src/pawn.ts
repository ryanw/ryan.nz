import { Matrix4 } from './geom';
import { Mesh } from './mesh';
import { Material, Color } from './material';

export interface PawnOptions {
	color?: Color;
	material?: Material;
	model?: Matrix4;
}

export class Pawn {
	mesh: Mesh;
	model: Matrix4 = Matrix4.identity();
	material: Material = new Material();
	children: Pawn[] = [];

	constructor(meshOrChildren: Mesh | Pawn[], options: PawnOptions = {}) {
		const material = options.material || new Material();
		material.color = options.color || material.color;

		this.material = material;
		this.model = options.model || Matrix4.identity();

		if (meshOrChildren instanceof Mesh) {
			this.mesh = meshOrChildren;
		} else if (meshOrChildren instanceof Array) {
			this.children = meshOrChildren;
		}
	}
}
