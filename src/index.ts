import { WebGLRenderer } from './renderer';

async function main() {
	const renderer = new WebGLRenderer();
	renderer.attach(document.body);
	while (true) {
		await renderer.redraw();
	}
}


window.addEventListener('DOMContentLoaded', main);
