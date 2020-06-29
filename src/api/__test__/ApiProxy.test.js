/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

/* eslint-env browser, mocha */

import ApiProxy from '../ApiProxy.js';
import sinon from 'sinon';

describe('ApiProxy', () => {
	// let api;

	// beforeEach(() => {
	// 	api = new ApiProxy('/api/1', 'nginx');
	// });

	// it('builds path', () => {
	// 	const req = api.http.upstreams['temp-name'].servers['123'];

	// 	assert(req.path.join() === 'nginx,http,upstreams,temp-name,servers,123');
	// });

	// describe('methods', () => {
	// 	afterEach(() => {
	// 		window.fetch.restore();
	// 	});

	// 	['get', 'del'].forEach((method) => {
	// 		it(`${method}()`, () => {
	// 			const spy = sinon.spy(window, 'fetch');
	// 			api.http.upstreams.aaa.get();

	// 			assert(spy.args[0][0] === '/api/1/nginx/http/upstreams/aaa');
	// 			assert(spy.args[0][1].method === 'get');
	// 		});
	// 	});

	// 	['patch', 'post'].forEach((method) => {
	// 		it(`${method}()`, () => {
	// 			const spy = sinon.spy(window, 'fetch');
	// 			const data = { test: 2 };

	// 			api.http.upstreams.aaa[method](data);

	// 			assert(spy.args[0][0] === '/api/1/nginx/http/upstreams/aaa');
	// 			assert(spy.args[0][1].method === method);
	// 			assert(spy.args[0][1].data === data);
	// 		});
	// 	});
	// });

	// it('handle json', (done) => {
	// 	const fetch = window.fetch;

	// 	window.fetch = () => (
	// 		Promise.resolve({
	// 			json() {
	// 				return {
	// 					a: '13'
	// 				};
	// 			}
	// 		})
	// 	);

	// 	api.nginx.test.get().then((data) => {
	// 		assert(data.a === '13');
	// 		done();
	// 	});

	// 	window.fetch = fetch;
	// });
});
