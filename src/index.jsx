/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import 'whatwg-fetch';
import React from 'react';
import App, { history } from './App.jsx';
import { startObserve } from './datastore';
import { init as initSettings } from './appsettings';
import { checkApiAvailability, initialLoad, checkWritePermissions } from './api';
import { initAmplify } from './amplify';
import { initTooltips } from './tooltips/index.jsx';

/* global __ENV__ */

const start = () => {
	initSettings();

	if (__ENV__ !== 'demo') {
		initAmplify();
	}

	initTooltips();

	const fragment = document.createDocumentFragment();

	const el = React.render(<App loading />, fragment);

	document.body.appendChild(fragment);

	checkApiAvailability().then(() => {
		checkWritePermissions();
		return initialLoad();
	}).then(() => {
		React.render(<App />, document.body, el);
		startObserve();
	}).catch((err) => {
		React.render(<App error={err.type} />, document.body, el);
	});


	// Google Analytics only for demo.nginx.com

	if (__ENV__ === 'demo') {
		const GA_ID = 'UA-27974099-10';

		window.dataLayer = window.dataLayer || [];

		window.gtag = (...args) => { window.dataLayer.push(args); };
		window.gtag('js', new Date());
		window.gtag('config', GA_ID);

		const el = document.createElement('script');
		el.async = true;
		el.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
		document.body.appendChild(el);

		history.listen((location) => {
			window.gtag('config', GA_ID, { page_path: `/${location.hash}` });
		});
	}
};

start();

