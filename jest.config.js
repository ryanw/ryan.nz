module.exports = {
	"globals": {
		"PRODUCTION": true,
	},
	"roots": [
		"<rootDir>/src",
	],
	"transform": {
		"^.+\\.tsx?$": "ts-jest"
	},
	"moduleNameMapper": {
		"\\.frag\\.glsl": "<rootDir>/src/__mocks__/frag.glsl.ts",
		"\\.vert\\.glsl": "<rootDir>/src/__mocks__/vert.glsl.ts",
	}
};
