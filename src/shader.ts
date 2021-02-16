import { Matrix4 } from './geom';

// TODO make a shader abstraction
export { WebGLShader as Shader, ShaderOptions } from './renderer/webgl_shader';

export type UniformValues = { [key: string]: number | number[] | Matrix4 };
