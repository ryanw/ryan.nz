import { WebGLRenderer } from './renderer';
import SimplexNoise from './simplex-noise';
import { Terrain, WireTerrain, WeirdTerrain } from './meshes/terrain';
import { Cube, WireCube } from './meshes/cube';
import { Point3, Vector3, Matrix4 } from './geom';
import * as geom from './geom';
import { Pawn } from './renderer';

async function main() {
	const scene = new WebGLRenderer();
	scene.attach(document.body);

	// Camera
	scene.camera.position = [0.0, 0.0, 0.0];
	scene.camera.rotation = [-0.22, 0.3, 0.0];

	const landscape = new WeirdLandscape();

	// Add wobbly terrain
	const surface = new Pawn(new Terrain(landscape.height.bind(landscape)));
	surface.material.color = [0.0, 0.8, 1.0, 0.0];
	scene.addPawn(surface);

	const shapes: Pawn[] = [];
	for (let i = 0; i < 1000; i++) {
		const cube = new Pawn(new Cube());
		cube.material.color = [1.0, 0.8, 0.0, 1.0];
		scene.addPawn(cube);
		shapes.push(cube);
	}


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
	let speed = 50.0;
	let fastSpeed = 150.0;
	let o = 0.0;
	let dt = 0;
	let rot = 0.0;
	function update() {
		rot += 2.0 * dt;
		const grid = [20.0, 12.0, 20.0];
		const gridPos: Vector3 = [
			(scene.camera.position[0] / grid[0] | 0) * grid[0],
			(scene.camera.position[1] / grid[1] | 0) * grid[1],
			(scene.camera.position[2] / grid[2] | 0) * grid[2],
		];


		const r = [4, 3, 4];
		let i = 0;
		for (let z = -r[2]; z < r[2]; z++) {
			for (let y = -r[1]; y < r[1]; y++) {
				for (let x = -r[0]; x < r[0]; x++) {
					if (i >= shapes.length) {
						break;
					}
					const shape = shapes[i];
					const shapePos: Point3 = [
						(x * grid[0] | 0) + gridPos[0],
						(y * grid[1] | 0) + gridPos[1],
						(z * grid[2] | 0) + gridPos[2],
					];
					const offset = landscape.shapeOffset(shapePos);

					shape.model = Matrix4.identity()
						.multiply(Matrix4.translation(...shapePos))
						.multiply(Matrix4.translation(...offset))
						.multiply(Matrix4.scaling(0.5, 0.5, 0.5))
						.multiply(Matrix4.rotation(-rot, rot, 0.0))

					i++;
				}
			}
		}

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
		landscape.position = [...scene.camera.position];
		scene.camera.translate(velocity[0] * dt, velocity[1] * dt, velocity[2] * dt);
		if (scene.camera.position[1] < -4.0) {
			scene.camera.position[1] = -4.0;
		}
		if (scene.camera.position[1] > 10.0) {
			scene.camera.position[1] = 10.0;
		}

		const mouseSpeed = 40.0;
		const [mX, mY] = scene.mouseMovement;
		scene.mouseMovement = [0.0, 0.0];
		scene.camera.rotation[1] -= Math.PI * dt * (mX / mouseSpeed);
		scene.camera.rotation[0] -= Math.PI * dt * (mY / mouseSpeed);

		const terrainModel = Matrix4.translation(scene.camera.position[0] | 0, -6.0, scene.camera.position[2] | 0);
		const terrainOffset = [scene.camera.position[0] | 0, scene.camera.position[2] | 0];

		/*
		wireframe.model = terrainModel;
		(wireframe.mesh as Terrain).offset = terrainOffset;
		*/

		surface.model = terrainModel.multiply(Matrix4.translation(0.0, -0.005, 0.0)).multiply(Matrix4.scaling(1.0, 0.995, 1.0));
		(surface.mesh as Terrain).offset = terrainOffset;

		dt = await scene.redraw();
	}

}


class WeirdLandscape {
	position = [0.0, 0.0, 0.0];
	hillNoise = new SimplexNoise(0);
	seaNoise = new SimplexNoise(0);
	shapeNoise = new SimplexNoise(0);

	height(x: number, z: number, t: number = 0.0): number {
		// Flatten near camera
		const dx = this.position[0] - x;
		const dz = this.position[2] - z;
		const dist = Math.sqrt(dx * dx + dz * dz);

		const grid = 15.0;
		let val = this.hillNoise.noise2D((x | 0) / grid, (z | 0) / grid);

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
			val = 0.1 + 0.333 * this.seaNoise.noise2D(tt + x / g, tt - z / g);
		}
		if (val < 0.0) {
			val = 0;
		}

		return val;
	}

	shapeOffset(position: Point3): Vector3 {
		const scale = 40.0;
		const x = scale * this.shapeNoise.noise3D(position[0], position[1], position[2]);
		const y = 0.5 * scale * this.shapeNoise.noise3D(position[0], position[1], position[2] + 1000);
		const z = scale * this.shapeNoise.noise3D(position[0], position[1], position[2] + 2000);

		return [x, y, z];
	}
}


window.addEventListener('DOMContentLoaded', main);
