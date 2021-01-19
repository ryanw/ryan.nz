import { Matrix4 } from './geom';
import { Pawn } from './pawn';

export class Camera extends Pawn {
	width: number;
	height: number;
	near: number = 1.0;
	far: number = 1000.0;
	projection: Matrix4;

	constructor(width: number = 1024, height: number = 768) {
		super();
		this.resize(width, height);
	}

	get view(): Matrix4 {
		return this.model;
	}

	translate(x: number, y: number, z: number) {
		const trans = Matrix4.translation(x, y, z);
		const rotation = this.rotationVector;

		// Ignore tilt
		const oldX = rotation[0];
		rotation[0] = 0.0;
		const rot = this.rotationMatrix;
		rotation[0] = oldX;
		const invRot = rot.inverse();

		let newPosition = trans.multiply(invRot).transformPoint3(this.position);
		newPosition = rot.transformPoint3(newPosition);
		this.position = newPosition;
	}

	resize(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.projection = Matrix4.perspective(width / height, 45.0, this.near, this.far);
	}
}
