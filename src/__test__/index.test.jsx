/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { spy, stub } from 'sinon';
import { shallow, mount } from 'enzyme';
import { start, onHistoryChange } from '../index.jsx';
import App, { history } from '../App.jsx';
import * as datastore from '../datastore';
import appsettings from '../appsettings';
import * as api from '../api';
import * as tooltips from '../tooltips/index.jsx';

describe('Index', () => {
	describe('start()', () => {
		it('Init', done => {
			const _done = () => {
				appsettings.init.restore();
				tooltips.initTooltips.restore();
				React.render.restore();
				api.checkApiAvailability.restore();
				api.checkWritePermissions.restore();
				api.initialLoad.restore();
				datastore.startObserve.restore();
				history.listen.restore();

				done();
			};
			const renderResult = 'Some Component';

			stub(appsettings, 'init').callsFake(() => {});
			stub(tooltips, 'initTooltips').callsFake(() => {});
			stub(React, 'render').callsFake(() => renderResult);
			stub(api, 'checkApiAvailability').callsFake(() => Promise.resolve());
			stub(api, 'checkWritePermissions').callsFake(() => {});
			stub(api, 'initialLoad').callsFake(() => Promise.resolve());
			stub(datastore, 'startObserve').callsFake(() => {});
			stub(history, 'listen').callsFake(() => {});

			start()
				.then(() => {
					assert(appsettings.init.calledOnce, 'appsettings.init() should be called once');
					assert(tooltips.initTooltips.calledOnce, 'initTooltips() should be called once');
					assert(api.checkApiAvailability.calledOnce, 'checkApiAvailability() should be called once');
					assert(api.checkWritePermissions.calledOnce, 'checkWritePermissions() should be called once');
					assert(api.initialLoad.calledOnce, 'initialLoad() should be called once');
					assert(api.initialLoad.args[0][0] === datastore, 'datastore object should be provided to initialLoad()');
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

			if (__ENV__ === 'demo') {
				assert(history.listen.calledOnce, 'history.listen() should be called once for "demo" env');
				assert(history.listen.args[0][0] === onHistoryChange, 'Unexpected callback was provided to history.listen()');
			} else {
				assert(history.listen.callCount === 0, 'history.listen() should NOT be called');
			}
		});

		it('Handles error', done => {
			const _done = () => {
				appsettings.init.restore();
				tooltips.initTooltips.restore();
				React.render.restore();
				api.checkApiAvailability.restore();
				api.checkWritePermissions.restore();
				api.initialLoad.restore();
				datastore.startObserve.restore();
				history.listen.restore();

				done();
			};
			const error = 'test_error';
			const renderResult = 'Some Component';

			stub(appsettings, 'init').callsFake(() => {});
			stub(tooltips, 'initTooltips').callsFake(() => {});
			stub(React, 'render').callsFake(() => renderResult);
			stub(api, 'checkApiAvailability').callsFake(() => Promise.reject({ type: error }));
			stub(api, 'checkWritePermissions').callsFake(() => {});
			stub(api, 'initialLoad').callsFake(() => Promise.resolve());
			stub(datastore, 'startObserve').callsFake(() => {});
			stub(history, 'listen').callsFake(() => {});

			start()
				.then(() => {
					assert(appsettings.init.calledOnce, 'appsettings.init() should be called once');
					assert(tooltips.initTooltips.calledOnce, 'initTooltips() should be called once');
					assert(api.checkApiAvailability.calledOnce, 'checkApiAvailability() should be called once');
					assert(api.checkWritePermissions.callCount === 0, 'checkWritePermissions() should NOT be called');
					assert(api.initialLoad.callCount === 0, 'initialLoad() should NOT be called');
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

	it('onHistoryChange()', () => {
		delete window.gtag;

		onHistoryChange();

		window.gtag = spy();

		const hash = 'test_path';

		onHistoryChange({ hash });

		expect(window.gtag.calledOnce).to.be.true;
		expect(window.gtag.args[0][0]).to.be.equal('config');
		expect(window.gtag.args[0][1]).to.be.equal(GA_ID);
		expect(window.gtag.args[0][2]).to.deep.equal({ page_path: `/${ hash }` });
	});
});