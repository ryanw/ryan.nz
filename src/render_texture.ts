import { Texture } from './texture';

export enum Attachment {
	COLOR,
	DEPTH,
}

export class RenderTexture extends Texture {
	size: number;
	attachment: Attachment;

	constructor(size: number, attachment: Attachment = Attachment.COLOR) {
		super();
		this.attachment = attachment;
		this.size = size;
		const pixels = new Uint8ClampedArray(size * size * 4);
		pixels.fill(255);
		this.putPixels(new ImageData(pixels, size));
	}
}
