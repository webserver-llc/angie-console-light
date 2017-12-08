/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
/* eslint quote-props: off */

const path = require('path');
const webpackConfig = require('./webpack.config.js');

module.exports = (config) => {
	/* Overrides for Enzyme+preact */
	webpackConfig.resolve = { alias: {
		'react-dom/server': 'preact-render-to-string',
		'react-dom/test-utils': 'preact-test-utils',
		'react-dom': 'preact-compat-enzyme',
		'react-test-renderer/shallow': 'preact-test-utils',
		'react-test-renderer': 'preact-test-utils',
		'react-addons-test-utils': 'preact-test-utils',
		'react': 'preact-compat-enzyme'
	} };

	config.set({
		browsers: ['ChromeHeadless'/* , 'ChromeCanary', 'Firefox', 'Safari' */],
		singleRun: false,
		frameworks: ['mocha', 'sinon-chai'],

		plugins: ['karma-*'],

		files: [
			'src/**/*.test.+(js|jsx)'
		],

		preprocessors: {
			'src/**/*.test.+(js|jsx)': ['webpack', 'sourcemap']
		},

		reporters: ['dots', 'progress', 'coverage-istanbul'],

		webpack: webpackConfig,

		client: {
			mocha: {
				reporter: 'html', // change Karma's debug.html to the mocha web reporter
				ui: 'bdd'
			}
		},

		logLevel: config.LOG_DEBUG,

		browserConsoleLogOptions: {
			level: 'debug',
			format: '%b %T: %m',
			terminal: true
		},

		webpackServer: {
			noInfo: true // please don't spam the console when running in karma!
		},

		coverageIstanbulReporter: {
			reports: ['html'],

			dir: path.join(__dirname, 'coverage'),

			// if using webpack and pre-loaders, work around webpack breaking the source path
			fixWebpackSourcePaths: true
		}
	});
};