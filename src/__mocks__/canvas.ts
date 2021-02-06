import MockWebGLRenderingContext from './webgl';


const MockCanvas = jest.fn().mockImplementation(() => {
	return {
		parentElement: document.createElement('div'),
		clientWidth: 800,
		clientHeight: 600,
		style: {},
		getContext: jest.fn((kind, options) => new MockWebGLRenderingContext()),
		setAttribute: jest.fn(),
	};
});

export default MockCanvas;
