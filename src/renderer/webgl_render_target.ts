import { WebGLRendererTexture } from './webgl_texture';

export class WebGLRenderTarget {
	gl: WebGLRenderingContext;
	texture: WebGLRendererTexture;
	size: number;
	framebuffer: WebGLFramebuffer;
	renderbuffer: WebGLRenderbuffer;
	attachment =  WebGLRenderingContext.COLOR_ATTACHMENT0;

	constructor(gl: WebGLRenderingContext, size: number, texture: WebGLRendererTexture) {
		this.gl = gl;
		this.size = size;
		this.texture = texture;
		this.framebuffer = gl.createFramebuffer();
		this.renderbuffer = gl.createRenderbuffer();
	}

	bind() {
		const gl = this.gl;

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			this.attachment,
			gl.TEXTURE_2D,
			this.texture.texture,
			0,
		);

		if (this.attachment !== WebGLRenderingContext.DEPTH_ATTACHMENT) {
			gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.size, this.size);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
		}
	}

	unbind() {
		const gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
}
