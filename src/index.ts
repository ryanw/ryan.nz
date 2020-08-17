import { WebGLRenderer } from './renderer';
import SimplexNoise from './simplex-noise';
import { Terrain, WireTerrain, WeirdTerrain } from './meshes/terrain';
import { Cube, WireCube } from './meshes/cube';
import { Vector3, Matrix4 } from './geom';
import * as geom from './geom';
import { Pawn } from './renderer';

async function main() {
	const scene = new WebGLRenderer();
	scene.attach(document.body);

	// Camera
	scene.camera.position = [0.0, 0.0, 0.0];
	scene.camera.rotation = [-0.22, 0.3, 0.0];

	const noise = new SimplexNoise(0);
	const noise2 = new SimplexNoise(0);
	function simplexHeight(x: number, z: number, t: number = 0.0): number {
		// Flatten near camera
		const dx = scene.camera.position[0] - x;
		const dz = scene.camera.position[2] - z;
		const dist = Math.sqrt(dx * dx + dz * dz);

		const grid = 15.0;
		let val = noise.noise2D((x | 0) / grid, (z | 0) / grid);

		val -= 0.4;
		val = Math.max(0.0, val);
		val *= 20;

		const falloff = 10;
		if (dist < falloff) {
			val = val * (dist / falloff);
			if (val < 0.0) {
				val = 0;
			}
		}

		if (val === 0.0) {
			const g = grid * 0.5;
			const tt = t * 0.2;
			val = 0.1 + 0.333 * noise2.noise2D(tt + x / g, tt - z / g);
		}
		if (val < 0.0) {
			val = 0;
		}

		return val;
	}

	// Add wobbly terrain
	const wireframe = new Pawn(new WireTerrain(simplexHeight));
	wireframe.material.color = [0.0, 0.8, 1.0, 1.0];
	scene.addPawn(wireframe);
	const surface = new Pawn(new Terrain(simplexHeight));
	surface.material.color = [0.1, 0.01, 0.05, 1.0];
	scene.addPawn(surface);

	document.addEventListener('keydown', (e) => {
		if (e.key === " ") {
			if (scene.isGrabbed) {
				scene.release();
			} else {
				scene.grab();
			}
		}
	});
	document.addEventListener('pointerlockchange', (e) => {
		if (scene.isGrabbed) {
			document.body.className = 'grabbed';
		} else {
			document.body.className = '';
		}
	});

	let velocity: Vector3 = [0.0, 0.0, 0.0];
	let speed = 40.0;
	let fastSpeed = 100.0;
	let o = 0.0;
	let dt = 0;
	function update() {
		if (!scene.isGrabbed) {
			velocity = [0.0, 0.0, -2.0];
			return;
		}

		let s = scene.heldKeys.has('shift') ? fastSpeed : speed;
		if (scene.heldKeys.has("w")) {
			velocity[2] += -s * dt;
		}
		else if (scene.heldKeys.has("w")) {
			velocity[2] += -s * dt;
		}
		if (scene.heldKeys.has("s")) {
			velocity[2] += s * dt;
		}
		if (scene.heldKeys.has("a")) {
			velocity[0] += -s * dt;
		}
		if (scene.heldKeys.has("d")) {
			velocity[0] += s * dt;
		}
		if (scene.heldKeys.has("q")) {
			velocity[1] += -s * dt;
		}
		if (scene.heldKeys.has("e")) {
			velocity[1] += s * dt;
		}

		const maxSpeed = 200.0;
		const damp = 0.9;
		velocity = velocity.map(s => {
			const oldS = s;
			let newS = Math.min(maxSpeed, Math.max(-maxSpeed, s * damp));
			if ((oldS < 0 && newS > 0) || (oldS > 0 && newS < 0)) {
				newS = 0;
			}
			if (Math.abs(newS) < 0.01) {
				newS = 0;
			}
			return newS;
		}) as Vector3;
	}

	while (true) {
		update();
		const oldRot = scene.camera.rotation[0];
		scene.camera.rotation[0] = 0.0;
		scene.camera.translate(velocity[0] * dt, velocity[1] * dt, velocity[2] * dt);
		if (scene.camera.position[1] < -4.0) {
			scene.camera.position[1] = -4.0;
		}
		if (scene.camera.position[1] > 10.0) {
			scene.camera.position[1] = 10.0;
		}
		scene.camera.rotation[0] = oldRot;

		const mouseSpeed = 40.0;
		const [mX, mY] = scene.mouseMovement;
		scene.mouseMovement = [0.0, 0.0];
		scene.camera.rotation[1] -= Math.PI * dt * (mX / mouseSpeed);
		scene.camera.rotation[0] -= Math.PI * dt * (mY / mouseSpeed);

		const terrainModel = Matrix4.translation(scene.camera.position[0] | 0, -6.0, scene.camera.position[2] | 0);
		const terrainOffset = [scene.camera.position[0] | 0, scene.camera.position[2] | 0];

		wireframe.model = terrainModel;
		surface.model = terrainModel.multiply(Matrix4.translation(0.0, -0.005, 0.0)).multiply(Matrix4.scaling(1.0, 0.995, 1.0));
		(wireframe.mesh as Terrain).offset = terrainOffset;
		(surface.mesh as Terrain).offset = terrainOffset;

		dt = await scene.redraw();
	}

}


window.addEventListener('DOMContentLoaded', main);
