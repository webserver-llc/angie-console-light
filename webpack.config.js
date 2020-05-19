const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const package = require('./package.json');
const ENV = process.env.NODE_ENV || 'development';
const PRODUCTION_BUILD = ENV === 'demo' || ENV === 'production';

let htmlFileName;

if(ENV === 'development') {
	htmlFileName = 'index.html';
} else if (ENV === 'production') {
	htmlFileName = 'dashboard.html';
} else {
	htmlFileName = `${ENV}.html`
}

const plugins = [
	// Note that the --optimize-minimize flag can be used to insert the UglifyJsPlugin as well.
	//
	new webpack.SourceMapDevToolPlugin({
		test: ['.js', '.jsx'],
		filename: 'index.js.map'
	}),
	new HtmlWebpackPlugin({
		title: 'Nginx+ Dashboard',
		alwaysWriteToDisk: true,
		template: 'src/index.ejs',
		filename: htmlFileName,
		...(PRODUCTION_BUILD ? {
			inlineSource: '.(js|css)$'
		} : {})
	}),
	new HtmlWebpackHarddiskPlugin(),
	new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify(ENV),
		__ENV__: JSON.stringify(ENV),
		__APP_VERSION__: JSON.stringify(package.version),
		GA_ID: JSON.stringify('UA-27974099-10')
	})
];

if (PRODUCTION_BUILD) {
	plugins.push(new HtmlWebpackInlineSourcePlugin());
	plugins.push(new UglifyJSPlugin());
}

if (ENV === 'development') {
	plugins.push(new webpack.HotModuleReplacementPlugin());
}


const cssLoaderConfiguration = (() => {
	const use = [{
		loader: 'css-loader',
		options: {
			modules: true,
			localIdentName: '[local]___[hash:base64:5]',
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

	if (ENV === 'development') {
		use.unshift('style-loader');
	} else {
		plugins.push(new ExtractTextPlugin('index.css'));
	}

	return {
		test: /\.css$/,
		use: ENV === 'development' ? use : ExtractTextPlugin.extract({
			use
		})
	};
})();

const config = {
	entry: './src/index.js',
	output: {
		filename: 'index.js',
		path: path.join(__dirname, '/dist/')
	},
	devServer: {
		contentBase: './dist',
		hot: true
	},
	plugins,

	resolve: {
		alias: {
			// 'react-dom': 'preact-compat-enzyme',
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
	}
};

if (ENV === 'development') {
	config.devtool = 'inline-source-map';
} else {
	config.devtool = 'source-map';
}

module.exports = config;
