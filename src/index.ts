import { WebGLRenderer } from './renderer';
import { Terrain } from './meshes/terrain';
import { Cube } from './meshes/cube';
import { Sun } from './meshes/sun';
import { Road } from './meshes/road';
import { Matrix4 } from './geom';
import { Pawn } from './pawn';
import { Camera } from './camera';

import roadVertexSource from './shaders/road.vert.glsl';
import roadFragmentSource from './shaders/road.frag.glsl';
import sunVertexSource from './shaders/sun.vert.glsl';
import sunFragmentSource from './shaders/sun.frag.glsl';

type Rect = [number, number, number, number];
function rectOverlaps(rect0: Rect, rect1: Rect): boolean {
	const l0 = rect0[0];
	const t0 = rect0[1];
	const r0 = l0 + rect0[2];
	const b0 = t0 + rect0[3];
	const l1 = rect1[0];
	const t1 = rect1[1];
	const r1 = l1 + rect1[2];
	const b1 = t1 + rect1[3];


	if (l0 > r1 || r0 < l1) {
		return false;
	}
	if (t0 > b1 || b0 < t1) {
		return false;
	}

	return true;
}

function createCityscape(radius: number, count: number): Pawn[] {
	const pawns: Pawn[] = [];
	const buildings: Rect[] = [];

	const maxAttempts = count * 10;
	let attempts = 0;
	for (let i = 1; i <= count; i++) {
		// Building shape
		const width = 1.0 + Math.random() * 2;
		const depth = 0.5 + Math.random() * 2;

		// Building position
		pos: while(attempts < maxAttempts) {
			attempts += 1;

			const angle = Math.random()  * Math.PI * 2;
			const dist = Math.random() * radius;
			const height = 1.0 + Math.random() * 2 * ((radius - dist) / 10);
			const x = dist * Math.cos(angle);
			const y = height;
			const z = dist * Math.sin(angle);
			const newBuilding: Rect = [x - width, z - depth, width * 2, depth * 2];

			// Test for collision with existing building
			for (const building of buildings) {

				if (rectOverlaps(building, newBuilding)) {
					continue pos;
				}
			}


			buildings.push(newBuilding);

			pawns.push(
				new Pawn(new Cube(), {
					color: [Math.random(), Math.random(), Math.random(), 1.0],
					model: Matrix4.translation(x, y, z).multiply(Matrix4.scaling(width, height, depth)),
				})
			);
			break pos;
		}
	}
	return pawns;
}

async function main() {
	const scene = new WebGLRenderer();
	scene.attach(document.body);

	// Add a camera
	const camera = new Camera();
	scene.addPawn(camera);
	scene.camera = camera;
	scene.updateSize();

	// Add terrain
	const surface = new Pawn(new Terrain(), {
		color: [0.0, 0.8, 1.0, 0.0],
		model: Matrix4.translation(0.0, -4.0, -320.0).multiply(Matrix4.scaling(7.5, 1.0, 20.0)),
	});
	scene.addPawn(surface);

	// Test Cube
	const cube = new Pawn(new Cube(), {
		color: [1.0, 1.0, 0.0, 1.0],
		model: Matrix4.translation(0.0, 0.0, 0.0).multiply(Matrix4.scaling(0.1, 0.1, 0.1)),
	});
	scene.addPawn(cube);

	// Add cityscape
	const city = new Pawn(createCityscape(100, 300), {
		model: Matrix4.translation(0, -4.0, -400.0),
	});
	scene.addPawn(city);

	// Add road
	const roadShader = scene.createShader(
		roadVertexSource,
		roadFragmentSource, {
		attributes: {
			direction: {
				size: 1,
				type: WebGLRenderingContext.FLOAT,
			},
		},
	});
	const road = new Pawn(new Road(), {
		color: [1.0, 0.0, 1.0, 1.0],
		model: Matrix4.translation(0.0, -4.9, -200.0).multiply(Matrix4.scaling(5, 1, 200)),
		shader: roadShader,
	});
	scene.addPawn(road);

	// Add car
	const car = new Pawn(new Cube(), {
		color: [1.0, 1.0, 0.0, 1.0],
		model: Matrix4.translation(0.0, -3.4, -14.0).multiply(Matrix4.scaling(1.2, 0.5, 2.5)),
	});
	scene.addPawn(car);


	// Add sun
	const sunShader = scene.createShader(sunVertexSource, sunFragmentSource);
	const sun = new Pawn(new Sun(), {
		color: [1.0, 1.0, 0.0, 1.0],
		model: Matrix4.translation(0.0, 20.0, -500.0).multiply(Matrix4.scaling(60, 60, 60)),
		shader: sunShader,
	});
	scene.addPawn(sun);

	// TODO Add trees

	// TODO Add mountains

	// Toggle control
	document.addEventListener('keydown', (e) => {
		if (e.key === ' ') {
			if (scene.isGrabbed) {
				scene.release();
			} else {
				scene.grab();
			}
		}
	});

	document.addEventListener('pointerlockchange', () => {
		if (scene.isGrabbed) {
			document.body.className = 'grabbed';
		} else {
			document.body.className = '';
		}
	});

	scene.addEventListeners();
	while (true) {
		await scene.redraw();
		
		if (scene.mouseButtons.has(0)) {
			const mouseSpeed = 0.0005;
			const [mX, mY] = scene.mouseMovement;

			const x = mY * mouseSpeed;
			const y = mX * mouseSpeed;

			scene.camera.rotate(x, y);
		}
		scene.resetMouseMovement();

		if (scene.heldKeys.has('w')) {
			camera.translate(0.0, 0.0, -1.0);
		}

		if (scene.heldKeys.has('s')) {
			camera.translate(0.0, 0.0, 1.0);
		}

		if (scene.heldKeys.has('a')) {
			camera.translate(-1.0, 0.0, 0.0);
		}

		if (scene.heldKeys.has('d')) {
			camera.translate(1.0, 0.0, 0.0);
		}

		if (scene.heldKeys.has('q')) {
			camera.translate(0.0, -1.0, 0.0);
		}

		if (scene.heldKeys.has('e')) {
			camera.translate(0.0, 1.0, 0.0);
		}
	}
}

window.addEventListener('DOMContentLoaded', main);
