import { WebGlRenderer } from './renderer';

async function main() {
	const renderer = new WebGlRenderer();
	renderer.attach(document.body);
	while (true) {
		await renderer.redraw();
	}
}


window.addEventListener('DOMContentLoaded', main);
