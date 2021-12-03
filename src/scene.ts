import { Actor, ActorInstance } from './actor';
import { Texture } from './texture';
import { Renderer } from './renderer';
import { Color } from './material';
import { StaticMesh } from './components/static_mesh';
import { UniformValues } from './shader';

export class Scene {
	actors: Actor[] = [];
	textures: Map<number, Texture> = new Map();
	renderer: Renderer;
	backgroundColor: Color = [0.0, 0.0, 0.0, 1.0];
	uniforms?: UniformValues = {};

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

		const data = Array.from(actor.instances.values()).map((i: ActorInstance) => i.data);

		for (const component of actor.getComponentsOfType(StaticMesh)) {
			this.renderer.uploadMeshInstances(component.mesh, data);
		}
	}

	addTexture(texture: Texture): number {
		const id = this.renderer.uploadTexture(texture);
		this.textures.set(id, texture);
		return id;
	}

	getIdOfTexture(texture: Texture): number | null {
		for (let [id, value] of this.textures.entries()) {
			if (value === texture) return id;
		}

		return null;
	}

	updateTexture(textureOrId: Texture | number) {
		if (typeof textureOrId === 'number') {
			const texture = this.textures.get(textureOrId);
			if (!texture) {
				throw `Unable to find texture ${textureOrId}`;
			}
			this.renderer.uploadTexture(texture, textureOrId);
		} else {
			const id = this.getIdOfTexture(textureOrId);
			if (id == null) {
				throw `Attempted to upload an unknown texture`;
			}
			this.renderer.uploadTexture(textureOrId, id);
		}
	}

	bindTexture(textureOrId: Texture | number): number {
		const texture = typeof textureOrId === 'number' ? this.textures.get(textureOrId) : textureOrId;
		if (!texture) {
			throw `Unable to find texture`;
		}
		return this.renderer.bindTexture(texture);
	}

	unbindTexture(textureOrId: Texture | number) {
		const texture = typeof textureOrId === 'number' ? this.textures.get(textureOrId) : textureOrId;
		if (!texture) {
			throw `Unable to find texture`;
		}
		this.renderer.unbindTexture(texture);
	}

	async draw(): Promise<number> {
		return await this.renderer.drawScene(this);
	}
}
