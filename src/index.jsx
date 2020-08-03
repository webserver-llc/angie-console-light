/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import 'whatwg-fetch';
import React from 'react';
import App, { history } from './App.jsx';
import * as datastore from './datastore';
import appsettings from './appsettings';
import { checkApiAvailability, initialLoad, checkWritePermissions } from './api';
import { initTooltips } from './tooltips/index.jsx';

/* global __ENV__, GA_ID */

export const onHistoryChange = location => {
	if (window.gtag) {
		window.gtag('config', GA_ID, { page_path: `/${location.hash}` });
	}
};

export const start = () => new Promise(resolve => {
	appsettings.init();
	initTooltips();

	const fragment = document.createDocumentFragment();
	const el = React.render(<App loading />, fragment);

	document.body.appendChild(fragment);

	checkApiAvailability().then(() => {
		checkWritePermissions();
		return initialLoad(datastore);
	}).then(() => {
		React.render(<App />, document.body, el);
		datastore.startObserve();

		resolve();
	}).catch((err) => {
		React.render(<App error={err.type} />, document.body, el);

		resolve();
	});

	if (__ENV__ === 'demo') {
		// Google Analytics only for demo.nginx.com
		// GA_ID defined in webpack.config.js

		history.listen(onHistoryChange);
	}
});
