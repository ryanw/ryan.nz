import { WebGLRenderer } from './renderer';
import { Terrain } from './meshes/terrain';
import { Obj } from './meshes/obj';
import { Cube } from './meshes/cube';
import { Sun } from './meshes/sun';
import { Road } from './meshes/road';
import { Pawn } from './pawn';
import { Camera } from './camera';
import { Point3, Vector3, Matrix4 } from './geom';
import SimplexNoise from './simplex-noise';

import deloreanObj from './delorean.obj';
import roadVertexSource from './shaders/road.vert.glsl';
import roadFragmentSource from './shaders/road.frag.glsl';
import sunVertexSource from './shaders/sun.vert.glsl';
import sunFragmentSource from './shaders/sun.frag.glsl';
import carVertexSource from './shaders/car.vert.glsl';
import carFragmentSource from './shaders/car.frag.glsl';
import terrainVertexSource from './shaders/terrain.vert.glsl';
import terrainFragmentSource from './shaders/terrain.frag.glsl';

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
		const width = 3.0 + Math.random() * 3;
		const depth = 3.5 + Math.random() * 3;

		// Building position
		pos: while(attempts < maxAttempts) {
			attempts += 1;

			const angle = Math.random()  * Math.PI * 2;
			const dist = Math.random() * radius;
			const height = 1.0 + Math.random() * 2 * ((radius - dist) / 4);
			const x = dist * Math.cos(angle);
			const y = height;
			const z = 0.5 * dist * Math.sin(angle);
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
	const landscape = new WeirdLandscape();
	const terrain = new Terrain(landscape.height.bind(landscape));
	const surface = new Pawn(terrain, {
		color: [0.0, 0.8, 1.0, 0.0],
		model: Matrix4.translation(0.0, -4.0, -320.0).multiply(Matrix4.scaling(7.5, 1.0, 20.0)),
		shader: scene.createShader(terrainVertexSource, terrainFragmentSource),
	});
	scene.addPawn(surface);

	// Test Cube
	const cube = new Pawn(new Cube(), {
		color: [1.0, 1.0, 0.0, 1.0],
		model: Matrix4.translation(0.0, 0.0, 0.0).multiply(Matrix4.scaling(0.1, 0.1, 0.1)),
	});
	scene.addPawn(cube);

	// Add cityscape
	const city = new Pawn(createCityscape(100, 100), {
		model: Matrix4.translation(0, -10.0, -650.0),
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
		model: Matrix4.translation(0.0, -4.75, -300.0).multiply(Matrix4.scaling(5, 1, 400)),
		shader: roadShader,
	});
	scene.addPawn(road);

	// Add car
	const car = new Pawn(new Obj(deloreanObj), {
		color: [1.0, 1.0, 0.0, 1.0],
		model: Matrix4.translation(0.0, -3.4, -14.0).multiply(Matrix4.rotation(0, Math.PI, 0)).multiply(Matrix4.scaling(3.0, 3.0, 3.0)),
		shader: scene.createShader(carVertexSource, carFragmentSource),
	});
	scene.addPawn(car);


	// Add sun
	const sun = new Pawn(new Sun(), {
		color: [1.0, 1.0, 0.0, 1.0],
		model: Matrix4.translation(0.0, 50.0, -1000.0).multiply(Matrix4.scaling(150, 150, 150)),
		shader: scene.createShader(sunVertexSource, sunFragmentSource),
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
	let roadOffset = 0.0;
	let adjust = 0.0;
	while (true) {
		roadOffset = performance.now() / 30.0;
		road.mesh.uniforms.roadOffset = roadOffset;
		terrain.uniforms.roadOffset = roadOffset;
		terrain.offset[1] = (-roadOffset / 20.0) - 1.5;
		terrain.build();
		terrain.upload(scene.gl);
		await scene.redraw();

		
		if (scene.mouseButtons.has(0) || scene.isGrabbed) {
			const mouseSpeed = 0.0005;
			const [mX, mY] = scene.mouseMovement;

			const x = mY * mouseSpeed;
			const y = mX * mouseSpeed;

			scene.camera.rotate(x, y);
		}
		scene.resetMouseMovement();

		if (scene.heldKeys.has('z')) {
			adjust -= 0.1;
			console.log("AA", adjust);
		}
		if (scene.heldKeys.has('x')) {
			adjust += 0.1;
			console.log("AA", adjust);
		}
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

class WeirdLandscape {
	position = [0.0, 0.0, 0.0];
	hillNoise = new SimplexNoise(0);
	seaNoise = new SimplexNoise(0);
	shapeNoise = new SimplexNoise(0);

	oceanLevel = 0.0;
	offset: Vector3 = [0.0, 0.0, 0.0];

	height(x: number, z: number): number {
		// Distance from road
		const roadDist = Math.abs(x + 1) - 1.0;

		// Create lumpy space
		const grid = 10.0;
		let val = 0.0;
		val = Math.abs(this.hillNoise.noise2D((x | 0) / grid, (z | 0) / grid));
		val *= 100.0;

		// Flatten near road
		const falloff = 30;
		if (roadDist < falloff) {
			if (roadDist < 0) {
				val = 0;
			}
			else {
				val = val * (roadDist / falloff);
			}
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
