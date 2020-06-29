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
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const package = require('./package.json');
const ENV = process.env.NODE_ENV || 'development';
const PRODUCTION_BUILD = ENV === 'production';
const FILE_NAME = process.env.FILE_NAME || 'dashboard_dev';
const DASHBOARD_TYPE = process.env.DASHBOARD_TYPE || 'dashboard';
const PROXY_TARGET = process.env.PROXY_TARGET || 'http://demo.nginx.com';

const plugins = [
	new webpack.SourceMapDevToolPlugin({
		test: ['.js', '.jsx'],
		filename: 'index.js.map'
	}),

	new HtmlWebpackPlugin({
		title: 'Nginx+ Dashboard',
		filename: `${FILE_NAME}.html`,
		template: 'src/index.ejs',
		...(PRODUCTION_BUILD ? {
			inlineSource: '.(js|css)$'
		} : {})
	}),

	new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify(ENV),
		__ENV__: JSON.stringify(DASHBOARD_TYPE),
		__APP_VERSION__: JSON.stringify(package.version),
		GA_ID: JSON.stringify('UA-27974099-10')
	})
];

if (PRODUCTION_BUILD) {
	plugins.push(new HtmlWebpackInlineSourcePlugin());
} else {
	plugins.push(new webpack.HotModuleReplacementPlugin());
}


const cssLoaderConfiguration = (() => {
	const use = [{
		loader: 'css-loader',
		options: {
			modules: {
				localIdentName: '[local]___[hash:base64:5]'
			},
			importLoaders: 1
		}
	},
	{
		loader: 'postcss-loader',
		options: {
			ident: 'postcss',
			plugins: () => [
				require('autoprefixer')({
					env: 'last 5 versions and not ie < 11'
				}),
				require('postcss-import')(),
				require('postcss-url')({
					url: 'inline',
					basePath: path.resolve('node_modules/npm-font-open-sans')
				}),
				require('postcss-inline-svg')({ path: path.join(__dirname, '/img/') }),
				require('postcss-svgo'),
				require('cssnano')({
					zindex: false,
					preset: 'default'
				})
			]
		}
	}];

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
		use
	};
})();

const config = {
	mode: PRODUCTION_BUILD ? 'production' : 'development',
	entry: './src/index.js',
	output: {
		filename: 'index.js',
		path: path.join(__dirname, '/dist/')
	},
	devServer: {
		contentBase: './dist',
		index: `${FILE_NAME}.html`,
		hot: true,
		writeToDisk: true,
		port: 8082,
		proxy: [{
			context: ['/api', '/status'],
			target: PROXY_TARGET,
			secure: false,
			changeOrigin: true
		}]
	},
	plugins,

	resolve: {
		alias: {
			'react': 'preact'
		}
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			cssLoaderConfiguration
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
