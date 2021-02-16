import SimplexNoise from 'simplex-noise';
import { Scene } from '../scene';
import { Renderer } from '../renderer';
import { Terrain } from '../meshes/terrain';
import { Obj } from '../meshes/obj';
import { Building } from '../meshes/building';
import { Quad } from '../meshes/quad';
import { Road } from '../meshes/road';
import { Tree } from '../meshes/tree';
import { Actor } from '../actor';
import { Camera } from '../camera';
import { Matrix4, Rect } from '../geom';
import { Texture } from '../texture';
import { Color } from '../material';

import deloreanObj from '../delorean.obj';
import { RoadShader } from '../shaders/road';
import { CarShader } from '../shaders/car';
import { SkyShader } from '../shaders/sky';
import { SunShader } from '../shaders/sun';
import { TreeShader } from '../shaders/tree';
import { TerrainShader } from '../shaders/terrain';
import { BuildingShader } from '../shaders/building';
import { SpriteShader } from '../shaders/sprite';

const DEBUG_ENABLED = !PRODUCTION || window.location.search.indexOf('debug') !== -1;

export class Retrowave extends Scene {
	roadSpeed = 4;
	roadOffset = 0.0;
	carPosition = [0.0, 0.0];
	backgroundColor: Color = [0.2, 0.05, 0.4, 1.0];
	private road: Actor;
	private car: Actor;
	private tree: Actor;
	private terrain: Actor;
	private heightMap = new Texture();
	private hillNoise = new SimplexNoise();
	private terrainSize = 64;

	constructor(renderer: Renderer) {
		super(renderer);
		this.build();
	}

	draw() {
		this.update();
		return super.draw();
	}

	private build() {
		this.buildCamera();
		this.buildSky();
		this.buildSun();
		this.buildCity();
		this.buildRoad();
		this.buildTrees();
		this.buildCar();
		this.buildTerrain();
		if (DEBUG_ENABLED) {
			this.buildDebug();
		}
	}

	update() {
		this.updateCamera();
		this.updateRoad();
		this.updateTrees();
		this.updateCar();
		this.updateTerrain();
		if (DEBUG_ENABLED) {
			this.updateDebug();
		}
	}

	private buildCamera() {
		const camera = new Camera();
		this.addActor(camera);
		this.renderer.camera = camera;
		this.renderer.updateSize();

		// Start mouse in the center
		this.renderer.mousePosition[0] = this.renderer.width / 2;
		this.renderer.mousePosition[1] = this.renderer.height / 2;
	}

	private buildSky() {
		const sky = new Actor(new Quad(), { shader: new SkyShader() });
		this.addActor(sky);
	}

	private buildCity() {
		const city = new Actor(createCityscape(150, 50), {
			model: Matrix4.translation(0, -5.0, -650.0),
		});
		this.addActor(city);
	}

	private buildRoad() {
		this.road = new Actor(new Road(), {
			color: [1.0, 0.0, 1.0, 1.0],
			model: Matrix4.translation(0.0, -4.75, -300.0).multiply(Matrix4.scaling(5, 1, 400)),
			shader: new RoadShader(),
		});
		this.addActor(this.road);
	}

	private buildSun() {
		const sun = new Actor(new Quad(), {
			color: [1.0, 1.0, 0.0, 1.0],
			model: Matrix4.translation(0.0, 50.0, -1000.0).multiply(Matrix4.scaling(175, 175, 175)),
			shader: new SunShader(),
		});
		this.addActor(sun);
	}

	private buildTrees() {
		this.tree = new Actor(new Tree(), {
			model: Matrix4.translation(0.0, -3.5, 0.0),
			shader: new TreeShader(),
		});

		for (let i = 0; i < 9; i++) {
			// Right side
			this.tree.instance({
				model: Matrix4.translation(8.0, 0.0, i * -80.0),
			});
			// Left side
			this.tree.instance({
				model: Matrix4.translation(-8.0, 0.0, -40 + i * -80.0).multiply(Matrix4.rotation(0.0, Math.PI, 0.0)),
			});
		}

		this.addActor(this.tree);
	}

	private buildCar() {
		this.car = new Actor(new Obj(deloreanObj), {
			color: [0.0, 0.0, 0.0, 1.0],
			shader: new CarShader(),
		});
		const carOutline = new Actor(new Obj(deloreanObj, { flipFaces: true, scale: 1.03 }), {
			color: [0.0, 1.0, 1.0, 1.0],
			shader: this.car.shader,
		});
		this.addActor(
			new Actor([this.car, carOutline], {
				model: Matrix4.translation(0.0, -3.4, 0.0)
					.multiply(Matrix4.rotation(0, Math.PI, 0))
					.multiply(Matrix4.scaling(3.0, 3.0, 3.0)),
			})
		);
	}

	private buildTerrain() {
		const pixels = new Uint8ClampedArray(this.terrainSize * this.terrainSize * 4);
		pixels.fill(255);
		this.heightMap.putPixels(new ImageData(pixels, this.terrainSize));
		this.addTexture(this.heightMap);

		this.terrain = new Actor(new Terrain(), {
			color: [0.0, 0.8, 1.0, 0.0],
			model: Matrix4.translation(0.0, -4.0, -320.0).multiply(Matrix4.scaling(9.9, 1.0, 20.0)),
			shader: new TerrainShader(),
		});
		this.addActor(this.terrain);
	}

	private buildDebug() {
		const sprite = new Actor(new Quad(), {
			color: [1.0, 1.0, 1.0, 1.0],
			model: Matrix4.translation(3.0, 0.0, -10.0),
			shader: new SpriteShader(),
		});
		this.addActor(sprite);
		sprite.uniforms.uSampler = this.bindTexture(this.heightMap);
	}

	private updateCamera() {
		if (DEBUG_ENABLED) {
			const renderer = this.renderer;
			const camera = renderer.camera;

			if (renderer.mouseButtons.has(0)) {
				const mouseSpeed = 0.0005;
				const [mX, mY] = renderer.mouseMovement;

				const x = mY * mouseSpeed;
				const y = mX * mouseSpeed;

				camera.rotate(x, y);
			}
			renderer.resetMouseMovement();

			const speed = 0.5;
			if (renderer.heldKeys.has('w')) {
				camera.translate(0.0, 0.0, -speed);
			}

			if (renderer.heldKeys.has('s')) {
				camera.translate(0.0, 0.0, speed);
			}

			if (renderer.heldKeys.has('a')) {
				camera.translate(-speed, 0.0, 0.0);
			}

			if (renderer.heldKeys.has('d')) {
				camera.translate(speed, 0.0, 0.0);
			}

			if (renderer.heldKeys.has('q')) {
				camera.translate(0.0, -speed, 0.0);
			}

			if (renderer.heldKeys.has('e')) {
				camera.translate(0.0, speed, 0.0);
			}
		}
	}

	private updateRoad() {
		this.roadOffset = performance.now() * this.roadSpeed * 0.01;
		this.road.uniforms.uRoadOffset = this.roadOffset;
	}

	private updateTrees() {
		this.tree.uniforms.uRoadOffset = this.roadOffset;
	}

	private updateTerrain() {
		this.terrain.uniforms.uRoadOffset = this.roadOffset;

		for (let y = 0; y < this.terrainSize; y++) {
			for (let x = 0; x < this.terrainSize; x++) {
				const i = (x + y * this.terrainSize) * 4;

				const scale = 10.0;
				const mapOffset = Math.floor(this.roadOffset / 20) * 2;
				let h = this.hillNoise.noise2D(x / scale, (mapOffset - y) / scale) * 0.5 + 0.5;
				// Flatten near road
				if (x == 31 || x == 32) h = 0.0;
				h *= Math.min(1.0, (Math.abs(x + 0.5 - this.terrainSize / 2) / this.terrainSize) * 10.0);
				this.heightMap.data[i + 3] = (255 * h) | 0; // A
			}
		}

		this.terrain.uniforms.uHeightMap = this.bindTexture(this.heightMap);
		this.updateTexture(this.heightMap);
	}

	private updateCar() {
		// Move the car relative to mouse
		// Mouse relative to center
		const mouseX = (this.renderer.mousePosition[0] / this.renderer.width) * 2 - 1;
		const mouseY = (this.renderer.mousePosition[1] / this.renderer.height) * 2 - 1;

		const carTarget = [mouseX * 6.0, mouseY * 10.0 - 18.0];
		if (this.renderer.mouseButtons.has(0)) {
			// Warp speed, Mr Sulu
			carTarget[1] = -40.0;
		} else if (this.renderer.mouseButtons.has(1)) {
			// Braking
			carTarget[1] = -5.0;
		}

		const diff = [carTarget[0] - this.carPosition[0], carTarget[1] - this.carPosition[1]];
		const distance = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
		const carAngle = Math.atan2(diff[0], diff[1]);
		const carVelocity = distance / 200.0;

		if (distance < 0.1) {
			this.carPosition = [...carTarget];
		} else if (this.carPosition[0] != carTarget[0] || this.carPosition[1] != carTarget[1]) {
			this.carPosition[0] += Math.sin(carAngle) * carVelocity;
			this.carPosition[1] += Math.cos(carAngle) * carVelocity;
		}
		this.car.uniforms.uCarPosition = this.carPosition;
	}

	private updateDebug() {
	}
}

function createCityscape(radius: number, count: number): Actor[] {
	const actors: Actor[] = [];
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

			actors.push(
				new Actor(new Building(width / 5, height / 5, depth / 5), {
					color: [1.0, 0.0, 0.0, 1.0],
					model: Matrix4.translation(x, y, z).multiply(Matrix4.scaling(width, height, depth)),
					shader: buildingShader,
				})
			);
			break pos;
		}
	}
	return actors;
}

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
