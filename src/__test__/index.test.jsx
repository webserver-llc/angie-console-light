/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { stub } from 'sinon';
import { shallow, mount } from 'enzyme';
import { start } from '../index.jsx';
import App from '../App.jsx';
import datastore from '../datastore';
import appsettings from '../appsettings';
import { apiUtils } from '../api';
import tooltips from '../tooltips/index.jsx';

describe('Index', () => {
	describe('start()', () => {
		it('Init', done => {
			const _done = err => {
				if (err) {
					console.log(err);
				}

				appsettings.init.restore();
				tooltips.initTooltips.restore();
				React.render.restore();
				apiUtils.checkApiAvailability.restore();
				apiUtils.checkWritePermissions.restore();
				apiUtils.initialLoad.restore();
				datastore.startObserve.restore();

				done();
			};
			const renderResult = 'Some Component';

			stub(appsettings, 'init').callsFake(() => {});
			stub(tooltips, 'initTooltips').callsFake(() => {});
			stub(React, 'render').callsFake(() => renderResult);
			stub(apiUtils, 'checkApiAvailability').callsFake(() => Promise.resolve());
			stub(apiUtils, 'checkWritePermissions').callsFake(() => {});
			stub(apiUtils, 'initialLoad').callsFake(() => Promise.resolve());
			stub(datastore, 'startObserve').callsFake(() => {});

			start()
				.then(() => {
					assert(appsettings.init.calledOnce, 'appsettings.init() should be called once');
					assert(tooltips.initTooltips.calledOnce, 'initTooltips() should be called once');
					assert(apiUtils.checkApiAvailability.calledOnce, 'checkApiAvailability() should be called once');
					assert(apiUtils.checkWritePermissions.calledOnce, 'checkWritePermissions() should be called once');
					assert(apiUtils.initialLoad.calledOnce, 'initialLoad() should be called once');
					assert(apiUtils.initialLoad.args[0][0] === datastore, 'datastore object should be provided to initialLoad()');
					assert(datastore.startObserve.calledOnce, 'startObserve() should be called once');

					assert(React.render.args[0][0].nodeName === App, 'Wrong argument was provided to first React.render(). Expected App');
					assert(React.render.args[0][0].attributes.loading, '"loading: true" should be provided to App in first React.render() call');
					assert(React.render.args[0][1] instanceof DocumentFragment, 'Second argument of first React.render() call should be a DocumentFragment');
					assert(React.render.args[1][0].nodeName === App, 'Wrong argument was provided to second React.render(). Expected App');
					assert(Object.keys(React.render.args[1][0].attributes).length === 0, 'Wrong attributes were provided to App in second React.render() call');
					assert(React.render.args[1][1] === document.body, 'Unexpected second argument of second React.render() call');
					assert(React.render.args[1][2] === renderResult, 'Unexpected third argument of second React.render() call');

					_done();
				})
				.catch(_done);
		});

		it('Handles error', done => {
			const _done = () => {
				appsettings.init.restore();
				tooltips.initTooltips.restore();
				React.render.restore();
				apiUtils.checkApiAvailability.restore();
				apiUtils.checkWritePermissions.restore();
				apiUtils.initialLoad.restore();
				datastore.startObserve.restore();

				done();
			};
			const error = 'test_error';
			const renderResult = 'Some Component';

			stub(appsettings, 'init').callsFake(() => {});
			stub(tooltips, 'initTooltips').callsFake(() => {});
			stub(React, 'render').callsFake(() => renderResult);
			stub(apiUtils, 'checkApiAvailability').callsFake(() => Promise.reject({ type: error }));
			stub(apiUtils, 'checkWritePermissions').callsFake(() => {});
			stub(apiUtils, 'initialLoad').callsFake(() => Promise.resolve());
			stub(datastore, 'startObserve').callsFake(() => {});

			start()
				.then(() => {
					assert(appsettings.init.calledOnce, 'appsettings.init() should be called once');
					assert(tooltips.initTooltips.calledOnce, 'initTooltips() should be called once');
					assert(apiUtils.checkApiAvailability.calledOnce, 'checkApiAvailability() should be called once');
					assert(apiUtils.checkWritePermissions.callCount === 0, 'checkWritePermissions() should NOT be called');
					assert(apiUtils.initialLoad.callCount === 0, 'initialLoad() should NOT be called');
					assert(datastore.startObserve.callCount === 0, 'startObserve() should NOT be called');

					assert(React.render.args[0][0].nodeName === App, 'Wrong argument was provided to first React.render(). Expected App');
					assert(React.render.args[0][0].attributes.loading, '"loading: true" should be provided to App in first React.render() call');
					assert(React.render.args[0][1] instanceof DocumentFragment, 'Second argument of first React.render() call should be a DocumentFragment');
					assert(React.render.args[1][0].nodeName === App, 'Wrong argument was provided to second React.render(). Expected App');
					assert(React.render.args[1][0].attributes.error === error, 'Wrong attributes were provided to App in second React.render() call');
					assert(React.render.args[1][1] === document.body, 'Unexpected second argument of second React.render() call');
					assert(React.render.args[1][2] === renderResult, 'Unexpected third argument of second React.render() call');

					_done();
				})
				.catch(_done);
		});
	});
});