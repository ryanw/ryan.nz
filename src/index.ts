import { WebGLRenderer } from 'toru';
import { Retrowave } from './retrowave';

async function main() {
	const renderer = new WebGLRenderer(document.body);
	const scene = new Retrowave(renderer);

	while (true) {
		await scene.draw();
	}
}

window.addEventListener('DOMContentLoaded', main);
