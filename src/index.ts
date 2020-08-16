import { WebGLRenderer } from './renderer';
import SimplexNoise from './simplex-noise';
import { Terrain, WireTerrain, WeirdTerrain } from './meshes/terrain';
import { Cube, WireCube } from './meshes/cube';
import { Matrix4 } from './geom';
import { Pawn } from './renderer';

async function main() {
	const scene = new WebGLRenderer();
	scene.attach(document.body);

	// Camera
	scene.camera.position = [0.0, 0.0, 0.0];
	scene.camera.rotation = [-0.45, 0.0, 0.0];

	const noise = new SimplexNoise(0);
	function simplexHeight(x: number, z: number): number {
		const grid = 20.0;
		const s = 2.0;
		const val = noise.noise2D((x | 0) / grid * s, (z | 0) / grid * s);
		return val * 2;
	}

	// Add wobbly terrain
	const wireframe = new Pawn(new WireTerrain(simplexHeight));
	wireframe.model = Matrix4.translation(0.0, -6.0, 0.0);
	wireframe.material.color = [0.0, 0.8, 1.0, 1.0];
	scene.addPawn(wireframe);
	const surface = new Pawn(new Terrain(simplexHeight));
	surface.model = Matrix4.translation(0.0, -6.01, 0.0);
	surface.material.color = [0.1, 0.01, 0.05, 1.0];
	scene.addPawn(surface);
	const dots = new Pawn(new WireTerrain(simplexHeight));
	(dots.mesh as Terrain).target = WebGLRenderingContext.POINTS;
	dots.model = Matrix4.translation(0.0, -5.99, 0.0);
	dots.material.color = [1.0, 0.0, 0.8, 1.0];
	scene.addPawn(dots);

	let locked = false;
	document.addEventListener('keydown', (e) => {
		if (e.key === " ") {
			if (scene.isGrabbed) {
				scene.release();
			} else {
				scene.grab();
			}
		}
	});

	let o = 0.0;
	let dt = 0;
	while (true) {
		//wireframe.model = Matrix4.translation(0.0, -1.0, o).multiply(Matrix4.scaling(0.3, 0.3, 0.3));
		//(wireframe.mesh as Terrain).offset[1] = o;
		if (scene.heldKeys.has("w")) {
			scene.camera.translate(0, 0, -10.0 * dt);
		}
		if (scene.heldKeys.has("s")) {
			scene.camera.translate(0, 0, 10.0 * dt);
		}
		if (scene.heldKeys.has("a")) {
			scene.camera.translate(-10.0 * dt, 0, 0);
		}
		if (scene.heldKeys.has("d")) {
			scene.camera.translate(10.0 * dt, 0, 0);
		}
		if (scene.heldKeys.has("q")) {
			scene.camera.translate(0, -10.0 * dt, 0);
		}
		if (scene.heldKeys.has("e")) {
			scene.camera.translate(0, 10.0 * dt, 0);
		}

		const mouseSpeed = 20.0;
		const [mX, mY] = scene.mouseMovement;
		scene.mouseMovement = [0.0, 0.0];
		scene.camera.rotation[1] -= Math.PI * dt * (mX / mouseSpeed);
		scene.camera.rotation[0] -= Math.PI * dt * (mY / mouseSpeed);

		dt = await scene.redraw();
	}

}


window.addEventListener('DOMContentLoaded', main);
