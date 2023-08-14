/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

/* eslint-env browser, mocha */

import ApiProxy from '../ApiProxy.js';
import { spy } from 'sinon';

describe('ApiProxy', () => {
	const apiPrefix = '/api/1';
	const path = 'nginx';
	let _fetch, fetchInner, api;

	before(() => {
		_fetch = window.fetch;

		window.fetch = (...args) => fetchInner(...args);
	});

	beforeEach(() => {
		api = new ApiProxy(apiPrefix, path);
		fetchInner = () => Promise.resolve({
			status: 200,
			json(){
				return Promise.resolve();
			}
		});
	});


	after(() => {
		window.fetch = _fetch;
	});

	it('constructor()', () => {
		assert(api.apiPrefix === apiPrefix, 'Supplied "apiPrefix" was not handled correctly');

		assert(api.path instanceof Array, '"path" field is expected to be an Array');
		assert(api.path.length === 1, '"path" field is expected to have only one element when ApiProxy was just created');
		assert(api.path[0] === path, 'Supplied "path" was not handled correctly');

		assert(api.processors instanceof Array, '"processors" field is expected to be an Array');
		assert(api.processors.length === 0, '"processors" field is expected to be empty when ApiProxy was just created');

		assert(typeof api.proxy === 'object', '"proxy" field is expected be a Proxy instance');
		assert(api === api.proxy, '"proxy" should be returned as a result of ApiProxy creation');
	});

	it('Builds path', () => {
		const req = api.http.upstreams['temp-name'].servers['123'];

		assert(
			req.path.join() === 'nginx,http,upstreams,temp-name,servers,123',
			'Bad value is returned'
		);
	});

	it('toString()', () => {
		const req = api.http.upstreams['temp-name'].servers['123'];

		assert(
			req.toString() === 'nginx/http/upstreams/temp-name/servers/123',
			'Bad value is returned'
		);
	});

	it('getUrl()', () => {
		spy(ApiProxy.prototype, 'toString');

		const url = api.getUrl();

		assert(url.startsWith(`${ apiPrefix }/`), 'Should starts with "apiPrefix" value');
		assert(api.toString.calledOnce, '"toString" should be called');
		assert(url.endsWith('/'), 'Should ends with "/"');

		ApiProxy.prototype.toString.restore();
	});

	describe('doRequest()', () => {
		const method = 'POST';
		const params = { 'b': '23' };
		const fetchParams = {
			'test_1': true,
			'test_2': false
		};
		const response = { 'a': '13' };
		let api;

		beforeEach(() => {
			api = new ApiProxy(apiPrefix, path);
			fetchInner = () => Promise.resolve();
		});

		it('Calls "window.fetch" properly', () => {
			fetchInner = spy(() =>
				Promise.resolve({
					status: 200,
					json(){
						return Promise.resolve(response);
					}
				})
			);

			spy(ApiProxy.prototype, 'getUrl');

			const req = api.http.upstreams['temp-name'].servers['123'];
			let reqPromise = req.doRequest(method, params, fetchParams);

			assert(api.getUrl.calledOnce, '"getUrl" should be called');

			const spyArgs = fetchInner.args[0];

			assert(fetchInner.calledOnce, '"window.fetch" should be called once');

			assert(
				spyArgs[0] === api.getUrl(),
				'First argument for "window.fetch" is expected to be a result of "getUrl" method'
			);
			assert(spyArgs[1].method === method, 'Wrong method was provided to "window.fetch"');
			assert(
				spyArgs[1].credentials === 'same-origin',
				'"credentials:same-origin" should be provided to "window.fetch"'
			);

			Object.keys(fetchParams).forEach(key => {
				assert(key in spyArgs[1], `"${ key }" should be passed to "window.fetch"`);
				assert(spyArgs[1][key] === fetchParams[key], `Wrong "${ key }" value is passed to "window.fetch"`);
			});

			assert(spyArgs[1].body === JSON.stringify(params), 'Request params are missed in "window.fetch"');

			assert(reqPromise instanceof Promise, 'Should return Promise');

			reqPromise = req.doRequest(method, null, fetchParams);

			assert.isFalse('body' in fetchInner.args[1][1], 'Unexpected "body" found');

			ApiProxy.prototype.getUrl.restore();
		});

		it('Handles success', done => {
			fetchInner = () => {
				return Promise.resolve({
					status: 200,
					json(){
						return Promise.resolve(response);
					}
				});
			};

			api.http.upstreams['temp-name'].servers['123'].doRequest(method, params, fetchParams)
				.then(data => {
					assert(Object.keys(response).length === Object.keys(data).length, 'Wrong response data');

					Object.keys(response).forEach(key => {
						assert(key in data, `Missed "${ key }" param in response`);
						assert(response[key] === data[key], `Wrong "${ key }" value in response`);
					});
				})
				.then(done, done);
		});

		it('Handles fail', done => {
			const status = 400;
			const response = {
				error: {
					code: 'ErrCode',
					text: 'ErrText'
				}
			};
			let jsonResult = Promise.resolve(response);

			fetchInner = () =>
				Promise.resolve({
					status,
					json(){
						return jsonResult;
					}
				});

			api.http.upstreams['temp-name'].servers['123'].doRequest(method, params, fetchParams)
				.catch(data => {
					assert(data.status === status, 'Bad status');
					assert('error' in data, '"error" property should be in fail response');
					assert(data.error === `${ response.error.code }: ${ response.error.text }`, 'Bad error');

					jsonResult = Promise.resolve({});

					api.http.upstreams['temp-name'].servers['123'].doRequest(method, params, fetchParams)
						.catch(data => {
							assert(data.status === status, 'Bad status');
							assert('error' in data, '"error" property should be in fail response');
							assert(data.error === null, 'Bad error');

							done();
						});
				});
		});

		it('Returns JSON', done => {
			const response = { a: '123', b: 123 };

			fetchInner = () =>
				Promise.resolve({
					status: 200,
					json(){
						return Promise.resolve(response);
					}
				});

			api.nginx.test.get().then(data => {
				assert(Object.keys(response).length === Object.keys(data).length, 'Unexpected number of keys in response data');

				Object.keys(response).forEach(key => {
					assert(key in data, `Prop "${ key }" is missed`);
					assert(response[key] === data[key], `Prop "${ key }" has wrong value`);
				});

				done();
			});
		});
		
		it('Handles mapper', done => {
			const response = { a: '123', b: 123 };

			function mapperResponse(res) {
				const response = { ...res };
				Object.keys(response).forEach(prop => {
					if (typeof response[prop] === "number") {
						response[prop] += 1;
					}
				});
				return response;
			}

			fetchInner = () =>
				Promise.resolve({
					status: 200,
					json(){
						return Promise.resolve(response);
					}
				});

			api.nginx.test.setMapper(mapperResponse).get().then(data => {
				assert(Object.keys(response).length === Object.keys(data).length, 'Unexpected number of keys in response data');
				assert(data.a === response.a, `Prop a has wrong value`);
				assert(data.b === response.b + 1, `Prop b has wrong value`);
				done();
			});
		});
	});

	['get', 'del'].forEach(method => {
		it(`${ method }()`, () => {
			const params = {
				a: '123',
				b: 123
			};
			const httpMethod = method === 'del' ? 'DELETE' : method.toUpperCase();

			spy(ApiProxy.prototype, 'doRequest');

			api.http.upstreams.aaa[method](params);

			assert(api.doRequest.calledOnce, 'Should be called one time');

			const firstCallArgs = api.doRequest.args[0];

			assert(firstCallArgs[0] === httpMethod, 'Wrong method provided');
			assert(firstCallArgs[1] === null, 'Wrong data provided');

			Object.keys(params).forEach(key => {
				assert(key in firstCallArgs[2], `Prop "${ key }" is missed in passed params`);
				assert(params[key] === firstCallArgs[2][key], `Passed params has wrong "${ key }" value`);
			});

			ApiProxy.prototype.doRequest.restore();
		});
	});

	['post', 'patch'].forEach(method => {
		it(`${ method }()`, () => {
			const data = {
				param_1: 'value_1',
				param_2: 'value_2',
				param_3: 'value_3'
			};
			const params = {
				a: '123',
				b: 123
			};

			spy(ApiProxy.prototype, 'doRequest');

			api.http.upstreams.aaa[method](data, params);

			assert(api.doRequest.calledOnce, 'Should be called one time');

			const firstCallArgs = api.doRequest.args[0];

			assert(firstCallArgs[0] === method.toUpperCase(), 'Wrong method provided');

			Object.keys(data).forEach(key => {
				assert(key in firstCallArgs[1], `Prop "${ key }" is missed in passed data`);
				assert(data[key] === firstCallArgs[1][key], `Passed data has wrong "${ key }" value`);
			});

			Object.keys(params).forEach(key => {
				assert(key in firstCallArgs[2], `Prop "${ key }" is missed in passed params`);
				assert(params[key] === firstCallArgs[2][key], `Passed params has wrong "${ key }" value`);
			});

			ApiProxy.prototype.doRequest.restore();
		});
	});

	it('process()', () => {
		const fakeFn = () => {};

		api.process(fakeFn);

		assert(api.processors.length === 1, 'One processor expected to be');
		assert(api.processors[0] === fakeFn, 'Wrong processor were added');
	});
	
	it('setMapper()', () => {
		const fakeFn = () => {};

		api.setMapper(fakeFn);

		assert(api.mapper === fakeFn, 'Mapper expected to be');
	});
});
