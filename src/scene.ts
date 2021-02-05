import { Pawn } from './pawn';
import { Renderer } from './renderer';

export class Scene {
	pawns: Pawn[] = [];
	renderer: Renderer;

	constructor(renderer: Renderer) {
		this.renderer = renderer;
	}

	addPawn(pawn: Pawn): number {
		if (pawn.mesh) {
			this.renderer.uploadMesh(pawn.mesh);
		}
		this.pawns.push(pawn);

		for (const child of pawn.children) {
			if (child.mesh) {
				this.renderer.uploadMesh(child.mesh);
			}
		}
		return this.pawns.length - 1;
	}

	async draw(): Promise<number> {
		return await this.renderer.drawScene(this);
	}
}
