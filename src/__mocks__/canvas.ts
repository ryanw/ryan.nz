import MockWebGLRenderingContext from './webgl';

const MockCanvas = jest.fn().mockImplementation(() => {
	const mock = document.createElement('canvas');
	return Object.assign(mock, {
		getContext: jest.fn((kind, options) => new MockWebGLRenderingContext()),
	});
});

export default MockCanvas;
