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
		return Matrix4.identity()
			.multiply(Matrix4.translation(...this.position))
			.multiply(this.rotationMatrix)
			.multiply(Matrix4.scaling(...this.scaling));
	}

	get rotationMatrix(): Matrix4 {
		return Matrix4.identity()
			.multiply(Matrix4.rotation(0, 0, this.rotation[2]))
			.multiply(Matrix4.rotation(0, this.rotation[1], 0))
			.multiply(Matrix4.rotation(this.rotation[0], 0, 0));
	}

	translate(x: number, y: number, z: number) {
		const trans = Matrix4.translation(x, y, z);

		// Ignore tilt
		const oldX = this.rotation[0];
		this.rotation[0] = 0.0;
		const rot = this.rotationMatrix;
		this.rotation[0] = oldX;
		const invRot = rot.inverse();

		let newPosition = trans.multiply(invRot).transformPoint3(this.position);
		newPosition = rot.transformPoint3(newPosition)
		this.position = newPosition;
	}

	resize(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.projection = Matrix4.perspective(width / height, 45.0, this.near, this.far);
	}
}
