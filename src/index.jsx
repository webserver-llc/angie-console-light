/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import 'whatwg-fetch';
import React from 'react';
import App from './App.jsx';
import datastore from './datastore';
import appsettings from './appsettings';
import { apiUtils } from './api';
import tooltips from './tooltips/index.jsx';

/* global __ENV__ */

export const start = () => new Promise(resolve => {
	appsettings.init();
	tooltips.initTooltips();

	const fragment = document.createDocumentFragment();
	const el = React.render(<App loading />, fragment);

	document.body.appendChild(fragment);

	apiUtils.checkApiAvailability().then(() => {
		apiUtils.checkWritePermissions();
		return apiUtils.initialLoad(datastore);
	}).then(() => {
		React.render(<App />, document.body, el);
		datastore.startObserve();

		resolve();
	}).catch((err) => {
		React.render(<App error={err.type} />, document.body, el);

		resolve();
	});
});
