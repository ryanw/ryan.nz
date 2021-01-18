import { WebGLRenderer } from './renderer';
import { Terrain } from './meshes/terrain';
import { Cube } from './meshes/cube';
import { Matrix4 } from './geom';
import { Pawn } from './pawn';

function createCityscape(count: number): Pawn[] {
	const pawns: Pawn[] = [];
	for (let i = 1; i <= count; i++) {
		const width = 0.5 + Math.random() * 2;
		const depth = 0.5 + Math.random() * 2;
		const height = 0.5 + Math.random() * ((count / 2 - Math.abs(count / 2 - i)) * 0.75);
		const z = Math.random() * 10;
		const gap = Math.random() * 0.5;
		pawns.push(
			new Pawn(new Cube(), {
				color: [Math.random(), Math.random(), Math.random(), 1.0],
				model: Matrix4.translation(i * 2 + gap, height, z).multiply(Matrix4.scaling(width, height, depth)),
			})
		);
	}
	return pawns;
}

async function main() {
	const scene = new WebGLRenderer();
	scene.attach(document.body);

	// Camera
	scene.camera.position = [0.0, 0.0, 0.0];
	scene.camera.rotation = [0.0, 0.0, 0.0];

	// Add terrain
	const surface = new Pawn(new Terrain(), {
		color: [0.0, 0.8, 1.0, 0.0],
		model: Matrix4.translation(0.0, -4.0, -96.0).multiply(Matrix4.scaling(2.0, 1.0, 2.0)),
	});
	scene.addPawn(surface);

	// Test Cube
	const cube = new Pawn(new Cube(), {
		color: [1.0, 1.0, 0.0, 1.0],
		model: Matrix4.translation(0.0, 0.0, 0.0),
	});
	scene.addPawn(cube);

	// Add cityscape
	const buildingCount = 40;
	const city = new Pawn(createCityscape(buildingCount), {
		model: Matrix4.translation(-buildingCount, -4.0, -150.0),
	});
	scene.addPawn(city);

	// TODO Add car

	// TODO Add road

	// TODO Add trees

	// TODO Add sun

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

	while (true) {
		await scene.redraw();
	}
}

window.addEventListener('DOMContentLoaded', main);
