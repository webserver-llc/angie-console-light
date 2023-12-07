/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
/* eslint-env browser, mocha */

import ApiProxy from '../ApiProxy.js';

describe('ApiProxy', () => {
	const apiPrefix = '/api';
	const path = 'angie';
	let _fetch; let fetchInner; let
		api;

	beforeAll(() => {
		_fetch = window.fetch;

		window.fetch = (...args) => fetchInner(...args);
	});

	beforeEach(() => {
		api = new ApiProxy(apiPrefix, path);
		fetchInner = () =>
			Promise.resolve({
				status: 200,
				json() {
					return Promise.resolve();
				},
			});
	});

	afterAll(() => {
		window.fetch = _fetch;
	});

	it('constructor()', () => {
		expect(api.apiPrefix === apiPrefix).toBeTruthy();

		expect(api.path instanceof Array).toBeTruthy();
		expect(api.path.length === 1).toBeTruthy();
		expect(api.path[0] === path).toBeTruthy();

		expect(api.processors instanceof Array).toBeTruthy();
		expect(api.processors.length === 0).toBeTruthy();

		expect(typeof api.proxy === 'object').toBeTruthy();
		expect(api === api.proxy).toBeTruthy();
	});

	it('Builds path', () => {
		const req = api.http.upstreams['temp-name'].servers['123'];

		expect(req.path.join() === 'angie,http,upstreams,temp-name,servers,123').toBeTruthy();
	});

	it('toString()', () => {
		const req = api.http.upstreams['temp-name'].servers['123'];

		expect(req.toString() === 'angie/http/upstreams/temp-name/servers/123').toBeTruthy();
	});

	it('getUrl()', () => {
		const spy = jest.spyOn(ApiProxy.prototype, 'toString').mockClear();

		let url = api.getUrl();

		expect(url.startsWith(`${apiPrefix}/`)).toBeTruthy();
		expect(spy).toHaveBeenCalled();
		expect(url.endsWith('/')).toBeTruthy();

		url = api.getUrl({ foo: 'bar' });
		expect(url.endsWith('?foo=bar')).toBeTruthy();

		spy.mockRestore();
	});

	describe('doRequest()', () => {
		const method = 'POST';
		const params = { b: '23' };
		const fetchParams = {
			test_1: true,
			test_2: false,
		};
		const response = { a: '13' };
		let api;

		beforeEach(() => {
			api = new ApiProxy(apiPrefix, path);
			fetchInner = () => Promise.resolve();
		});

		it('Calls "window.fetch" properly', () => {
			fetchInner = jest.fn(() =>
				Promise.resolve({
					status: 200,
					json() {
						return Promise.resolve(response);
					},
				}));

			const spyGetUrl = jest.spyOn(ApiProxy.prototype, 'getUrl').mockClear();

			const req = api.http.upstreams['temp-name'].servers['123'];
			let reqPromise = req.doRequest(method, params, fetchParams);

			expect(spyGetUrl).toHaveBeenCalled();

			const spyArgs = fetchInner.mock.calls[0];

			expect(fetchInner).toHaveBeenCalled();

			expect(spyArgs[0] === api.getUrl()).toBeTruthy();
			expect(spyArgs[1].method === method).toBeTruthy();
			expect(spyArgs[1].credentials === 'same-origin').toBeTruthy();

			Object.keys(fetchParams).forEach((key) => {
				expect(key in spyArgs[1]).toBeTruthy();
				expect(spyArgs[1][key] === fetchParams[key]).toBeTruthy();
			});

			expect(spyArgs[1].body === JSON.stringify(params)).toBeTruthy();

			expect(reqPromise instanceof Promise).toBeTruthy();

			reqPromise = req.doRequest(method, null, fetchParams);

			expect('body' in fetchInner.mock.calls[1][1]).toBe(false);

			spyGetUrl.mockRestore();
		});

		it('Handles success', (done) => {
			fetchInner = () => Promise.resolve({
				status: 200,
				json() {
					return Promise.resolve(response);
				},
			});

			api.http.upstreams['temp-name'].servers['123']
				.doRequest(method, params, fetchParams)
				.then((data) => {
					expect(Object.keys(response).length === Object.keys(data).length).toBeTruthy();

					Object.keys(response).forEach((key) => {
						expect(key in data).toBeTruthy();
						expect(response[key] === data[key]).toBeTruthy();
					});
				})
				.then(done, done);
		});

		it('Handles fail', (done) => {
			const status = 400;
			const response = {
				error: 'ErrCode',
				description: 'ErrText',
			};
			let jsonResult = Promise.resolve(response);

			fetchInner = () =>
				Promise.resolve({
					status,
					json() {
						return jsonResult;
					},
				});

			api.http.upstreams['temp-name'].servers['123']
				.doRequest(method, params, fetchParams)
				.catch((data) => {
					expect(data.status === status).toBeTruthy();
					expect('error' in data).toBeTruthy();
					expect(data.error === `${response.error}: ${response.description}`).toBeTruthy();

					jsonResult = Promise.resolve({});

					api.http.upstreams['temp-name'].servers['123']
						.doRequest(method, params, fetchParams)
						.catch((data) => {
							expect(data.status === status).toBeTruthy();
							expect('error' in data).toBeTruthy();
							expect(data.error === null).toBeTruthy();

							done();
						});
				});
		});

		it('Returns JSON', (done) => {
			const response = { a: '123', b: 123 };

			fetchInner = () =>
				Promise.resolve({
					status: 200,
					json() {
						return Promise.resolve(response);
					},
				});

			api.angie.test.get().then((data) => {
				expect(Object.keys(response).length === Object.keys(data).length).toBeTruthy();

				Object.keys(response).forEach((key) => {
					expect(key in data).toBeTruthy();
					expect(response[key] === data[key]).toBeTruthy();
				});

				done();
			});
		});

		it('Handles mapper', (done) => {
			const response = { a: '123', b: 123 };

			function mapperResponse(res) {
				const response = { ...res };
				Object.keys(response).forEach((prop) => {
					if (typeof response[prop] === 'number') {
						response[prop] += 1;
					}
				});
				return response;
			}

			fetchInner = () =>
				Promise.resolve({
					status: 200,
					json() {
						return Promise.resolve(response);
					},
				});

			api.angie.test
				.setMapper(mapperResponse)
				.get()
				.then((data) => {
					expect(Object.keys(response).length === Object.keys(data).length).toBeTruthy();
					expect(data.a === response.a).toBeTruthy();
					expect(data.b === response.b + 1).toBeTruthy();
					done();
				});
		});
	});

	['get', 'del'].forEach((method) => {
		it(`${method}()`, () => {
			const params = {
				a: '123',
				b: 123,
				searchParams: {
					c: 'foo',
				},
			};
			const httpMethod = method === 'del' ? 'DELETE' : method.toUpperCase();

			const spyGetUrl = jest.spyOn(ApiProxy.prototype, 'getUrl').mockClear();
			const spyDoRequest = jest.spyOn(ApiProxy.prototype, 'doRequest').mockClear();

			api.http.upstreams.aaa[method](params);

			expect(spyGetUrl).toHaveBeenCalled();
			expect(spyDoRequest).toHaveBeenCalled();

			// Should be called with arg
			expect(spyGetUrl.mock.calls[0][0]).toBe(params.searchParams);

			const firstCallArgs = spyDoRequest.mock.calls[0];

			expect(firstCallArgs[0] === httpMethod).toBeTruthy();
			expect(firstCallArgs[1] === null).toBeTruthy();

			Object.keys(params).forEach((key) => {
				expect(key in firstCallArgs[2]).toBeTruthy();
				expect(params[key] === firstCallArgs[2][key]).toBeTruthy();
			});

			spyGetUrl.mockRestore();
			spyDoRequest.mockRestore();
		});
	});

	['put', 'post', 'patch'].forEach((method) => {
		it(`${method}()`, () => {
			const data = {
				param_1: 'value_1',
				param_2: 'value_2',
				param_3: 'value_3',
			};
			const params = {
				a: '123',
				b: 123,
				searchParams: {
					c: 'foo',
				},
			};

			const spyGetUrl = jest.spyOn(ApiProxy.prototype, 'getUrl').mockClear();
			const spyDoRequest = jest.spyOn(ApiProxy.prototype, 'doRequest').mockClear();

			api.http.upstreams.aaa[method](data, params);

			expect(spyGetUrl).toHaveBeenCalled();
			expect(spyDoRequest).toHaveBeenCalled();

			// Should be called with arg
			expect(spyGetUrl.mock.calls[0][0]).toBe(params.searchParams);

			const firstCallArgs = spyDoRequest.mock.calls[0];

			expect(firstCallArgs[0] === method.toUpperCase()).toBeTruthy();

			Object.keys(data).forEach((key) => {
				expect(key in firstCallArgs[1]).toBeTruthy();
				expect(data[key] === firstCallArgs[1][key]).toBeTruthy();
			});

			Object.keys(params).forEach((key) => {
				expect(key in firstCallArgs[2]).toBeTruthy();
				expect(params[key] === firstCallArgs[2][key]).toBeTruthy();
			});

			spyGetUrl.mockRestore();
			spyDoRequest.mockRestore();
		});
	});

	it('process()', () => {
		const fakeFn = () => { };

		api.process(fakeFn);

		expect(api.processors.length === 1).toBeTruthy();
		expect(api.processors[0] === fakeFn).toBeTruthy();
	});

	it('setMapper()', () => {
		const fakeFn = () => { };

		api.setMapper(fakeFn);

		expect(api.mapper === fakeFn).toBeTruthy();
	});
});
