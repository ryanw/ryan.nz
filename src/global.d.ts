declare let PRODUCTION: boolean;
declare let SCENE_NAME: string;
declare let SCENE_CLASS: string;

declare module '*.glsl' {
	export default string;
}
declare module '*.obj' {
	export default string;
}

interface Constructable<Z = unknown, A extends unknown[] = unknown[]> {
	new (...args: A): Z;
}
