/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

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
import store from '../store';

describe('Datastore', () => {
	it('play and pause', () => {
		pause();

		// pause
		expect(live).toBe(false);

		play();

		// play
		expect(live).toBe(true);
	});

	it('unsubscribe()', () => {
		function cb_1(){}
		function cb_2(){}

		OBSERVED.set('api_1', {
			instancesCount: 2,
			callbacks: [cb_1, cb_2]
		});
		OBSERVED.set('api_2', {
			instancesCount: 1,
			callbacks: [cb_1]
		});

		unsubscribe([
			{ toString(){ return 'api_1'; } },
			{ toString(){ return 'api_2'; } },
			{ toString(){ return 'api_3'; } }
		], cb_1);

		// api_1
		expect(OBSERVED.get('api_1')).toEqual({
			instancesCount: 1,
			callbacks: [cb_2]
		});
		expect(OBSERVED.get('api_2')).toBeUndefined();

		OBSERVED.delete('api_1');
	});

	it('startObserve()', done => {
		const apiCallbackSpy = jest.fn();
		const apiGet2ndThenSpy = jest.fn(() => 'api_get_result');
		const apiGetThenSpy = jest.fn(() => ({
			then: apiGet2ndThenSpy
		}));
		const apiGetSpy = jest.fn(() => ({
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

		const promiseAllCatchSpy = jest.fn(() => 'promise_all_result');
		const promiseAllThenSpy = jest.fn(() => ({
			catch: promiseAllCatchSpy
		}));

		jest.spyOn(Promise, 'all').mockClear().mockImplementation(() => ({
			then: promiseAllThenSpy
		}));
		jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => 'getSetting_result');
		jest.spyOn(Date, 'now').mockClear().mockImplementation(() => 'date_now_result');
		jest.spyOn(store, 'handleDataUpdate').mockClear().mockImplementation(() => {});
		jest.spyOn(window, 'clearTimeout').mockClear().mockImplementation(() => {});
		jest.spyOn(window, 'setTimeout').mockClear().mockImplementation(() => 'setTimeout_result');

		// startObserve name
		expect(startObserve.name).toBe('loop');

		pause();
		startObserve();

		// [1st call] clearTimeout called
		expect(window.clearTimeout).toHaveBeenCalled();
		// [not force, not live] Promise.all not called
		expect(Promise.all).not.toHaveBeenCalled();
		// [not force, not live] setTimeout called
		expect(window.setTimeout).toHaveBeenCalled();
		// [not force, not live] setTimeout call args
		expect(window.setTimeout).toHaveBeenCalledWith(startObserve, 'getSetting_result');
		// [not force, not live] getSetting called
		expect(appsettings.getSetting).toHaveBeenCalled();
		// [not force, not live] getSetting call args
		expect(appsettings.getSetting).toHaveBeenCalledWith('updatingPeriod');

		window.clearTimeout.mockClear();
		startObserve(true);

		// [2nd call] clearTimeout called
		expect(window.clearTimeout).toHaveBeenCalled();
		// clearTimeout call args
		expect(window.clearTimeout).toHaveBeenCalledWith('setTimeout_result');
		// Date.now called
		expect(Date.now).toHaveBeenCalled();
		// Promise.all called
		expect(Promise.all).toHaveBeenCalled();
		// Promise.all call args
		expect(Promise.all.mock.calls[0][0]).toEqual(['api_get_result']);
		// api_1 api.get called
		expect(apiGetSpy).toHaveBeenCalled();
		// api_1 api.get() 1st then called
		expect(apiGetThenSpy).toHaveBeenCalled();
		expect(apiGetThenSpy.mock.calls[0][0]).toBeInstanceOf(Function);
		// api_1 api.get() 1st then call 1st arg result
		expect(apiGetThenSpy.mock.calls[0][0]('test')).toBe('test');
		expect(apiGetThenSpy.mock.calls[0][1]).toBeInstanceOf(Function);
		// api_1 api.get() 1st then call 2nd arg result
		expect(apiGetThenSpy.mock.calls[0][1]('test')).toBe('test');
		// api_1 api.get() 2nd then called
		expect(apiGet2ndThenSpy).toHaveBeenCalled();
		expect(apiGet2ndThenSpy.mock.calls[0][0]).toBeInstanceOf(Function);
		// [no data.error] api_1 api.get() 2nd then call arg
		expect(apiGet2ndThenSpy.mock.calls[0][0]({ test: true })).toEqual({
			data: { test: true },
			api: testApi,
			timeStart: 'date_now_result'
		});
		// [with data.error] api_1 api.get() 2nd then call arg
		expect(apiGet2ndThenSpy.mock.calls[0][0]({ error: true })).toEqual({
			data: null,
			api: testApi,
			timeStart: 'date_now_result'
		});
		// Promise.all 1st then called
		expect(promiseAllThenSpy).toHaveBeenCalled();
		expect(promiseAllThenSpy.mock.calls[0][0]).toBeInstanceOf(Function);

		const api_1 = { toString(){ return 'api_1'; } };
		const api_2 = { toString(){ return 'api_2'; } };

		promiseAllThenSpy.mock.calls[0][0]([
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

		// handleDataUpdate called twice
		expect(store.handleDataUpdate).toHaveBeenCalledTimes(2);
		// handleDataUpdate call 1 arg 1
		expect(store.handleDataUpdate.mock.calls[0][0]).toEqual(api_1);
		// handleDataUpdate call 1 arg 2
		expect(store.handleDataUpdate.mock.calls[0][1]).toBe('data_test_1');
		// handleDataUpdate call 1 arg 3
		expect(store.handleDataUpdate.mock.calls[0][2]).toBe('date_now_result');
		// handleDataUpdate call 2 arg 1
		expect(store.handleDataUpdate.mock.calls[1][0]).toEqual(api_2);
		// handleDataUpdate call 2 arg 2
		expect(store.handleDataUpdate.mock.calls[1][1]).toBe('data_test_2');
		// handleDataUpdate call 2 arg 3
		expect(store.handleDataUpdate.mock.calls[1][2]).toBe('date_now_result');
		// api_1 callback called
		expect(apiCallbackSpy).toHaveBeenCalled();
		// Promise.all catch called
		expect(promiseAllCatchSpy).toHaveBeenCalled();
		expect(promiseAllCatchSpy.mock.calls[0][0]).toBeInstanceOf(Function);

		startObserve();

		// [no force, live] live is still true
		expect(live).toBe(true);

		OBSERVED.delete('api_1');

		Promise.all.mockRestore();
		appsettings.getSetting.mockRestore();
		Date.now.mockRestore();
		store.handleDataUpdate.mockRestore();
		window.clearTimeout.mockRestore();
		window.setTimeout.mockRestore();

		try {
			promiseAllCatchSpy.mock.calls[0][0]('test_error');
		} catch (e) {
			// throw an error
			expect(e).toBe('test_error');

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

		jest.spyOn(availableApiEndpoints, 'firstLevelIncludes').mockClear().mockImplementation(
			path => path === 'stream' || path === 'http'
		);
		jest.spyOn(availableApiEndpoints, 'secondLevelIncludes').mockClear().mockImplementation(
			path => path === 'http'
		);
		jest.spyOn(availableApiEndpoints, 'thirdLevelIncludes').mockClear().mockImplementation(
			(_, path) => path === 'server_test'
		);

		jest.spyOn(window, 'clearImmediate').mockClear().mockImplementation(() => {});
		jest.spyOn(window, 'setImmediate').mockClear().mockImplementation(() => 'setImmediate_result');

		subscribe([]);

		// [1] availableApiEndpoints.firstLevelIncludes not called
		expect(availableApiEndpoints.firstLevelIncludes).not.toHaveBeenCalled();
		// [1st call] window.clearImmediate called
		expect(window.clearImmediate).toHaveBeenCalled();
		// [1st call] window.setImmediate called
		expect(window.setImmediate).toHaveBeenCalled();
		expect(window.setImmediate.mock.calls[0][0]).toBeInstanceOf(Function);
		// [1st call] window.setImmediate call arg name
		expect(window.setImmediate.mock.calls[0][0].name).toBe('loop');

		window.clearImmediate.mockClear();

		let api = {
			toString(){ return 'api_1'; },
			path: ['angie', 'version']
		};

		subscribe([ api ]);

		// [2] availableApiEndpoints.firstLevelIncludes called
		expect(availableApiEndpoints.firstLevelIncludes).toHaveBeenCalled();
		// [2] availableApiEndpoints.firstLevelIncludes call arg
		expect(availableApiEndpoints.firstLevelIncludes).toHaveBeenCalledWith('angie');
		// [2] availableApiEndpoints.secondLevelIncludes not called
		expect(availableApiEndpoints.secondLevelIncludes).not.toHaveBeenCalled();
		// [2] availableApiEndpoints.thirdLevelIncludes not called
		expect(availableApiEndpoints.thirdLevelIncludes).not.toHaveBeenCalled();
		// api_1 removed from OBSERVED
		expect(OBSERVED.has('api_1')).toBe(false);
		// [2nd call] window.clearImmediate called
		expect(window.clearImmediate).toHaveBeenCalled();
		// [2nd call] window.clearImmediate call arg
		expect(window.clearImmediate).toHaveBeenCalledWith('setImmediate_result');

		availableApiEndpoints.firstLevelIncludes.mockClear();
		api = {
			toString(){ return 'api_2'; },
			path: ['stream', 'upstream']
		};
		subscribe([ api ], callback_1);

		// [3] availableApiEndpoints.firstLevelIncludes called
		expect(availableApiEndpoints.firstLevelIncludes).toHaveBeenCalled();
		// [3] availableApiEndpoints.firstLevelIncludes call arg
		expect(availableApiEndpoints.firstLevelIncludes).toHaveBeenCalledWith('stream');
		// [3] availableApiEndpoints.secondLevelIncludes called
		expect(availableApiEndpoints.secondLevelIncludes).toHaveBeenCalled();
		// [3] availableApiEndpoints.secondLevelIncludes call arg
		expect(availableApiEndpoints.secondLevelIncludes).toHaveBeenCalledWith('stream');
		// [3] availableApiEndpoints.thirdLevelIncludes not called
		expect(availableApiEndpoints.thirdLevelIncludes).not.toHaveBeenCalled();
		// [3] OBSERVED api_2
		expect(OBSERVED.get('api_2')).toEqual({
			api,
			callbacks: [
				callback_1
			],
			instancesCount: 1
		});

		availableApiEndpoints.firstLevelIncludes.mockClear();
		availableApiEndpoints.secondLevelIncludes.mockClear();
		api = {
			toString(){ return 'api_3'; },
			path: ['http', 'unknown_server']
		};
		subscribe([ api ]);

		// [4] availableApiEndpoints.firstLevelIncludes called
		expect(availableApiEndpoints.firstLevelIncludes).toHaveBeenCalled();
		// [4] availableApiEndpoints.firstLevelIncludes call arg
		expect(availableApiEndpoints.firstLevelIncludes).toHaveBeenCalledWith('http');
		// [4] availableApiEndpoints.secondLevelIncludes called
		expect(availableApiEndpoints.secondLevelIncludes).toHaveBeenCalled();
		// [4] availableApiEndpoints.secondLevelIncludes call arg
		expect(availableApiEndpoints.secondLevelIncludes).toHaveBeenCalledWith('http');
		// [4] availableApiEndpoints.thirdLevelIncludes called
		expect(availableApiEndpoints.thirdLevelIncludes).toHaveBeenCalled();
		// [4] availableApiEndpoints.thirdLevelIncludes call arg
		expect(
			availableApiEndpoints.thirdLevelIncludes
		).toHaveBeenCalledWith('http', 'unknown_server');
		// no api_3 in OBSERVED
		expect(OBSERVED.has('api_3')).toBe(false);

		availableApiEndpoints.firstLevelIncludes.mockClear();
		availableApiEndpoints.secondLevelIncludes.mockClear();
		availableApiEndpoints.thirdLevelIncludes.mockClear();
		api = {
			toString(){ return 'api_4'; },
			path: ['http', 'server_test']
		};
		subscribe([ api ], callback_2);

		// [5] availableApiEndpoints.firstLevelIncludes called
		expect(availableApiEndpoints.firstLevelIncludes).toHaveBeenCalled();
		// [5] availableApiEndpoints.firstLevelIncludes call arg
		expect(availableApiEndpoints.firstLevelIncludes).toHaveBeenCalledWith('http');
		// [5] availableApiEndpoints.secondLevelIncludes called
		expect(availableApiEndpoints.secondLevelIncludes).toHaveBeenCalled();
		// [5] availableApiEndpoints.secondLevelIncludes call arg
		expect(availableApiEndpoints.secondLevelIncludes).toHaveBeenCalledWith('http');
		// [5] availableApiEndpoints.thirdLevelIncludes called
		expect(availableApiEndpoints.thirdLevelIncludes).toHaveBeenCalled();
		// [5] availableApiEndpoints.thirdLevelIncludes call arg
		expect(availableApiEndpoints.thirdLevelIncludes).toHaveBeenCalledWith('http', 'server_test');
		// [5] OBSERVED api_4
		expect(OBSERVED.get('api_4')).toEqual({
			callbacks: [
				callback_1, callback_2
			],
			instancesCount: 2
		});

		availableApiEndpoints.firstLevelIncludes.mockRestore();
		availableApiEndpoints.secondLevelIncludes.mockRestore();
		availableApiEndpoints.thirdLevelIncludes.mockRestore();
		window.clearImmediate.mockRestore();
		window.setImmediate.mockRestore();

		OBSERVED.delete('api_2');
		OBSERVED.delete('api_4');

		function callback_1(){}
		function callback_2(){}
	});
});
