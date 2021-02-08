import { Matrix4, Point3, Vector3 } from './geom';
import { Mesh, Vertex } from './mesh';
import { Material, Color } from './material';
import { Shader } from './shader';

export type UniformValues = { [key: string]: number | number[] };

export interface Instance {
	[key: string]: number | number[] | Matrix4;
}

export type PawnInstance<I extends Instance = Instance> = {
	pawn: Pawn;
	data: I;
}

export interface PawnOptions {
	color?: Color;
	material?: Material;
	model?: Matrix4;
	shader?: Shader;
	uniforms?: UniformValues;
}

export class Pawn<I extends Instance = Instance> {
	mesh: Mesh;
	model: Matrix4 = Matrix4.identity();
	material: Material = new Material();
	shader?: Shader;
	uniforms: UniformValues = {};
	children: Pawn[] = [];
	instances: Map<number, PawnInstance> = new Map();
	private nextInstanceId = 1;

	constructor(meshOrChildren?: Mesh<Vertex> | Pawn[], options: PawnOptions = {}) {
		const material = options.material || new Material();
		material.color = options.color || material.color;

		this.material = material;

		if (options.model) {
			this.model = options.model;
		}

		if (options.shader) {
			this.shader = options.shader;
		}

		if (options.uniforms) {
			this.uniforms = {
				...this.uniforms,
				...options.uniforms,
			};
		}

		if (meshOrChildren instanceof Array) {
			this.children = meshOrChildren;
		} else if (meshOrChildren instanceof Mesh) {
			this.mesh = meshOrChildren;
		}
	}

	instance(data: I): number {
		const id = this.nextInstanceId++;

		const instance = {
			id,
			pawn: this,
			data: { ...data },
		};
		this.instances.set(id, instance);

		return id;
	}

	get hasInstances(): boolean {
		return this.instances.size !== 0;
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
