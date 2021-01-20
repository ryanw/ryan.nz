import { Matrix4, Point3, Vector3 } from './geom';
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

	constructor(meshOrChildren?: Mesh | Pawn[], options: PawnOptions = {}) {
		const material = options.material || new Material();
		material.color = options.color || material.color;

		this.material = material;
		if (options.model) {
			this.model = options.model;
		}

		if (meshOrChildren instanceof Mesh) {
			this.mesh = meshOrChildren;
		} else if (meshOrChildren instanceof Array) {
			this.children = meshOrChildren;
		}
	}

	get translationMatrix(): Matrix4 {
		return this.model.extractTranslation();
	}

	get rotationMatrix(): Matrix4 {
		return this.model.extractRotation();
	}

	get position(): Point3 {
		return this.model.transformPoint3([0.0, 0.0, 0.0]);
	}

	set position(pos: Point3) {
		const mat = this.model.toArray();
		mat[3] = pos[0];
		mat[7] = pos[1];
		mat[11] = pos[2];
		this.model = new Matrix4(mat);
	}

	get rotationVector(): Vector3 {
		const vec = this.model.multiplyVector4([0.0, 0.0, 1.0, 0.0]);
		return [vec[0], vec[1], vec[2]];
	}
}
