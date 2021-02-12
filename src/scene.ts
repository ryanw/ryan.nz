import { Actor, ActorInstance } from './actor';
import { Texture } from './texture';
import { Renderer } from './renderer';
import { Color } from './material';
import { StaticMesh } from './components/static_mesh';

export class Scene {
	actors: Actor[] = [];
	textures: Texture[] = [];
	renderer: Renderer;
	backgroundColor: Color = [0.0, 0.0, 0.0, 1.0];

	constructor(renderer: Renderer) {
		this.renderer = renderer;
	}

	addActor(actor: Actor): number {
		const { children } = actor;

		for (const component of actor.getComponentsOfType(StaticMesh)) {
			this.renderer.uploadMesh(component.mesh);
		}

		for (const child of children) {
			for (const component of child.getComponentsOfType(StaticMesh)) {
				this.renderer.uploadMesh(component.mesh);
			}
		}

		this.uploadActorInstances(actor);

		this.actors.push(actor);
		return this.actors.length - 1;
	}

	uploadActorInstances(actor: Actor) {
		const { hasInstances } = actor;
		if (!hasInstances) {
			return;
		}

		const data = Array.from(actor.instances.values()).map((i: ActorInstance) => i.data)

		for (const component of actor.getComponentsOfType(StaticMesh)) {
			this.renderer.uploadMeshInstances(component.mesh, data);
		}
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
