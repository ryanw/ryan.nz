import { WebGLRenderer } from './renderer';
import { Terrain, WireTerrain } from './meshes/terrain';
import { Cube, WireCube } from './meshes/cube';
import { Matrix4 } from './geom';

async function main() {
	const scene = new WebGLRenderer();
	scene.attach(document.body);

	// Camera
	scene.camera.position = [0.0, -1.0, 0.0];
	scene.camera.rotation = [0.25,  0.0, 0.0];

	// Add wobbly terrain
	const terrain = scene.addMesh(new Terrain());
	scene.models[terrain] = Matrix4.translation(0.0, 0.0, 0.0)
		.multiply(Matrix4.rotation(0.0, 0.55, 0.0))
		.multiply(Matrix4.scaling(0.33, 0.4, 0.33));

	// Add a cube
	const cube0 = scene.addMesh(new WireCube());
	scene.models[cube0] = Matrix4.translation(0.7, 0.6, -5.0)
		.multiply(Matrix4.scaling(0.25, 0.25, 0.25));

	const cube1 = scene.addMesh(new Cube());
	scene.models[cube1] = Matrix4.translation(-0.6, 0.6, -2.0)
		.multiply(Matrix4.scaling(0.25, 0.25, 0.25));

	const cube2 = scene.addMesh(new WireCube());
	scene.models[cube2] = Matrix4.translation(0.6, 0.3, -2.0)
		.multiply(Matrix4.scaling(0.15, 0.15, 0.15));

	let dt = 0;
	while (true) {
		const mesh = scene.meshes[terrain] as WireTerrain;
		mesh.offset[0] += 10.0 * dt;

		scene.models[cube0] = scene.models[cube0].multiply(Matrix4.rotation(0.2 * dt, 0.2 * dt, 0.0));
		scene.models[cube1] = scene.models[cube1].multiply(Matrix4.rotation(-0.2 * dt, 0.2 * dt, 0.0));
		scene.models[cube2] = scene.models[cube2].multiply(Matrix4.rotation(-0.2 * dt, 0.0, 0.2 * dt));
		dt = await scene.redraw();
	}
}


window.addEventListener('DOMContentLoaded', main);
