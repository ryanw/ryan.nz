import { Texture, ScaleFilter } from '../texture';
import { RenderTexture, Attachment } from '../render_texture';

const FILTER_MAP: { [key: string]: number } = {
	[ScaleFilter.LINEAR]: WebGLRenderingContext.LINEAR,
	[ScaleFilter.NEAREST]: WebGLRenderingContext.NEAREST,
};

export class WebGLRendererTexture {
	gl: WebGLRenderingContext;
	texture: WebGLTexture;
	// Safari requries a Color texture, even if we're only rendering to a Depth texture
	unusedColorTexture: WebGLTexture;

	unit: number;
	level = 0;
	internalFormat = WebGLRenderingContext.RGBA;
	srcFormat = WebGLRenderingContext.RGBA;
	srcType = WebGLRenderingContext.UNSIGNED_BYTE;
	minFilter = WebGLRenderingContext.LINEAR;
	magFilter = WebGLRenderingContext.LINEAR;

	static fromTexture(gl: WebGLRenderingContext, src: Texture) {
		const texture = new WebGLRendererTexture(gl);
		texture.minFilter = FILTER_MAP[src.minFilter];
		texture.magFilter = FILTER_MAP[src.magFilter];

		if (src instanceof RenderTexture && src.attachment === Attachment.DEPTH) {
			texture.internalFormat = gl.DEPTH_COMPONENT;
			texture.srcFormat = gl.DEPTH_COMPONENT;
			texture.srcType = gl.UNSIGNED_INT;
			texture.unusedColorTexture = gl.createTexture();
		}
		return texture;
	}

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
		this.texture = gl.createTexture();
	}

	upload(texture: Texture, unit: number = null) {
		const pixels = texture instanceof RenderTexture ? null : texture.pixels;

		if (pixels instanceof HTMLImageElement && !pixels.complete) {
			throw 'Attempted to use incomplete image as texture';
		}
		this.unit = unit;

		const gl = this.gl;

		if (texture instanceof RenderTexture) {
			// Safari requries a Color texture, even if we're only rendering to a Depth texture
			if (this.unusedColorTexture) {
				gl.activeTexture(gl.TEXTURE0 + this.unit);
				gl.bindTexture(gl.TEXTURE_2D, this.unusedColorTexture);
				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					texture.size,
					texture.size,
					0,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					null,
				);

				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
			}

			this.bind();
			gl.texImage2D(
				gl.TEXTURE_2D,
				this.level,
				this.internalFormat,
				texture.size,
				texture.size,
				0,
				this.srcFormat,
				this.srcType,
				null,
			);

		}
		else {
			this.bind();
			gl.texImage2D(
				gl.TEXTURE_2D,
				this.level,
				this.internalFormat,
				this.srcFormat,
				this.srcType,
				pixels,
			);
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
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

	unbind() {
		if (this.unit == null) {
			throw `Cannot unbind texture that hasn't been uploaded`;
		}
		const gl = this.gl;
		gl.activeTexture(gl.TEXTURE0 + this.unit);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
}
