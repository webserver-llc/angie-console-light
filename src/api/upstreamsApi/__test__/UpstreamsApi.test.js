/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import api from '../../index.js';
import UpstreamsApi from '../UpstreamsApi.js';
import ApiProxy from '../../ApiProxy.js';
import { API_PATH } from '../../../constants.js';

describe('UpstreamsApi', () => {
	const apiPrefix = 'test';
	const testUpstreamsApi = new UpstreamsApi(apiPrefix);
	let _fetch;

	beforeAll(() => {
		_fetch = window.fetch;

		window.fetch = jest.fn(() =>
			Promise.resolve({
				status: 200,
				json() {
					return Promise.resolve();
				},
			}));
	});

	afterEach(() => {
		window.fetch.mockClear();
	});

	afterAll(() => {
		window.fetch = _fetch;
	});

	it('constructor()', () => {
		expect(testUpstreamsApi.apiPrefix === apiPrefix).toBeTruthy();
	});

	it('getPeer()', async () => {
		const upstreamName = 'upstream_1';
		const peer = {
			name: 'peer_1',
		};

		const spyApiProxyGet = jest.spyOn(ApiProxy.prototype, 'get').mockClear();

		await testUpstreamsApi.getPeer(upstreamName, peer);

		expect(spyApiProxyGet).toHaveBeenCalledTimes(2);
		expect(window.fetch.mock.calls[0][0] ===
        `${API_PATH}/config/${apiPrefix}/upstreams/${upstreamName}/servers/${peer.name}?defaults=on`).toBeTruthy();
		expect(window.fetch.mock.calls[1][0] ===
        `${API_PATH}/config/${apiPrefix}/upstreams/${upstreamName}/servers/${peer.name}/`).toBeTruthy();

		spyApiProxyGet.mockRestore();
	});

	it('createPeer()', () => {
		const upstreamName = 'upstream_1';
		const peerData = {
			name: 'test_peer',
			server: 'name',
		};

		const spyApiProxyPut = jest.spyOn(ApiProxy.prototype, 'put').mockClear();

		const promise = testUpstreamsApi.createPeer(upstreamName, peerData);

		expect(promise instanceof Promise).toBeTruthy();
		expect(spyApiProxyPut).toHaveBeenCalled();
		expect(window.fetch.mock.calls[0][0] ===
        `${API_PATH}/config/${apiPrefix}/upstreams/${upstreamName}/servers/${peerData.server}/`).toBeTruthy();
		expect('body' in window.fetch.mock.calls[0][1]).toBeTruthy();

		const body = JSON.parse(window.fetch.mock.calls[0][1].body);

		Object.keys(peerData).forEach((key) => {
			expect(key in body).toBeTruthy();
			expect(body[key] === peerData[key]).toBeTruthy();
		});

		spyApiProxyPut.mockRestore();
	});

	it('deletePeer()', () => {
		const upstreamName = 'upstream_1';
		const peer = {
			name: 'peer_1',
		};

		const spyApiProxyDel = jest.spyOn(ApiProxy.prototype, 'del').mockClear();

		const promise = testUpstreamsApi.deletePeer(upstreamName, peer);

		expect(promise instanceof Promise).toBeTruthy();
		expect(spyApiProxyDel).toHaveBeenCalled();
		expect(window.fetch.mock.calls[0][0] ===
        `${API_PATH}/config/${apiPrefix}/upstreams/${upstreamName}/servers/${peer.name}/`).toBeTruthy();

		spyApiProxyDel.mockRestore();
	});

	it('updatePeer()', () => {
		const upstreamName = 'upstream_1';
		const peer = {
			name: 'peer_1',
		};
		const peerData = {
			name: 'test_peer_new',
		};

		const spyApiProxyPatch = jest.spyOn(ApiProxy.prototype, 'patch').mockClear();

		const promise = testUpstreamsApi.updatePeer(upstreamName, peer, peerData);

		expect(promise instanceof Promise).toBeTruthy();
		expect(spyApiProxyPatch).toHaveBeenCalled();
		expect(window.fetch.mock.calls[0][0] ===
        `${API_PATH}/config/${apiPrefix}/upstreams/${upstreamName}/servers/${peer.name}/`).toBeTruthy();
		expect('body' in window.fetch.mock.calls[0][1]).toBeTruthy();

		const body = JSON.parse(window.fetch.mock.calls[0][1].body);

		Object.keys(peerData).forEach((key) => {
			expect(key in body).toBeTruthy();
			expect(body[key] === peerData[key]).toBeTruthy();
		});

		spyApiProxyPatch.mockRestore();
	});
});
