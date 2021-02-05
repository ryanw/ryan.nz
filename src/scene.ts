import { Pawn } from './pawn';
import { Texture } from './texture';
import { Renderer } from './renderer';

export class Scene {
	pawns: Pawn[] = [];
	textures: Texture[] = [];
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
			const id = this.textures.indexOf(textureOrId)
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
