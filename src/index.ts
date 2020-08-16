import { WebGLRenderer } from './renderer';
import { Terrain, WirePerlinTerrain, PerlinTerrain, WeirdTerrain } from './meshes/terrain';
import { Cube, WireCube } from './meshes/cube';
import { Matrix4 } from './geom';

async function main() {
	const scene = new WebGLRenderer();
	scene.attach(document.body);

	// Camera
	scene.camera.position = [0.0, 0.0, 0.0];
	scene.camera.rotation = [0.45, 0.0, 0.0];

	// Add wobbly terrain
	const terrain = scene.addMesh(new WirePerlinTerrain());
	const terrain2 = scene.addMesh(new PerlinTerrain());
	const terrain3 = scene.addMesh(new WirePerlinTerrain());
	(scene.meshes[terrain3] as Terrain).target = WebGLRenderingContext.POINTS;

	let dt = 0;
	while (true) {
		const mesh = scene.meshes[terrain] as Terrain;
		mesh.offset[1] -= 1.0 * dt;
		const g = mesh.offset[1] + 0.5;
		const r = (g | 0) - g;
		scene.models[terrain] = Matrix4.scaling(0.5, 0.5, 0.5)
			.multiply(Matrix4.translation(0.0, -9.0, -30.0))
			.multiply(Matrix4.rotation(0.0, 0.0, 0.0))
			.multiply(Matrix4.translation(0.0, 0.0, r))
		;

		(scene.meshes[terrain2] as Terrain).offset = [...mesh.offset];
		scene.models[terrain2] = Matrix4.translation(0.0, -0.03, 0.0).multiply(scene.models[terrain]);
		(scene.meshes[terrain3] as Terrain).offset = [...mesh.offset];
		scene.models[terrain3] = Matrix4.translation(0.0, 0.02, 0.02).multiply(scene.models[terrain]);

		dt = await scene.redraw();
	}
}


window.addEventListener('DOMContentLoaded', main);
