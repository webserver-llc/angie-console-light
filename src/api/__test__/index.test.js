/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

/* eslint-env browser, mocha */
/* eslint no-underscore-dangle: "off" */

import { spy, stub } from 'sinon';

import datastore from '../../datastore';
import api, * as Api from '../index.js';
import ApiProxy from '../ApiProxy.js';
import UpstreamsApi from '../UpstreamsApi.js';
import { API_PATH } from '../../constants.js';
import calculateServerZones from '../../calculators/serverzones.js';
import calculateLocationZones from '../../calculators/locationzones.js';
import calculateUpstreams from '../../calculators/upstreams.js';
import { zones as calculateStreamZones, upstreams as calculateStreamUpstreams } from '../../calculators/stream.js';
import calculateCaches from '../../calculators/caches.js';
import calculateSharedZones from '../../calculators/sharedzones.js';
import calculateConnections from '../../calculators/connections.js';
import calculateSSL from '../../calculators/ssl.js';
import calculateRequests from '../../calculators/requests.js';
import calculateZoneSync from '../../calculators/zonesync.js';
import calculateResolvers from '../../calculators/resolvers.js';
import calculateWorkers from '../../calculators/workers.js';

describe('Api', () => {
	it('Returns new instance of ApiProxy', () => {
		assert(api.a !== api.a, 'Should always return new ApiProxy instance');
		assert(api.a.__API_PROXY, 'Should have appropriate "__API_PROXY" sign');
	});

	it('Passes API_PATH to ApiProxy', () => {
		assert(api.a.apiPrefix === API_PATH, 'Wrong "apiPrefix" of ApiProxy');
	});

	it('httpUpstreamsApi', () => {
		assert(Api.httpUpstreamsApi instanceof UpstreamsApi, 'Should be the instance of UpstreamsApi');
		assert(Api.httpUpstreamsApi.apiPrefix === 'http', 'Unexpected "apiPrefix" value');
	});

	it('streamUpstreamsApi', () => {
		assert(Api.streamUpstreamsApi instanceof UpstreamsApi, 'Should be the instance of UpstreamsApi');
		assert(Api.streamUpstreamsApi.apiPrefix === 'stream', 'Unexpected "apiPrefix" value');
	});

	describe('checkWritePermissions()', () => {
		const _fetchInner = () => Promise.resolve({
			error: { status: 405 }
		});
		let _fetch;

		before(() => {
			_fetch = window.fetch;

			window.fetch = _fetchInner;
		});

		after(() => {
			window.fetch = _fetch;
		});

		it('Correct path', () => {
			window.fetch = spy(_fetchInner);

			Api.checkWritePermissions();

			assert(
				window.fetch.args[0][0] === `${ API_PATH }/http/upstreams/DASHBOARD_INIT/servers/__TEST_FOR_WRITE__/`,
				'Unexpected path was passed to "window.fetch"'
			);

			window.fetch = _fetchInner;
		});

		it('Correct method', done => {
			const delSpy = spy(ApiProxy.prototype, 'del');

			Api.checkWritePermissions().then(() => {
				assert(delSpy.calledOnce, 'del() of ApiProxy is expected to be called once');
				assert(delSpy.args[0][0].credentials === 'omit', 'Bad fetch params. Expected "credentials:omit" by default');

				Api.checkWritePermissions(true).then(() => {
					assert(delSpy.calledTwice, 'del() of ApiProxy is expected to be called one more time');
					assert(delSpy.args[1][0].credentials === 'same-origin', 'Bad fetch params. Expected "credentials:same-origin"');

					ApiProxy.prototype.del.restore();

					done();
				});
			});
		});

		[{
			status: 405,
			result: false
		}, {
			status: 403,
			result: false
		}, {
			status: 401,
			result: null
		}, {
			status: 201,
			result: true
		}].map(({ status, result }) => {
			it(`Handles ${ status } status`, done => {
				const originDel = ApiProxy.prototype.del;

				ApiProxy.prototype.del = () => Promise.resolve({ error: { status } });

				Api.checkWritePermissions().then(_result => {
					assert(_result === result, `Unexpected result of "window.fetch" resolved with ${ status } status`);
					assert(
						Api.isWritable() === result,
						`Unexpected return from isWritable() for "window.fetch" resolved with ${ status } status`
					);

					if (status !== 201) {
						window.fetch = () => Promise.reject({ status });

						Api.checkWritePermissions().then(_result => {
							assert(_result === result, `Unexpected result of "window.fetch" rejected with ${ status } status`);
							assert(
								Api.isWritable() === result,
								`Unexpected return from isWritable() for "window.fetch" rejected with ${ status } status`
							);

							done();
						});
					} else done();
				});

				ApiProxy.prototype.del = originDel;
			});
		});
	});

	describe('checkApiAvailability()', () => {
		const _fetchInner = () => Promise.resolve({
			status: 200,
			json(){
				return Promise.resolve();
			}
		});
		let _fetch;

		before(() => {
			_fetch = window.fetch;

			window.fetch = _fetchInner;
		});

		after(() => {
			window.fetch = _fetch;
		});

		it('Correct path', () => {
			window.fetch = spy(_fetchInner);

			Api.checkApiAvailability();

			assert(window.fetch.args[0][0] === `${ API_PATH }/angie/`, 'Unexpected path was passed to "window.fetch"');

			window.fetch = _fetchInner;
		});

		it('Correct method', done => {
			const getSpy = spy(ApiProxy.prototype, 'get');

			Api.checkApiAvailability().then(() => {
				assert(getSpy.calledOnce, 'get() method of ApiProxy is expected to be called once');
				assert(getSpy.args[0].length === 0, 'No arguments expected');

				ApiProxy.prototype.get.restore();

				done();
			});
		});

		it('Returns Promise', () => {
			assert(Api.checkApiAvailability() instanceof Promise, 'Should return Promise');
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
						assert.fail('Should throw an exception');
					},
					({ type }) => {
						assert(type === 'basic_auth', 'Unexpected error type');
					}
				)
				.then(_done, _done);
		});

		it('Handles other errors', done => {
			let status;
			const _done = error => {
				window.fetch = _fetchInner;

				done(error);
			};
			const checkApi = _status => {
				status = _status;

				Api.checkApiAvailability()
					.then(
						() => {
							assert.fail('Should throw an exception');
						},
						({ type }) => {
							if (status === 404) {
								assert(type === 'api_not_found', 'Unexpected error type. "api_not_found" was expected');
							} else {
								assert(type === 'old_status_found', 'Unexpected error type. "old_status_found" was expected');

								checkApi(404);
							}
						}
					)
					.then(
						() => {
							if (_status === 404) {
								_done();
							}
						},
						_done
					);
			};

			window.fetch = (...args) => Promise.resolve({
				status: args[0] === '/status' ? status : 404,
				json(){
					return Promise.resolve({ error: {} });
				}
			});

			checkApi(200);
		});
	});

	describe('initialLoad()', () => {
		const _fetchInner = () => Promise.resolve({
			status: 200,
			json(){
				return Promise.resolve();
			}
		});
		let _fetch;

		before(() => {
			_fetch = window.fetch;
			window.fetch = _fetchInner;
		});

		beforeEach(() => {
			stub(datastore, 'subscribe').callsFake((apis, callback) => { callback(); });
			stub(datastore, 'unsubscribe').callsFake(() => {});
		});

		afterEach(() => {
			datastore.subscribe.restore();
			datastore.unsubscribe.restore();
		});

		after(() => {
			window.fetch = _fetch;
		});

		it('Returns Promise', done => {
			const promise = Api.initialLoad(datastore);

			promise.then(() => {
				assert(promise instanceof Promise, 'Should return a promise');

				done();
			});
		});

		it('Calls right path', done => {
			window.fetch = spy(_fetchInner);

			Api.initialLoad(datastore).then(() => {
				assert(
					window.fetch.firstCall.calledWithExactly(`${ API_PATH }/`),
					'Wrong path was provided to "window.fetch"'
				);

				window.fetch = _fetch;

				done();
			});
		});

		it('Handles errors', done => {
			let letFetchSuccess = false;
			const _secondLevelEndpoints = { 'http': {}, 'stream': {}};
			const _secondLevelEndpointsAsKeys = Object.keys(_secondLevelEndpoints);
			const responses = [
				{'ssl': {}, ..._secondLevelEndpoints},
				{'server_zones': {}, 'location_zones': {}}
			];
			let fetchCall = 0;

			window.fetch = spy(path =>
				Promise.resolve({
					status: letFetchSuccess ?
							path === `${ API_PATH }/${ responses[0][2] }/` ?
								400
							: 200
						: 400,
					json(){
						return Promise.resolve(responses[fetchCall++]);
					}
				})
			);

			spy(datastore.availableApiEndpoints, 'fillFirstLevel');
			spy(datastore.availableApiEndpoints, 'fillThirdLevel');

			const _done = error => {
				datastore.availableApiEndpoints.fillFirstLevel.restore();
				datastore.availableApiEndpoints.fillThirdLevel.restore();

				window.fetch = _fetchInner;

				done(error);
			};

			Api.initialLoad(datastore).then(() => {
				assert(window.fetch.calledOnce, '"window.fetch" is expected to be called one time');
				assert(
					datastore.availableApiEndpoints.getFirstLevel().length === 0,
					'No available endpoints should be on first level'
				);
				assert(
					datastore.availableApiEndpoints.fillFirstLevel.notCalled,
					'"fillFirstLevel" should not be called'
				);
				assert(
					datastore.availableApiEndpoints.fillThirdLevel.notCalled,
					'"fillThirdLevel" should not be called'
				);
				assert(
					datastore.subscribe.calledOnce,
					'"subscribe" should be called even if error occurs'
				);

				window.fetch.resetHistory();
				datastore.availableApiEndpoints.fillFirstLevel.resetHistory();
				datastore.availableApiEndpoints.fillThirdLevel.resetHistory();
				datastore.subscribe.resetHistory();
				letFetchSuccess = true;

				Api.initialLoad(datastore).then(() => {
					assert(window.fetch.calledThrice, '"window.fetch" is expected to be called three times');

					assert(
						datastore.availableApiEndpoints.fillFirstLevel.calledOnce,
						'"fillFirstLevel" should be called once'
					);
					assert(
						datastore.availableApiEndpoints.fillFirstLevel.calledWithExactly(responses[0]),
						'Wrong arguments of "fillFirstLevel" call'
					);

					assert(
						window.fetch.secondCall.calledWithExactly(`${ API_PATH }/${ _secondLevelEndpointsAsKeys[0] }/`),
						'Unexpected path of "window.fetch" second call'
					);
					assert(
						datastore.availableApiEndpoints.fillThirdLevel.calledOnce,
						'"fillThirdLevel" should be called one time'
					);
					assert(
						datastore.availableApiEndpoints.fillThirdLevel.calledWithExactly(_secondLevelEndpointsAsKeys[0], responses[1]),
						'Wrong arguments of "fillThirdLevel" call'
					);

					assert(
						window.fetch.thirdCall.calledWithExactly(`${ API_PATH }/${ _secondLevelEndpointsAsKeys[1] }/`),
						'Unexpected path of "window.fetch" second call'
					);

					assert(
						datastore.subscribe.calledOnce,
						'"subscribe" should be called even if error occurs'
					);
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
			const _secondLevelEndpoints = { 'http': {}, 'stream': {} };
			const _secondLevelEndpointsAsKeys = Object.keys(_secondLevelEndpoints);
			const responses = [
				{'ssl': {}, ..._secondLevelEndpoints},
				{'server_zones': {}, 'location_zones': {}},
				{'upstreams': {}}
			];
			let fetchCall = 0;

			window.fetch = spy(path =>
				Promise.resolve({
					status: 200,
					json(){
						return Promise.resolve(responses[fetchCall++]);
					}
				})
			);

			const _done = error => {
				window.fetch = _fetchInner;

				done(error);
			};

			Api.initialLoad(datastore).then(() => {
				const firstLevelEndpoints = datastore.availableApiEndpoints.getFirstLevel();
				const secondLevelEndpoints = datastore.availableApiEndpoints.getSecondLevel();

				assert(
					window.fetch.callCount === 1 + _secondLevelEndpointsAsKeys.length,
					'"window.fetch" should be called 3 times'
				);

				// 1st API call

				assert(
					window.fetch.firstCall.calledWithExactly(`${ API_PATH }/`),
					`Wrong path was provided to "window.fetch". Expected "${ API_PATH }/"`
				);
				assert(
					firstLevelEndpoints.length === Object.keys(responses[0]).length,
					'First level of available API endpoints has unexpected length'
				);

				firstLevelEndpoints.forEach(ep => {
					assert(
						Object.keys(responses[0]).includes(ep),
						`Unexpected "${ ep }" endpoint in first level of available API endpoints`
					);
				});

				// API calls for 2nd level endpoints

				_secondLevelEndpointsAsKeys.forEach((ep, _i) => {
					const i = _i + 1;
					const call = window.fetch.getCall(i);

					call.calledWithExactly(
						`${ API_PATH }/${ ep }/`,
						`Call #${ i } of "window.fetch" was expected to be for "${ API_PATH }/${ ep }/"`
					);

					const endpoints = datastore.availableApiEndpoints.getThirdLevel(ep);

					assert(
						endpoints.length === Object.keys(responses[i]).length,
						`Third level of available API endpoints for "${ ep }" has unexpected length`
					);

					endpoints.forEach(_ep => {
						assert(
							Object.keys(responses[i]).includes(_ep),
							`Unexpected "${ _ep }" endpoint in third level for "${ ep }" endpoint`
						);
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
				}
			];

			Api.initialLoad(datastore).then(() => {
				assert(datastore.subscribe.calledOnce, '"subscribe" should be called once');
				assert(
					datastore.subscribe.args[0][0].length === apisToSubscribe.length,
					'Unexpected number of apis to subscribe'
				);

				datastore.subscribe.args[0][0].forEach((proxy, i) => {
					assert(proxy instanceof ApiProxy, 'All apis to subscribe are expected to be an "ApiProxy" instance');
					assert(proxy.toString() === apisToSubscribe[i].path, `Unexpected path for api #${ i } to subscribe`);

					if (apisToSubscribe[i].processor) {
						assert(
							proxy.processors[0] === apisToSubscribe[i].processor,
							`Unexpected processor for "${ proxy.toString() }" api #${ i } to subscribe`
						);
					}
				});

				datastore.subscribe.args[0][1]();

				assert(datastore.unsubscribe.calledOnce, '"unsubscribe" should be called once');
				assert(
					datastore.unsubscribe.args[0][0].length === apisToSubscribe.length,
					'Unexpected number of apis to unsubscribe'
				);

				datastore.unsubscribe.args[0][0].forEach((proxy, i) => {
					assert(
						proxy instanceof ApiProxy,
						'All apis to unsubscribe are expected to be an "ApiProxy" instance'
					);
					assert(
						proxy.toString() === apisToSubscribe[i].path,
						`Unexpected path for api #${ i } to unsubscribe`
					);

					if (apisToSubscribe[i].processor) {
						assert(
							proxy.processors[0] === apisToSubscribe[i].processor,
							`Unexpected processor for "${ proxy.toString() }" api #${ i } to unsubscribe`
						);
					}
				});
			}).then(done);
		});
	});
});
