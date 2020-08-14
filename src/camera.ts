import { Matrix4, Point3, Vector3 } from './geom';

export class Camera {
	width: number;
	height: number;
	near: number = 1.0;
	far: number = 1000.0;
	projection: Matrix4;
	position: Point3 = [0.0, 0.0, 0.0];
	rotation: Vector3 = [0.0, 0.0, 0.0];
	scaling: Vector3 = [1.0, 1.0, 1.0];

	constructor(width: number = 1024, height: number = 768) {
		this.resize(width, height);
	}

	get view(): Matrix4 {
		return Matrix4.translation(...this.position)
			.multiply(Matrix4.rotation(this.rotation));
	}

	resize(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.projection = Matrix4.perspective(width / height, 45.0, this.near, this.far);
	}
}
