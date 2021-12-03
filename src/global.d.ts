declare let PRODUCTION: boolean;

declare module '*.glsl' {
	export default string;
}
declare module '*.obj' {
	export default string;
}

interface Constructable<Z = unknown, A extends unknown[] = unknown[]> {
	new (...args: A): Z;
}
