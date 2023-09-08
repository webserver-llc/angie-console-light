/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { start } from '../index.jsx';
import App from '../App.jsx';
import appsettings from '../appsettings';
import tooltips from '../tooltips/index.jsx';

describe('Index', () => {
	it('start()', () => {
		const AppComponentStub = 'App Component';

		const spyAppSettingsInit = jest.spyOn(appsettings, 'init').mockClear().mockImplementation(() => {});
		const spyInitTooltips = jest.spyOn(tooltips, 'initTooltips').mockClear().mockImplementation(() => {});
		const spyAppComponent = jest.spyOn(App, 'Component').mockClear().mockImplementation(() => <div>{AppComponentStub}</div>);
		const spyDomAppendChild = jest.spyOn(document.body, 'appendChild').mockClear().mockImplementation(() => {});

		start();

		expect(spyAppSettingsInit).toHaveBeenCalled();
		expect(spyInitTooltips).toHaveBeenCalled();

		const AppWrapper = document.body.appendChild.mock.calls[0][0];

		expect(AppWrapper.children.length === 1).toBeTruthy();
		expect(AppWrapper.children[0].textContent === AppComponentStub).toBeTruthy();

		spyAppSettingsInit.mockRestore();
		spyInitTooltips.mockRestore();
		spyAppComponent.mockRestore();
		spyDomAppendChild.mockRestore();
	});
});
