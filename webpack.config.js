const path = require('path');

const production = false;

module.exports = {
	mode: production ? 'production' : 'development',
	entry: {
		main: './src/index.ts',
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	devtool: 'source-map',
	devServer: {
		host: '0.0.0.0',
		port: 8088,
		historyApiFallback: true,
	},
	module: {
		rules: [
			// Typescript
			{ test: /\.ts$/, use: 'ts-loader' },

			// Shader files
			{ test: /\.shader$/, use: 'raw-loader' },
		],
	},
	resolve: {
		extensions: [ '.ts', '.js' ],
	},
}
