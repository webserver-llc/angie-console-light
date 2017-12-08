/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import 'whatwg-fetch';
import React from 'react';
import App from './app.jsx';
import { startObserve } from './datastore';
import { init as initSettings } from './appsettings';
import { checkApiAvailability, initialLoad, checkApiWritePermissions } from './api';
import { initAmplify } from './amplify';
import { initTooltips } from './tooltips/index.jsx';

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
		checkApiWritePermissions();
		return initialLoad();
	}).then(() => {
		React.render(<App />, document.body, el);
		startObserve();
	}).catch((err) => {
		React.render(<App error={err.type} />, document.body, el);
	});
};

start();

