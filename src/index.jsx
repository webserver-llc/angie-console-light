/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import 'whatwg-fetch';
import React from 'react';

import App from './App.jsx';
import appsettings from './appsettings';
import tooltips from './tooltips/index.jsx';

export const start = () => {
	appsettings.init();
	tooltips.initTooltips();

	const fragment = document.createDocumentFragment();

	React.render(<App.Component />, fragment);

	document.body.appendChild(fragment);
};
