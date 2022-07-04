/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { stub } from 'sinon';
import { start } from '../index.jsx';
import App from '../App.jsx';
import appsettings from '../appsettings';
import tooltips from '../tooltips/index.jsx';

describe('Index', () => {
	it('start()', () => {
		const AppComponentStub = 'App Component';

		stub(appsettings, 'init').callsFake(() => {});
		stub(tooltips, 'initTooltips').callsFake(() => {});
		stub(App, 'Component').callsFake(() => <div>{AppComponentStub}</div>);
		stub(document.body, 'appendChild').callsFake(() => {});

		start();

		assert(appsettings.init.calledOnce, 'appsettings.init() should be called once');
		assert(tooltips.initTooltips.calledOnce, 'initTooltips() should be called once');

		const AppWrapper = document.body.appendChild.args[0][0];

		assert(AppWrapper.children.length === 1, 'App wrapper children length');
		assert(AppWrapper.children[0].textContent === AppComponentStub, 'App wrapper content');

		appsettings.init.restore();
		tooltips.initTooltips.restore();
		App.Component.restore();
		document.body.appendChild.restore();
	});
});