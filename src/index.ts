import { WebGLRenderer } from './renderer';
import SimplexNoise from './simplex-noise';
import { Terrain, WireTerrain, WeirdTerrain } from './meshes/terrain';
import { Cube, WireCube } from './meshes/cube';
import { Point3, Vector3, Matrix4 } from './geom';
import * as geom from './geom';
import { Pawn } from './renderer';

function remap(value: number, min0: number, max0: number, min1: number, max1: number): number {
	return min1 + (max1 - min1) * (value - min0) / (max0 - min0);
}

async function main() {
	const scene = new WebGLRenderer();
	scene.attach(document.body);

	// Camera
	scene.camera.position = [0.0, 0.0, 0.0];
	scene.camera.rotation = [-0.22, 0.3, 0.0];

	const landscape = new WeirdLandscape();

	// Add wobbly terrain
	const surface = new Pawn(new Terrain(landscape.height.bind(landscape)));
	surface.model = Matrix4.translation(0.0, -4.0, 0.0).multiply(Matrix4.scaling(1.0, 0.995, 1.0));
	surface.material.color = [0.0, 0.8, 1.0, 0.0];
	scene.addPawn(surface);

	const actor = new Pawn(new Cube());
	actor.material.color = [1.0, 0.0, 0.0, 1.0];
	scene.addPawn(actor);

	// Some shapes to randomise
	const shapes: Pawn[] = [];
	for (let i = 0; i < 500; i++) {
		const cube = new Pawn(new Cube());
		cube.material.color = [1.0, 0.8, 0.0, 1.0];
		scene.addPawn(cube);
		shapes.push(cube);
	}


	// Toggle control
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

	let actorModel = Matrix4.identity();
	let actorPos = scene.camera.position.slice() as Vector3;
	let velocity: Vector3 = [0.0, 0.0, 0.0];
	let speed = 50.0;
	let fastSpeed = 150.0;
	let o = 0.0;
	let dt = 0;
	let rot = 0.0;
	function update() {
		actorModel = Matrix4.identity()
			.multiply(scene.camera.rotationMatrix)
			.multiply(Matrix4.translation(0.0, 0.0, -35.0))
			.multiply(scene.camera.rotationMatrix.inverse());
		// Move in front of the camera so we don't render too much behind the camera
		actorPos = actorModel.transformPoint3(scene.camera.position);
		//actor.model = Matrix4.translation(...actorPos).multiply(Matrix4.scaling(0.333, 0.333, 0.333));

		rot += 0.25 * dt;
		const grid = [20.0, 50.0, 20.0];
		const gridPos: Vector3 = [
			(actorPos[0] / grid[0] | 0) * grid[0],
			(actorPos[1] / grid[1] | 0) * grid[1],
			(actorPos[2] / grid[2] | 0) * grid[2],
		];
		landscape.offset = actorModel.inverse().transformPoint3([0.0, 0.0, 0.0]);


		const r = [3, 1, 3];
		let i = 0;
		for (let z = -r[2]; z < r[2]; z++) {
			for (let y = 1; y < r[1] * 2; y++) {
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
					shapePos[0] += offset[0];
					shapePos[1] += offset[1] - 50.0;
					shapePos[2] += offset[2];

					const delta = [
						shapePos[0] - scene.camera.position[0],
						shapePos[1] - scene.camera.position[1],
						shapePos[2] - scene.camera.position[2],
					];

					const dist = Math.sqrt(Math.pow(delta[0], 2) + Math.pow(delta[1], 2) + Math.pow(delta[2], 2));
					const scale = Math.max(0.0, Math.min(1.0, remap(dist, 3.0, 10.0, 0.0, 1.0))) * remap(Math.sin(rot * 2), 0, Math.PI, 0.7, 1.5);

					shape.model = Matrix4.identity()
						.multiply(Matrix4.translation(...shapePos))
						.multiply(Matrix4.scaling(scale, scale, scale))
						.multiply(Matrix4.rotation(
							rot * offset[0] * 0.1,
							rot * offset[1] * 0.1,
							rot * offset[2] * 0.1,
						))

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

	const frameInterval = 60;
	let startTime = performance.now();
	let frameCount = 0;
	while (true) {
		update();
		landscape.position = [...actorPos];
		scene.camera.translate(velocity[0] * dt, velocity[1] * dt, velocity[2] * dt);
		if (scene.camera.position[1] < -4.0) {
			scene.camera.position[1] = -4.0;
		}
		if (scene.camera.position[1] > 10.0) {
			scene.camera.position[1] = 10.0;
		}

		const mouseSpeed = 0.0005;
		const [mX, mY] = scene.mouseMovement;
		scene.mouseMovement = [0.0, 0.0];
		scene.camera.rotation[1] -= Math.PI * (mX * mouseSpeed);
		scene.camera.rotation[0] -= Math.PI * (mY * mouseSpeed);

		const terrainModel = Matrix4.translation(actorPos[0] | 0, -6.0, actorPos[2] | 0);
		const terrainOffset = [actorPos[0] | 0, actorPos[2] | 0];

		surface.model = terrainModel.multiply(Matrix4.translation(0.0, -0.005, 0.0)).multiply(Matrix4.scaling(1.0, 0.995, 1.0));
		(surface.mesh as Terrain).offset = terrainOffset;

		dt = await scene.redraw();
		if (frameCount % frameInterval === 0) {
			const frameTime = (performance.now() - startTime) / frameInterval;
			startTime = performance.now();
			//console.log("frame time: %sms   %sfps", frameTime.toFixed(2), (1000 / frameTime).toFixed(2));
		}
		frameCount++;
	}

}

class WeirdLandscape {
	position = [0.0, 0.0, 0.0];
	hillNoise = new SimplexNoise(0);
	seaNoise = new SimplexNoise(0);
	shapeNoise = new SimplexNoise(0);

	oceanLevel = 0.0;
	offset: Vector3 = [0.0, 0.0, 0.0];

	height(x: number, z: number, t: number = 0.0): number {
		// Distance from center
		const dx = this.offset[0] + this.position[0] - x;
		const dz = this.offset[2] + this.position[2] - z;
		const dist = Math.sqrt(dx * dx + dz * dz);

		// Create lumpy space
		const grid = 17.0;
		let val = 0.0;
		val = -0.5 + this.hillNoise.noise2D((x | 0) / grid, (z | 0) / grid);
		val *= 20.0;
		if (val < 0.0) {
			val = 0;
		}

		// Flatten near camera
		const falloff = 10;
		if (dist < falloff) {
			val = val * (dist / falloff);
			if (val < 0.0) {
				val = 0;
			}
		}

		// Add noise to the "ocean"
		if (val === 0.0) {
			const g = grid * 0.5;
			const tt = t * 0.2;
			val = 0.1 + 0.333 * this.seaNoise.noise2D(tt + x / g, tt - z / g);
		}

		// Clamp
		if (val < 0.0) {
			val = 0;
		}

		return val;
	}

	shapeOffset(position: Point3): Vector3 {
		const scale = 40.0;
		const x = scale * this.shapeNoise.noise3D(position[0], position[1], position[2]);
		const y = scale * this.shapeNoise.noise3D(position[0], position[1], position[2] + 1000);
		const z = scale * this.shapeNoise.noise3D(position[0], position[1], position[2] + 2000);

		return [x, y, z];
	}
}


window.addEventListener('DOMContentLoaded', main);
