import { Mesh } from './mesh';
import { Pawn, PawnInstance, Instance } from './pawn';
import { Texture } from './texture';
import { Renderer } from './renderer';
import { Color } from './material';

export class Scene {
	pawns: Pawn[] = [];
	textures: Texture[] = [];
	renderer: Renderer;
	backgroundColor: Color = [0.0, 0.0, 0.0, 1.0];

	constructor(renderer: Renderer) {
		this.renderer = renderer;
	}

	addPawn(pawn: Pawn): number {
		const { mesh, children } = pawn;

		if (mesh) {
			this.renderer.uploadMesh(mesh);
		}
		this.pawns.push(pawn);

		for (const child of children) {
			if (child.mesh) {
				this.renderer.uploadMesh(child.mesh);
			}
		}

		this.uploadPawnInstances(pawn);
		return this.pawns.length - 1;
	}

	uploadPawnInstances(pawn: Pawn) {
		const { mesh, hasInstances } = pawn;
		if (!hasInstances || !mesh) {
			return;
		}

		const data = Array.from(pawn.instances.values()).map((i: PawnInstance) => i.data)
		this.renderer.uploadMeshInstances(mesh, data);
	}

	addTexture(texture: Texture): number {
		this.textures.push(texture);
		const id = this.textures.length - 1;
		this.renderer.uploadTexture(texture, id);
		return id;
	}

	updateTexture(textureOrId: Texture | number) {
		if (typeof textureOrId === 'number') {
			const texture = this.textures[textureOrId];
			if (!texture) {
				throw `Unable to find texture ${textureOrId}`;
			}
			this.renderer.uploadTexture(texture, textureOrId);
		} else {
			const id = this.textures.indexOf(textureOrId);
			if (id === -1) {
				throw `Attempted to upload an unknown texture`;
			}
			this.renderer.uploadTexture(textureOrId, id);
		}
	}

	bindTexture(textureOrId: Texture | number): number {
		const texture = typeof textureOrId === 'number' ? this.textures[textureOrId] : textureOrId;
		const unit = this.textures.indexOf(texture);
		if (!texture) {
			throw `Unable to find texture ID: ${unit}`;
		}
		return this.renderer.bindTexture(texture);
	}

	async draw(): Promise<number> {
		return await this.renderer.drawScene(this);
	}
}
