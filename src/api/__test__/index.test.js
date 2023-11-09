/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

/* eslint-env browser, mocha */
/* eslint no-underscore-dangle: "off" */

import datastore from '../../datastore';
import api, * as Api from '../index.js';
import ApiProxy from '../ApiProxy.js';
import UpstreamsApi from '../upstreamsApi';
import { API_PATH } from '../../constants.js';
import calculateServerZones from '../../calculators/serverzones.js';
import calculateLocationZones from '../../calculators/locationzones.js';
import calculateUpstreams from '../../calculators/upstreams.js';
import { zones as calculateStreamZones, upstreams as calculateStreamUpstreams } from '../../calculators/stream.js';
import calculateCaches from '../../calculators/caches.js';
import calculateSharedZones from '../../calculators/sharedzones.js';
import calculateConnections from '../../calculators/connections.js';
import calculateResolvers from '../../calculators/resolvers.js';

describe('Api', () => {
	it('Returns new instance of ApiProxy', () => {
		expect(api.a !== api.a).toBeTruthy();
		expect(api.a.__API_PROXY).toBeTruthy();
	});

	it('Passes API_PATH to ApiProxy', () => {
		expect(api.a.apiPrefix === API_PATH).toBeTruthy();
	});

	it('httpUpstreamsApi', () => {
		expect(Api.httpUpstreamsApi instanceof UpstreamsApi).toBeTruthy();
		expect(Api.httpUpstreamsApi.apiPrefix === 'http').toBeTruthy();
	});

	it('streamUpstreamsApi', () => {
		expect(Api.streamUpstreamsApi instanceof UpstreamsApi).toBeTruthy();
		expect(Api.streamUpstreamsApi.apiPrefix === 'stream').toBeTruthy();
	});

	describe('defineAngieVersion()', () => {
		it('default value', () => {
			expect(Api.isAngiePro() === false).toBeTruthy();
		});
	});

	describe('checkWritePermissions()', () => {
		const _fetchInner = () => Promise.resolve({
			error: { status: 405 }
		});
		let _fetch;

		afterEach(() => {
			jest.restoreAllMocks();
		});

		beforeAll(() => {
			_fetch = window.fetch;

			window.fetch = _fetchInner;
		});

		afterAll(() => {
			window.fetch = _fetch;
		});

		it('Correct path', () => {
			window.fetch = jest.fn(_fetchInner);

			Api.checkWritePermissions();

			expect(window.fetch.mock.calls[0][0]).toBe(`${ API_PATH }/config/http/upstreams/__ANGIE_TEST_UPSTREAM__/servers/__ANGIE_TEST_SERVER__/`);

			window.fetch = _fetchInner;
		});

		it('Correct method', done => {
			const spyApiGet = jest.spyOn(ApiProxy.prototype, 'del').mockClear();

			Api.checkWritePermissions().then(() => {
				expect(spyApiGet).toHaveBeenCalled();
				done();
			});
		});

		[{
			status: 405,
			result: false
		}, {
			status: 404,
			result: true
		}, {
			status: 403,
			result: null
		}, {
			status: 401,
			result: null
		}].map(({ status, result }) => {
			it(`Handles ${ status } status`, done => {
				const originGet = ApiProxy.prototype.del;

				ApiProxy.prototype.del = () => Promise.reject({ status });

				Api.checkWritePermissions().then(_result => {
					expect(_result === result).toBeTruthy();
					expect(Api.isWritable() === result).toBeTruthy();
				}).finally(() => done());

				ApiProxy.prototype.get = originGet;
			});
		});
	});

	describe('checkApiAvailability()', () => {
		const _fetchInner = () => Promise.resolve({
			status: 200,
			json(){
				return Promise.resolve({
					version: '1.2.0',
					build: '1.2.0',
					address: '192.168.3.2',
					generation: 1,
					load_time: '2023-08-29T14:36:13.835Z'
				});
			}
		});
		let _fetch;

		beforeAll(() => {
			_fetch = window.fetch;

			window.fetch = _fetchInner;
		});

		afterAll(() => {
			window.fetch = _fetch;
		});

		it('Correct path', () => {
			window.fetch = jest.fn(_fetchInner);

			Api.checkApiAvailability();
			expect(window.fetch.mock.calls[0][0] === `${ API_PATH }/`).toBeTruthy();

			window.fetch = _fetchInner;
		});

		it('Returns Promise', () => {
			const spyApiGet = jest.spyOn(Api.apiUtils, 'defineAngieVersion').mockClear().mockImplementation(() => {});
			expect(Api.checkApiAvailability() instanceof Promise).toBeTruthy();
			spyApiGet.mockRestore();
		});

		it('Handles 401', done => {
			const _done = error => {
				window.fetch = _fetchInner;
				done(error);
			};

			window.fetch = () => Promise.resolve({
				status: 401,
				json(){
					return Promise.resolve({ error: {} });
				}
			});

			Api.checkApiAvailability()
				.then(
					() => {
						expect(false).toBe(true);
					},
					({ type }) => {
						expect(type === 'basic_auth').toBeTruthy();
					}
				)
				.then(_done, _done);
		});

		it('Handles other errors', done => {
			let status;
			const spyDefineAngieVersion = jest.spyOn(Api.apiUtils, 'defineAngieVersion').mockClear().mockImplementation(() => {});

			const _done = error => {
				window.fetch = _fetchInner;
				spyDefineAngieVersion.mockRestore();

				done(error);
			};

			const checkApi = _status => {
				status = _status;
				Api.checkApiAvailability()
					.then(
						() => {
							expect(false).toBe(true);
						},
						({ type }) => {
							expect(type === 'api_not_found').toBeTruthy();
							_done();
						}
					);
			};

			window.fetch = (...args) => Promise.resolve({
				status: 404,
				json(){
					return Promise.resolve({ error: {} });
				}
			});

			checkApi(200);
		});
	});

	describe('initialLoad()', () => {
		let spySubscribe; let
			spyUnsubscribe;

		const _fetchInner = () => Promise.resolve({
			status: 200,
			json(){
				return Promise.resolve();
			}
		});
		let _fetch;

		beforeAll(() => {
			_fetch = window.fetch;
			window.fetch = _fetchInner;
		});

		beforeEach(() => {
			spySubscribe = jest.spyOn(datastore, 'subscribe').mockClear().mockImplementation((apis, callback) => { callback(); });
			spyUnsubscribe = jest.spyOn(datastore, 'unsubscribe').mockClear().mockImplementation(() => {});
		});

		afterEach(() => {
			spySubscribe.mockRestore();
			spyUnsubscribe.mockRestore();
		});

		afterAll(() => {
			window.fetch = _fetch;
		});

		it('Returns Promise', done => {
			const promise = Api.initialLoad(datastore);

			promise.then(() => {
				expect(promise instanceof Promise).toBeTruthy();

				done();
			});
		});

		it('Calls right path', done => {
			window.fetch = jest.fn(_fetchInner);

			Api.initialLoad(datastore).then(() => {
				expect(window.fetch).toHaveBeenCalledWith(`${ API_PATH }/`);

				window.fetch = _fetch;

				done();
			});
		});

		it('Handles errors', done => {
			let letFetchSuccess = false;
			const _secondLevelEndpoints = { http: {}, stream: {} };
			const _secondLevelEndpointsAsKeys = Object.keys(_secondLevelEndpoints);
			const responses = [
				{ ssl: {}, ..._secondLevelEndpoints },
				{ server_zones: {}, location_zones: {} }
			];
			let fetchCall = 0;

			window.fetch = jest.fn(path =>
				Promise.resolve({
					status: letFetchSuccess ?
						path === `${ API_PATH }/${ responses[0][2] }/` ?
							400
							: 200
						: 400,
					json(){
						return Promise.resolve(responses[fetchCall++]);
					}
				}));

			const spyFillFirstLevel = jest.spyOn(datastore.availableApiEndpoints, 'fillFirstLevel').mockClear();
			const spyFillThirdLevel = jest.spyOn(datastore.availableApiEndpoints, 'fillThirdLevel').mockClear();

			const _done = error => {
				spyFillFirstLevel.mockRestore();
				spyFillThirdLevel.mockRestore();

				window.fetch = _fetchInner;

				done(error);
			};

			Api.initialLoad(datastore).then(() => {
				expect(window.fetch).toHaveBeenCalled();
				expect(datastore.availableApiEndpoints.getFirstLevel().length === 0).toBeTruthy();
				expect(spyFillFirstLevel).not.toHaveBeenCalled();
				expect(spyFillThirdLevel).not.toHaveBeenCalled();
				expect(spySubscribe).toHaveBeenCalled();

				window.fetch.mockClear();
				spyFillFirstLevel.mockClear();
				spyFillThirdLevel.mockClear();
				spySubscribe.mockClear();
				letFetchSuccess = true;

				Api.initialLoad(datastore).then(() => {
					expect(window.fetch).toHaveBeenCalledTimes(3);

					expect(spyFillFirstLevel).toHaveBeenCalled();
					expect(spyFillFirstLevel).toHaveBeenCalledWith(responses[0]);
					expect(window.fetch).toHaveBeenCalledWith(`${ API_PATH }/${ _secondLevelEndpointsAsKeys[0] }/`);
					expect(spyFillThirdLevel).toHaveBeenCalled();
					expect(spyFillThirdLevel).toHaveBeenCalledWith(_secondLevelEndpointsAsKeys[0], responses[1]);

					expect(window.fetch).toHaveBeenCalledWith(`${ API_PATH }/${ _secondLevelEndpointsAsKeys[1] }/`);

					expect(spySubscribe).toHaveBeenCalled();
				}).then(_done, _done);
			}).catch(_done);
		});

		it('catches json() errors', done => {
			window.fetch = path => Promise.resolve({
				status: 200,
				json(){
					return Promise.reject();
				}
			});

			Api.initialLoad(datastore).then(done);
		});

		it('Defines available endpoints', done => {
			const _secondLevelEndpoints = { http: {}, stream: {} };
			const _secondLevelEndpointsAsKeys = Object.keys(_secondLevelEndpoints);
			const responses = [
				{ ssl: {}, ..._secondLevelEndpoints },
				{ server_zones: {}, location_zones: {} },
				{ upstreams: {} }
			];
			let fetchCall = 0;
			datastore.availableApiEndpoints.reset();

			window.fetch = jest.fn(path =>
				Promise.resolve({
					status: 200,
					json(){
						return Promise.resolve(responses[fetchCall++]);
					}
				}));

			const _done = error => {
				window.fetch = _fetchInner;

				done(error);
			};

			Api.initialLoad(datastore).then(() => {
				const firstLevelEndpoints = datastore.availableApiEndpoints.getFirstLevel();
				const secondLevelEndpoints = datastore.availableApiEndpoints.getSecondLevel();

				expect(window.fetch.mock.calls.length === 1 + _secondLevelEndpointsAsKeys.length).toBeTruthy();

				// 1st API call

				expect(window.fetch).toHaveBeenCalledWith(`${ API_PATH }/`);
				expect(firstLevelEndpoints.length === Object.keys(responses[0]).length).toBeTruthy();

				firstLevelEndpoints.forEach(ep => {
					expect(Object.keys(responses[0]).includes(ep)).toBeTruthy();
				});

				// API calls for 2nd level endpoints

				_secondLevelEndpointsAsKeys.forEach((ep, _i) => {
					const i = _i + 1;
					expect(window.fetch).toHaveBeenNthCalledWith(i + 1,
						`${ API_PATH }/${ ep }/`
					);

					const endpoints = datastore.availableApiEndpoints.getThirdLevel(ep);

					expect(endpoints.length === Object.keys(responses[i]).length).toBeTruthy();

					endpoints.forEach(_ep => {
						expect(Object.keys(responses[i]).includes(_ep)).toBeTruthy();
					});
				});
			}).then(_done, _done);
		});

		it('subscribe() and it\'s callback', done => {
			const apisToSubscribe = [{
				path: 'angie'
			}, {
				path: 'connections',
				processor: calculateConnections
			}, {
				path: 'http/server_zones',
				processor: calculateServerZones
			}, {
				path: 'http/location_zones',
				processor: calculateLocationZones
			}, {
				path: 'slabs',
				processor: calculateSharedZones
			}, {
				path: 'http/caches',
				processor: calculateCaches
			}, {
				path: 'http/upstreams',
				processor: calculateUpstreams
			}, {
				path: 'resolvers',
				processor: calculateResolvers
			}, {
				path: 'stream/server_zones',
				processor: calculateStreamZones
			},
			{
				path: 'stream/upstreams',
				processor: calculateStreamUpstreams
			}
			];

			Api.initialLoad(datastore).then(() => {
				expect(spySubscribe).toHaveBeenCalled();
				expect(spySubscribe.mock.calls[0][0].length === apisToSubscribe.length).toBeTruthy();

				spySubscribe.mock.calls[0][0].forEach((proxy, i) => {
					expect(proxy instanceof ApiProxy).toBeTruthy();
					expect(proxy.toString() === apisToSubscribe[i].path).toBeTruthy();

					if (apisToSubscribe[i].processor) {
						expect(proxy.processors[0] === apisToSubscribe[i].processor).toBeTruthy();
					}
				});

				spySubscribe.mock.calls[0][1]();

				expect(spyUnsubscribe).toHaveBeenCalled();
				expect(spyUnsubscribe.mock.calls[0][0].length === apisToSubscribe.length).toBeTruthy();

				spyUnsubscribe.mock.calls[0][0].forEach((proxy, i) => {
					expect(proxy instanceof ApiProxy).toBeTruthy();
					expect(proxy.toString() === apisToSubscribe[i].path).toBeTruthy();

					if (apisToSubscribe[i].processor) {
						expect(proxy.processors[0] === apisToSubscribe[i].processor).toBeTruthy();
					}
				});
			}).then(done);
		});
	});
});
