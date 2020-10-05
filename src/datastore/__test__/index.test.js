/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
import appsettings from '../../appsettings';
import {
 	availableApiEndpoints,
 	OBSERVED,
 	live,
 	pause,
 	play,
	unsubscribe,
	startObserve,
	subscribe,
	loop
} from '../index.js';
import * as store from '../store';

describe('Datastore', () => {
	it('play and pause', () => {
		pause();

		expect(live, 'pause').to.be.false;

		play();

		expect(live, 'play').to.be.true;
	});

	it('unsubscribe()', () => {
		function cb_1(){};
		function cb_2(){};

		OBSERVED.set('api_1', {
			instancesCount: 2,
			callbacks: [cb_1, cb_2]
		});
		OBSERVED.set('api_2', {
			instancesCount: 1,
			callbacks: [cb_1]
		});

		unsubscribe([
			{ toString(){ return 'api_1' } },
			{ toString(){ return 'api_2' } },
			{ toString(){ return 'api_3' } }
		], cb_1);

		expect(OBSERVED.get('api_1'), 'api_1').to.be.deep.equal({
			instancesCount: 1,
			callbacks: [cb_2]
		});
		expect(OBSERVED.get('api_2'), 'api_2').to.be.an('undefined');

		OBSERVED.delete('api_1');
	});

	it('startObserve()', done => {
		const apiCallbackSpy = spy();
		const apiGet2ndThenSpy = spy(() => 'api_get_result');
		const apiGetThenSpy = spy(() => ({
			then: apiGet2ndThenSpy
		}));
		const apiGetSpy = spy(() => ({
			then: apiGetThenSpy
		}));
		const testApi = {
			get: apiGetSpy
		};

		OBSERVED.set('api_1', {
			instancesCount: 1,
			callbacks: [apiCallbackSpy],
			api: testApi
		});

		const promiseAllCatchSpy = spy(() => 'promise_all_result');
		const promiseAllThenSpy = spy(() => ({
			catch: promiseAllCatchSpy
		}));

		stub(Promise, 'all').callsFake(() => ({
			then: promiseAllThenSpy
		}));
		stub(appsettings, 'getSetting').callsFake(() => 'getSetting_result');
		stub(Date, 'now').callsFake(() => 'date_now_result');
		stub(store, 'handleDataUpdate').callsFake(() => {});
		stub(window, 'clearTimeout').callsFake(() => {});
		stub(window, 'setTimeout').callsFake(() => 'setTimeout_result');

		expect(startObserve.name, 'startObserve name').to.be.equal('loop');

		pause();
		startObserve();

		expect(window.clearTimeout.calledOnce, '[1st call] clearTimeout called').to.be.true;
		expect(
			Promise.all.notCalled,
			'[not force, not live] Promise.all not called'
		).to.be.true;
		expect(
			window.setTimeout.calledOnce,
			'[not force, not live] setTimeout called'
		).to.be.true;
		expect(
			window.setTimeout.calledWith(startObserve, 'getSetting_result'),
			'[not force, not live] setTimeout call args'
		).to.be.true;
		expect(
			appsettings.getSetting.calledOnce,
			'[not force, not live] getSetting called'
		).to.be.true;
		expect(
			appsettings.getSetting.calledWith('updatingPeriod'),
			'[not force, not live] getSetting call args'
		).to.be.true;

		window.clearTimeout.resetHistory();
		startObserve(true);

		expect(window.clearTimeout.calledOnce, '[2nd call] clearTimeout called').to.be.true;
		expect(
			window.clearTimeout.calledWith('setTimeout_result'),
			'clearTimeout call args'
		).to.be.true;
		expect(Date.now.calledOnce, 'Date.now called').to.be.true;
		expect(Promise.all.calledOnce, 'Promise.all called').to.be.true;
		expect(Promise.all.args[0][0], 'Promise.all call args').to.be.deep.equal(
			['api_get_result']
		);
		expect(apiGetSpy.calledOnce, 'api_1 api.get called').to.be.true;
		expect(apiGetThenSpy.calledOnce, 'api_1 api.get() 1st then called').to.be.true;
		expect(apiGetThenSpy.args[0][0], 'api_1 api.get() 1st then call arg 1').to.be.a('function');
		expect(
			apiGetThenSpy.args[0][0]('test'),
			'api_1 api.get() 1st then call 1st arg result'
		).to.be.equal('test');
		expect(apiGetThenSpy.args[0][1], 'api_1 api.get() 1st then call 2nd arg').to.be.a('function');
		expect(
			apiGetThenSpy.args[0][1]('test'),
			'api_1 api.get() 1st then call 2nd arg result'
		).to.be.equal('test');
		expect(apiGet2ndThenSpy.calledOnce, 'api_1 api.get() 2nd then called').to.be.true;
		expect(apiGet2ndThenSpy.args[0][0], 'api_1 api.get() 2nd then call arg').to.be.a('function');
		expect(
			apiGet2ndThenSpy.args[0][0]({ test: true }),
			'[no data.error] api_1 api.get() 2nd then call arg'
		).to.be.deep.equal({
			data: { test: true },
			api: testApi,
			timeStart: 'date_now_result'
		});
		expect(
			apiGet2ndThenSpy.args[0][0]({ error: true }),
			'[with data.error] api_1 api.get() 2nd then call arg'
		).to.be.deep.equal({
			data: null,
			api: testApi,
			timeStart: 'date_now_result'
		});
		expect(promiseAllThenSpy.calledOnce, 'Promise.all 1st then called').to.be.true;
		expect(promiseAllThenSpy.args[0][0], 'Promise.all 1st then call arg').to.be.a('function');

		const api_1 = { toString(){ return 'api_1' } };
		const api_2 = { toString(){ return 'api_2' } };

		promiseAllThenSpy.args[0][0]([
			{
				api: api_1,
				data: 'data_test_1',
				timeStart: 'date_now_result'
			}, {
				api: api_2,
				data: 'data_test_2',
				timeStart: 'date_now_result'
			}
		]);

		expect(store.handleDataUpdate.calledTwice, 'handleDataUpdate called twice').to.be.true;
		expect(
			store.handleDataUpdate.args[0][0],
			'handleDataUpdate call 1 arg 1'
		).to.be.deep.equal(api_1);
		expect(store.handleDataUpdate.args[0][1], 'handleDataUpdate call 1 arg 2').to.be.equal(
			'data_test_1'
		);
		expect(store.handleDataUpdate.args[0][2], 'handleDataUpdate call 1 arg 3').to.be.equal(
			'date_now_result'
		);
		expect(
			store.handleDataUpdate.args[1][0],
			'handleDataUpdate call 2 arg 1'
		).to.be.deep.equal(api_2);
		expect(store.handleDataUpdate.args[1][1], 'handleDataUpdate call 2 arg 2').to.be.equal(
			'data_test_2'
		);
		expect(store.handleDataUpdate.args[1][2], 'handleDataUpdate call 2 arg 3').to.be.equal(
			'date_now_result'
		);
		expect(apiCallbackSpy.calledOnce, 'api_1 callback called').to.be.true;
		expect(promiseAllCatchSpy.calledOnce, 'Promise.all catch called').to.be.true;
		expect(promiseAllCatchSpy.args[0][0], 'Promise.all catch call arg').to.be.a('function');

		OBSERVED.delete('api_1');

		Promise.all.restore();
		appsettings.getSetting.restore();
		Date.now.restore();
		store.handleDataUpdate.restore();
		window.clearTimeout.restore();
		window.setTimeout.restore();

		try {
			promiseAllCatchSpy.args[0][0]('test_error');
		} catch(e) {
			expect(e, 'throw an error').to.be.equal('test_error');

			done();
		}
	});

	it('subscribe()', () => {
		pause();

		OBSERVED.set('api_1', {});
		OBSERVED.set('api_4', {
			callbacks: [ callback_1 ],
			instancesCount: 1
		});

		stub(availableApiEndpoints, 'firstLevelIncludes').callsFake(
			path => path === 'stream'|| path === 'http'
		);
		stub(availableApiEndpoints, 'secondLevelIncludes').callsFake(
			path => path === 'http'
		);
		stub(availableApiEndpoints, 'thirdLevelIncludes').callsFake(
			(_, path) => path === 'server_test'
		);
		stub(window, 'clearImmediate').callsFake(() => {});
		stub(window, 'setImmediate').callsFake(() => 'setImmediate_result');

		subscribe([]);

		expect(
			availableApiEndpoints.firstLevelIncludes.notCalled,
			'[1] availableApiEndpoints.firstLevelIncludes not called'
		).to.be.true;
		expect(window.clearImmediate.calledOnce, '[1st call] window.clearImmediate called').to.be.true;
		expect(window.setImmediate.calledOnce, '[1st call] window.setImmediate called').to.be.true;
		expect(
			window.setImmediate.args[0][0],
			'[1st call] window.setImmediate call arg'
		).to.be.a('function');
		expect(
			window.setImmediate.args[0][0].name,
			'[1st call] window.setImmediate call arg name'
		).to.be.equal('loop');

		window.clearImmediate.resetHistory();

		let api = {
			toString(){ return 'api_1' },
			path: ['nginx', 'version']
		};

		subscribe([ api ]);

		expect(
			availableApiEndpoints.firstLevelIncludes.calledOnce,
			'[2] availableApiEndpoints.firstLevelIncludes called'
		).to.be.true;
		expect(
			availableApiEndpoints.firstLevelIncludes.calledWith('nginx'),
			'[2] availableApiEndpoints.firstLevelIncludes call arg'
		).to.be.true;
		expect(
			availableApiEndpoints.secondLevelIncludes.notCalled,
			'[2] availableApiEndpoints.secondLevelIncludes not called'
		).to.be.true;
		expect(
			availableApiEndpoints.thirdLevelIncludes.notCalled,
			'[2] availableApiEndpoints.thirdLevelIncludes not called'
		).to.be.true;
		expect(OBSERVED.has('api_1'), 'api_1 removed from OBSERVED').to.be.false;
		expect(window.clearImmediate.calledOnce, '[2nd call] window.clearImmediate called').to.be.true;
		expect(
			window.clearImmediate.calledWith('setImmediate_result'),
			'[2nd call] window.clearImmediate call arg'
		).to.be.true;

		availableApiEndpoints.firstLevelIncludes.resetHistory();
		api = {
			toString(){ return 'api_2' },
			path: ['stream', 'upstream']
		};
		subscribe([ api ], callback_1);

		expect(
			availableApiEndpoints.firstLevelIncludes.calledOnce,
			'[3] availableApiEndpoints.firstLevelIncludes called'
		).to.be.true;
		expect(
			availableApiEndpoints.firstLevelIncludes.calledWith('stream'),
			'[3] availableApiEndpoints.firstLevelIncludes call arg'
		).to.be.true;
		expect(
			availableApiEndpoints.secondLevelIncludes.calledOnce,
			'[3] availableApiEndpoints.secondLevelIncludes called'
		).to.be.true;
		expect(
			availableApiEndpoints.secondLevelIncludes.calledWith('stream'),
			'[3] availableApiEndpoints.secondLevelIncludes call arg'
		).to.be.true;
		expect(
			availableApiEndpoints.thirdLevelIncludes.notCalled,
			'[3] availableApiEndpoints.thirdLevelIncludes not called'
		).to.be.true;
		expect(OBSERVED.get('api_2'), '[3] OBSERVED api_2').to.be.deep.equal({
			api,
			callbacks: [
				callback_1
			],
			instancesCount: 1
		});

		availableApiEndpoints.firstLevelIncludes.resetHistory();
		availableApiEndpoints.secondLevelIncludes.resetHistory();
		api = {
			toString(){ return 'api_3' },
			path: ['http', 'unknown_server']
		};
		subscribe([ api ]);

		expect(
			availableApiEndpoints.firstLevelIncludes.calledOnce,
			'[4] availableApiEndpoints.firstLevelIncludes called'
		).to.be.true;
		expect(
			availableApiEndpoints.firstLevelIncludes.calledWith('http'),
			'[4] availableApiEndpoints.firstLevelIncludes call arg'
		).to.be.true;
		expect(
			availableApiEndpoints.secondLevelIncludes.calledOnce,
			'[4] availableApiEndpoints.secondLevelIncludes called'
		).to.be.true;
		expect(
			availableApiEndpoints.secondLevelIncludes.calledWith('http'),
			'[4] availableApiEndpoints.secondLevelIncludes call arg'
		).to.be.true;
		expect(
			availableApiEndpoints.thirdLevelIncludes.calledOnce,
			'[4] availableApiEndpoints.thirdLevelIncludes called'
		).to.be.true;
		expect(
			availableApiEndpoints.thirdLevelIncludes.calledWith('http', 'unknown_server'),
			'[4] availableApiEndpoints.thirdLevelIncludes call arg'
		).to.be.true;
		expect(OBSERVED.has('api_3'), 'no api_3 in OBSERVED').to.be.false;

		availableApiEndpoints.firstLevelIncludes.resetHistory();
		availableApiEndpoints.secondLevelIncludes.resetHistory();
		availableApiEndpoints.thirdLevelIncludes.resetHistory();
		api = {
			toString(){ return 'api_4' },
			path: ['http', 'server_test']
		};
		subscribe([ api ], callback_2);

		expect(
			availableApiEndpoints.firstLevelIncludes.calledOnce,
			'[5] availableApiEndpoints.firstLevelIncludes called'
		).to.be.true;
		expect(
			availableApiEndpoints.firstLevelIncludes.calledWith('http'),
			'[5] availableApiEndpoints.firstLevelIncludes call arg'
		).to.be.true;
		expect(
			availableApiEndpoints.secondLevelIncludes.calledOnce,
			'[5] availableApiEndpoints.secondLevelIncludes called'
		).to.be.true;
		expect(
			availableApiEndpoints.secondLevelIncludes.calledWith('http'),
			'[5] availableApiEndpoints.secondLevelIncludes call arg'
		).to.be.true;
		expect(
			availableApiEndpoints.thirdLevelIncludes.calledOnce,
			'[5] availableApiEndpoints.thirdLevelIncludes called'
		).to.be.true;
		expect(
			availableApiEndpoints.thirdLevelIncludes.calledWith('http', 'server_test'),
			'[5] availableApiEndpoints.thirdLevelIncludes call arg'
		).to.be.true;
		expect(OBSERVED.get('api_4'), '[5] OBSERVED api_4').to.be.deep.equal({
			callbacks: [
				callback_1, callback_2
			],
			instancesCount: 2
		});

		availableApiEndpoints.firstLevelIncludes.restore();
		availableApiEndpoints.secondLevelIncludes.restore();
		availableApiEndpoints.thirdLevelIncludes.restore();
		window.clearImmediate.restore();
		window.setImmediate.restore();

		OBSERVED.delete('api_2');
		OBSERVED.delete('api_4');

		function callback_1(){};
		function callback_2(){};
	});
});
