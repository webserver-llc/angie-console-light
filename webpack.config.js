/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const packageFile = require('./package.json');

const ENV = process.env.NODE_ENV || 'development';
const PRODUCTION_BUILD = ENV === 'production';
const CONSOLE_TYPE = process.env.CONSOLE_TYPE || 'console';
const PROXY_TARGET = process.env.PROXY_TARGET || 'https://console.angie.software';
const YANDEX_METRICA_ID = process.env.YANDEX_METRICA_ID || 'XXXXXX';

const template = CONSOLE_TYPE === 'demo' ? 'src/index.demo.ejs' : 'src/index.ejs';

const plugins = [
	new webpack.IgnorePlugin({
		resourceRegExp: /^((fs)|(path)|(os)|(crypto)|(source-map-support))$/,
		contextRegExp: /vs\/language\/typescript\/lib/
	}),
	new HtmlWebpackPlugin({
		title: 'Angie Console Light',
		filename: '../index.html',
		template,
		inject: false,
	}),

	new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify(ENV),
		__ENV__: JSON.stringify(CONSOLE_TYPE),
		__APP_VERSION__: JSON.stringify(packageFile.version),
		__YANDEX_METRICA_ID__: JSON.stringify(YANDEX_METRICA_ID),
	}),

	new ESLintPlugin(),

	new CopyWebpackPlugin({
		patterns: [
			{ from: './img', to: 'images' }
		]
	}),
];

if (PRODUCTION_BUILD) {
	plugins.push(new HTMLInlineCSSWebpackPlugin());
}

const cssLoaderConfiguration = (() => {
	const use = [
		{
			loader: 'css-loader',
			options: {
				modules: {
					localIdentName: '[local]___[hash:base64:5]',
				},
				importLoaders: 1,
			},
		},
		{
			loader: 'postcss-loader',
			options: {
				postcssOptions: {
					plugins: () => [
						require('autoprefixer')({
							env: 'last 5 versions and not ie < 11',
						}),
						require('cssnano')({
							preset: 'default',
						}),
					]
				}
			}
		}
	];

	if (PRODUCTION_BUILD) {
		plugins.push(
			new MiniCssExtractPlugin({
				filename: 'index.css',
			})
		);
		use.unshift(MiniCssExtractPlugin.loader);
	} else {
		use.unshift('style-loader');
	}

	return {
		test: /\.css$/,
		exclude: /node_modules/,
		use
	};
})();

const babelOptions = {
	presets: [
		'@babel/preset-react',
		['@babel/preset-env', {
			targets: {
				browsers: ['last 5 versions', 'not ie < 11'],
			},
			useBuiltIns: 'usage',
			corejs: 3,
		}],
	],
	plugins: [
		'@babel/plugin-transform-runtime',
		['@babel/plugin-proposal-object-rest-spread', {
			useBuiltIns: true,
			corejs: 3,
		}],
	],
};

const config = {
	mode: PRODUCTION_BUILD ? 'production' : 'development',
	entry: {
		app: './src/index.js',
		'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js'
	},
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.join(__dirname, `/dist/${CONSOLE_TYPE}/assets`),
		publicPath: 'assets/',
	},
	devServer: {
		static: {
			directory: path.join(__dirname, `/dist/${CONSOLE_TYPE}/`)
		},
		hot: true,
		port: 8082,
		proxy: {
			'/api': {
				target: PROXY_TARGET,
				secure: true,
				changeOrigin: true
			}
		},
		devMiddleware: {
			writeToDisk: true
		},
		historyApiFallback: true,
	},
	plugins,

	resolve: {
		alias: {
			react: path.resolve(__dirname, 'src/preact-exports.js'),
			'#': path.resolve(__dirname, 'src'),
		}
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: babelOptions,
				},
			},
			{
				test: /\.(woff|svg)$/,
				type: 'asset/inline',
			},
			cssLoaderConfiguration,
			{
				test: /\.ttf$/,
				type: 'asset/resource'
			},
			{
				test: /\.css$/,
				include: /node_modules/,
				use: ['style-loader', 'css-loader']
			}
		]
	},
	performance: {
		maxEntrypointSize: 1000000,
		maxAssetSize: 1000000
	}
};

if (!PRODUCTION_BUILD) {
	config.devtool = 'inline-source-map';
}

module.exports = config;
