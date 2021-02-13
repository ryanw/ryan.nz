import { Texture } from './texture';

export class RenderTexture extends Texture {
	size: number;

	constructor(size: number) {
		super();
		this.size = size;
		const pixels = new Uint8ClampedArray(size * size * 4);
		pixels.fill(255);
		this.putPixels(new ImageData(pixels, size));
	}
}
