import { Component } from '../component';
import { Mesh } from '../mesh';

export class StaticMesh extends Component {
	mesh: Mesh;

	constructor(mesh: Mesh) {
		super();
		this.mesh = mesh;
	}
}
