/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
/* eslint quote-props: off */

const path = require('path');
const webpackConfig = require('./webpack.config.js');

module.exports = (config) => {
	/* Overrides for Enzyme+preact */
	webpackConfig.resolve = { alias: {
		...webpackConfig.resolve.alias,
		'react-dom/test-utils': 'preact/test-utils',
		'react-dom': 'preact/compat',
	} };

	config.set({
		frameworks: ['mocha', 'sinon-chai'],
		files: [
			'./karma.init.js'
		],
		preprocessors: {
			'./karma.init.js': ['webpack', 'sourcemap']
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