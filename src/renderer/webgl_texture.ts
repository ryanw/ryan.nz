import { Texture } from '../texture';

export class WebGLRendererTexture {
	texture: WebGLTexture;
	gl: WebGLRenderingContext;

	unit: number;
	level = 0;
	internalFormat = WebGLRenderingContext.RGBA;
	srcFormat = WebGLRenderingContext.RGBA;
	srcType = WebGLRenderingContext.UNSIGNED_BYTE;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
		this.texture = gl.createTexture();
	}

	upload(texture: Texture, unit: number = null) {
		const pixels = texture.pixels;

		if (pixels instanceof HTMLImageElement && !pixels.complete) {
			throw 'Attempted to use incomplete image as texture';
		}
		this.unit = unit;

		const gl = this.gl;
		this.bind();
		gl.texImage2D(gl.TEXTURE_2D, this.level, this.internalFormat, this.srcFormat, this.srcType, pixels);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	bind(): number {
		if (this.unit == null) {
			throw `Cannot bind texture that hasn't been uploaded`;
		}
		const gl = this.gl;
		gl.activeTexture(gl.TEXTURE0 + this.unit);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		return this.unit;
	}
}
