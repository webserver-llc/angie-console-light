/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy } from 'sinon';
import UpstreamsApi from '../UpstreamsApi.js';
import ApiProxy from '../../ApiProxy.js';
import { API_PATH } from '../../../constants.js';

describe('UpstreamsApi', () => {
	const apiPrefix = 'test';
	const testUpstreamsApi = new UpstreamsApi(apiPrefix);
	let _fetch;

	before(() => {
		_fetch = window.fetch;

		window.fetch = spy(() => Promise.resolve({
			status: 200,
			json() {
				return Promise.resolve();
			}
		}));
	});

	afterEach(() => {
		window.fetch.resetHistory();
	})

	after(() => {
		window.fetch = _fetch;
	});

	it('constructor()', () => {
		assert(testUpstreamsApi.apiPrefix === apiPrefix, 'Unexpected "apiPrefix" value');
	});

	it('getPeer()', () => {
		const upstreamName = 'upstream_1';
		const peer = {
			server: 'peer_1'
		};

		spy(ApiProxy.prototype, 'get');

		const promise = testUpstreamsApi.getPeer(upstreamName, peer);

		assert(promise instanceof Promise, 'Should return Promise');
		assert(ApiProxy.prototype.get.calledOnce, 'Should call "get" of ApiProxy');
		assert(
			window.fetch.args[0][0] === `${API_PATH}/config/${apiPrefix}/upstreams/${upstreamName}/servers/${peer.server}/`,
			'Unexpected path provided to "window.fetch"'
		);

		ApiProxy.prototype.get.restore();
	});

	it('createPeer()', () => {
		const upstreamName = 'upstream_1';
		const peerData = {
			name: 'test_peer'
		};

		spy(ApiProxy.prototype, 'post');

		const promise = testUpstreamsApi.createPeer(upstreamName, peerData);

		assert(promise instanceof Promise, 'Should return Promise');
		assert(ApiProxy.prototype.post.calledOnce, 'Should call "post" of ApiProxy');
		assert(
			window.fetch.args[0][0] === `${API_PATH}/config/${apiPrefix}/upstreams/${upstreamName}/servers/`,
			'Unexpected path provided to "window.fetch"'
		);
		assert('body' in window.fetch.args[0][1], '"body" param was not passed to "window.fetch"');

		const body = JSON.parse(window.fetch.args[0][1].body);

		Object.keys(peerData).forEach(key => {
			assert(key in body, `Can not find param "${key}" in body`);
			assert(body[key] === peerData[key], `Wrong value of "${key}" param`);
		});

		ApiProxy.prototype.post.restore();
	});

	it('deletePeer()', () => {
		const upstreamName = 'upstream_1';
		const peer = {
			server: 'peer_1'
		};

		spy(ApiProxy.prototype, 'del');

		const promise = testUpstreamsApi.deletePeer(upstreamName, peer);

		assert(promise instanceof Promise, 'Should return Promise');
		assert(ApiProxy.prototype.del.calledOnce, 'Should call "del" of ApiProxy');
		assert(
			window.fetch.args[0][0] === `${API_PATH}/config/${apiPrefix}/upstreams/${upstreamName}/servers/${peer.server}/`,
			'Unexpected path provided to "window.fetch"'
		);

		ApiProxy.prototype.del.restore();
	});

	it('updatePeer()', () => {
		const upstreamName = 'upstream_1';
		const peer = {
			server: 'peer_1'
		};
		const peerData = {
			name: 'test_peer_new'
		};

		spy(ApiProxy.prototype, 'patch');

		const promise = testUpstreamsApi.updatePeer(upstreamName, peer, peerData);

		assert(promise instanceof Promise, 'Should return Promise');
		assert(ApiProxy.prototype.patch.calledOnce, 'Should call "patch" of ApiProxy');
		assert(
			window.fetch.args[0][0] === `${API_PATH}/config/${apiPrefix}/upstreams/${upstreamName}/servers/${peer.server}/`,
			'Unexpected path provided to "window.fetch"'
		);
		assert('body' in window.fetch.args[0][1], '"body" param was not passed to "window.fetch"');

		const body = JSON.parse(window.fetch.args[0][1].body);

		Object.keys(peerData).forEach(key => {
			assert(key in body, `Can not find param "${key}" in body`);
			assert(body[key] === peerData[key], `Wrong value of "${key}" param`);
		});

		ApiProxy.prototype.patch.restore();
	});
});
