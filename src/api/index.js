/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import ApiProxy from './ApiProxy.js';
import UpstreamsApi from './UpstreamsApi.js';
import { API_PATH } from '../constants.js';

import calculateServerZones from '../calculators/serverzones.js';
import calculateUpstreams from '../calculators/upstreams.js';
import { zones as calculateStreamZones, upstreams as calculateStreamUpstreams } from '../calculators/stream.js';
import calculateCaches from '../calculators/caches.js';
import calculateSharedZones from '../calculators/sharedzones.js';
import calculateConnections from '../calculators/connections.js';
import calculateRequests from '../calculators/requests.js';
import {subscribe, unsubscribe} from '../datastore';

const api = new Proxy({}, {
	get(target, pathStart) {
		return new ApiProxy(API_PATH, pathStart);
	}
});

export default api;

export const httpUpstreamsApi = new UpstreamsApi('http');
export const streamUpstreamsApi = new UpstreamsApi('stream');

export const checkApiWritePermissions = () => Promise.all([
	httpUpstreamsApi.checkWritePermission(),
	streamUpstreamsApi.checkWritePermission()
]);

export const checkApiAvailability = () =>
	api.nginx.get().catch((err) => {
		// if (err.status === 401) {
		// 	// return new Promise((resolve) => {
		// 		const el = document.createElement('iframe');
		// 		el.style.visibility = 'hidden';
		// 		el.src = api.nginx.getUrl();
		// 		document.body.appendChild(el);
		//
		// 		el.onload = () => {
		// 			document.body.removeChild(el);
		//
		// 			checkApiAvailability().then(resolve);
		// 		};
		// 	});
		// }

		return window.fetch('/status').then((res) => {
			if (res.status === 200) {
				throw { type: 'old_status_found' };
			}

			throw { type: 'api_not_found' };
		})
	});


export const initialLoad = () => {
	const apis = [
		api.nginx,
		api.connections.process(calculateConnections),
		api.ssl,
		api.http.requests.process(calculateRequests),
		api.http.server_zones.process(calculateServerZones),
		api.http.upstreams.process(calculateUpstreams),
		api.stream.server_zones.process(calculateStreamZones),
		api.stream.upstreams.process(calculateStreamUpstreams),
		api.http.caches.process(calculateCaches),
		api.slabs.process(calculateSharedZones)
	];

	return new Promise((resolve) => {
		let called = false;
		subscribe(apis, (...args) => {
			// FIXME: This callback should be called just once for this bulk of apis

			if (called) {
				return;
			}

			called = true;
			unsubscribe(apis);

			resolve();
		});
	});
};