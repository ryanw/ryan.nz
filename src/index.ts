import { WebGLRenderer } from './renderer';
import { Terrain } from './meshes/terrain';
import { Obj } from './meshes/obj';
import { Building } from './meshes/building';
import { Quad } from './meshes/quad';
import { Sun } from './meshes/sun';
import { Road } from './meshes/road';
import { Tree } from './meshes/tree';
import { Pawn } from './pawn';
import { Camera } from './camera';
import { Matrix4 } from './geom';
import SimplexNoise from './simplex-noise';
import { FancyMesh, Vertex, Geometry } from './fancy_mesh';

import deloreanObj from './delorean.obj';
import { RoadShader } from './shaders/road';
import { CarShader } from './shaders/car';
import { SkyShader } from './shaders/sky';
import { SunShader } from './shaders/sun';
import { TreeShader } from './shaders/tree';
import { SimpleShader } from './shaders/simple';
import { TerrainShader } from './shaders/terrain';
import { BuildingShader } from './shaders/building';

const DEBUG_ENABLED = !PRODUCTION || window.location.search.indexOf('debug') !== -1;

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
	const buildingShader = new BuildingShader();

	const maxAttempts = count * 10;
	let attempts = 0;
	for (let i = 1; i <= count; i++) {
		// Building shape
		const width = 5.0 + Math.random() * 6;
		const depth = 3.0 + Math.random() * 20;

		// Building position
		pos: while (attempts < maxAttempts) {
			attempts += 1;

			const angle = Math.random() * Math.PI * 2;
			const dist = Math.random() * radius;
			const height = 5.0 + Math.random() * 2 * ((radius - dist) / 5);
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
				new Pawn(new Building(width / 5, height / 5, depth / 5), {
					color: [1.0, 0.0, 0.0, 1.0],
					model: Matrix4.translation(x, y, z).multiply(Matrix4.scaling(width, height, depth)),
					shader: buildingShader,
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

	// Sky
	const sky = new Pawn(new Quad(), { shader: new SkyShader() });
	scene.addPawn(sky);

	// Add terrain
	const landscape = new WeirdLandscape();
	const terrain = new Terrain(landscape.height.bind(landscape));
	const surface = new Pawn(terrain, {
		color: [0.0, 0.8, 1.0, 0.0],
		model: Matrix4.translation(0.0, -4.0, -320.0).multiply(Matrix4.scaling(7.5, 1.0, 20.0)),
		shader: new TerrainShader(),
	});
	scene.addPawn(surface);

	// Add cityscape
	const city = new Pawn(createCityscape(150, 50), {
		model: Matrix4.translation(0, -5.0, -650.0),
	});
	scene.addPawn(city);

	// Add road
	const road = new Pawn(new Road(), {
		color: [1.0, 0.0, 1.0, 1.0],
		model: Matrix4.translation(0.0, -4.75, -300.0).multiply(Matrix4.scaling(5, 1, 400)),
		shader: new RoadShader(),
	});
	scene.addPawn(road);

	// Add car
	const car = new Pawn(new Obj(deloreanObj), {
		color: [0.0, 0.0, 0.0, 1.0],
		shader: new CarShader(),
	});
	const carOutline = new Pawn(new Obj(deloreanObj, { flipFaces: true, scale: 1.03 }), {
		color: [0.0, 1.0, 1.0, 1.0],
		shader: car.shader,
	});
	scene.addPawn(
		new Pawn([car, carOutline], {
			model: Matrix4.translation(0.0, -3.4, 0.0)
				.multiply(Matrix4.rotation(0, Math.PI, 0))
				.multiply(Matrix4.scaling(3.0, 3.0, 3.0)),
		})
	);

	// Add sun
	const sun = new Pawn(new Sun(), {
		color: [1.0, 1.0, 0.0, 1.0],
		model: Matrix4.translation(0.0, 50.0, -1000.0).multiply(Matrix4.scaling(175, 175, 175)),
		shader: new SunShader(),
	});
	scene.addPawn(sun);

	// Trees
	const treeMesh = new Tree();
	const trees: Pawn[] = [];
	for (let i = 0; i < 15; i++) {
		const tree = new Pawn(treeMesh, {
			model: Matrix4.translation(8.0, -3.0, i * -40.0),
			shader: new TreeShader(),
		});
		scene.addPawn(tree);
		trees.push(tree);
	}
	for (let i = 0; i < 15; i++) {
		const tree = new Pawn(treeMesh, {
			model: Matrix4.translation(-8.0, -3.0, -10 + i * -40.0).multiply(Matrix4.rotation(0.0, Math.PI, 0.0)),
			shader: new TreeShader(),
		});
		scene.addPawn(tree);
		trees.push(tree);
	}

	// Toggle control
	if (DEBUG_ENABLED) {
		document.addEventListener('keydown', (e) => {
			if (e.key === ' ') {
				if (scene.isGrabbed) {
					scene.release();
					document.body.className = '';
				} else {
					scene.grab();
					document.body.className = 'grabbed';
				}
			}
		});
	}

	document.addEventListener('pointerlockchange', () => {
		if (scene.isGrabbed) {
			document.body.className = 'grabbed';
		} else {
			document.body.className = '';
		}
	});

	scene.addEventListeners();
	// Start mouse in the center
	scene.mousePosition[0] = scene.width / 2;
	scene.mousePosition[1] = scene.height / 2;

	let roadOffset = 0.0;
	let carPosition = [0.0, 0.0];
	// 0 = back, PI = forward
	while (true) {

		// Move the car relative to mouse
		// Mouse relative to center
		const mouseX = (scene.mousePosition[0] / scene.width) * 2 - 1;
		const mouseY = (scene.mousePosition[1] / scene.height) * 2 - 1;

		const carTarget = [mouseX * 6.0, mouseY * 10.0 - 18.0];
		if (scene.mouseButtons.has(0)) {
			// Warp speed, Mr Sulu
			carTarget[1] = -40.0;
		}
		else if (scene.mouseButtons.has(1)) {
			// Braking
			carTarget[1] = -5.0;
		}

		const diff = [carTarget[0] - carPosition[0], carTarget[1] - carPosition[1]];
		const distance = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
		const carAngle = Math.atan2(diff[0], diff[1]);
		const carVelocity = distance / 200.0;

		if (distance < 0.1) {
			carPosition = [...carTarget];
		} else if (carPosition[0] != carTarget[0] || carPosition[1] != carTarget[1]) {
			carPosition[0] += Math.sin(carAngle) * carVelocity;
			carPosition[1] += Math.cos(carAngle) * carVelocity;
		}
		car.uniforms.carPosition = carPosition;

		roadOffset = performance.now() / 30.0;
		road.uniforms.roadOffset = roadOffset;
		surface.uniforms.roadOffset = roadOffset;
		for (const tree of trees) {
			tree.uniforms.roadOffset = roadOffset;
		}
		terrain.offset[1] = -roadOffset / 20.0 - 1.5;
		terrain.build();
		terrain.upload(scene.gl);

		if (DEBUG_ENABLED) {
			if (scene.mouseButtons.has(0) && scene.isGrabbed) {
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

		await scene.redraw();
	}
}

class WeirdLandscape {
	hillNoise = new SimplexNoise(0);

	height(x: number, z: number): number {
		// Distance from road
		const roadDist = Math.abs(x + 1) - 1.0;

		// Create lumpy mountains
		const grid = 10.0;
		let val = 0.0;
		val = Math.abs(this.hillNoise.noise2D((x | 0) / grid, (z | 0) / grid));
		val *= 100.0;

		// Flatten near road
		const falloff = 30;
		if (roadDist < falloff) {
			if (roadDist < 0) {
				val = 0;
			} else {
				val = val * (roadDist / falloff);
			}
		}

		return val;
	}
}

window.addEventListener('DOMContentLoaded', main);
