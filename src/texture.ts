export class Texture {
	private raw: WebGLTexture;
	private gl: WebGLRenderingContext;

	level = 0;
	internalFormat = WebGLRenderingContext.RGBA;
	srcFormat = WebGLRenderingContext.RGBA;
	srcType = WebGLRenderingContext.UNSIGNED_BYTE;

	constructor(gl: WebGLRenderingContext, imageOrURL?: HTMLImageElement | TexImageSource | string) {
		this.gl = gl;
		this.raw = gl.createTexture();

		const defaultImage = new ImageData(new Uint8ClampedArray([255, 0, 255, 255]), 1, 1);
		this.loadPixels(defaultImage);

		if (imageOrURL) {
			if (typeof imageOrURL === 'string') {
				const image = new Image();
				image.src = imageOrURL;
				this.loadImage(image);
			} else if (imageOrURL instanceof HTMLImageElement) {
				this.loadImage(imageOrURL);
			} else {
				this.loadPixels(imageOrURL);
			}
		}
	}

	loadImage(image: HTMLImageElement) {
		if (image.complete) {
			this.loadPixels(image);
		} else {
			// Image hasn't loaded yet; wait for it
			image.addEventListener('load', () => {
				this.loadImage(image);
			});
		}
	}

	loadPixels(pixels: TexImageSource) {
		if (pixels instanceof HTMLImageElement && !pixels.complete) {
			throw 'Attempted to use incomplete image as texture';
		}

		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, this.raw);
		gl.texImage2D(gl.TEXTURE_2D, this.level, this.internalFormat, this.srcFormat, this.srcType, pixels);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	bind(index: number = 0): number {
		const gl = this.gl;
		const textureName = `TEXTURE${index}` as keyof WebGLRenderingContext;
		if (!(textureName in gl)) {
			throw `Invalid texture index: ${index}`;
		}
		const textureId = gl[textureName] as number;
		gl.activeTexture(textureId);
		gl.bindTexture(gl.TEXTURE_2D, this.raw);
		return index;
	}
}
