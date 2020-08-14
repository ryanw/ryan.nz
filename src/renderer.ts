export class WebGlRenderer {
	canvas: HTMLCanvasElement;

	constructor() {
		this.canvas = document.createElement('canvas');
		Object.assign(this.canvas.style, {
			position: 'fixed',
			zIndex: -1,
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		});
	}

	get parentElement(): HTMLCanvasElement['parentElement'] {
		return this.canvas.parentElement;
	}

	clear() {
		const ctx = this.canvas.getContext('2d');
		ctx.fillStyle = '#020';
	}

	animate() {
	}

	draw() {
	}

	async redraw() {
		await new Promise((resolve) => {
			window.requestAnimationFrame(() => {
				this.clear();
				this.draw();
				resolve();
			});
		});
	}

	updateSize() {
		const width = this.parentElement.clientWidth || 320;
		const height = this.parentElement.clientHeight || 240;

		this.canvas.setAttribute('width', width.toString());
		this.canvas.setAttribute('height', height.toString());
	}

	attach(el: HTMLElement) {
		el.appendChild(this.canvas);
		this.updateSize();
	}
}
