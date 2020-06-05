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
import calculateLocationZones from '../calculators/locationzones.js';
import calculateUpstreams from '../calculators/upstreams.js';
import { zones as calculateStreamZones, upstreams as calculateStreamUpstreams } from '../calculators/stream.js';
import calculateCaches from '../calculators/caches.js';
import calculateSharedZones from '../calculators/sharedzones.js';
import calculateConnections from '../calculators/connections.js';
import calculateSSL from '../calculators/ssl.js';
import calculateRequests from '../calculators/requests.js';
import calculateZoneSync from '../calculators/zonesync.js';
import calculateResolvers from '../calculators/resolvers.js';
import { subscribe, unsubscribe, availableApiEndpoints } from '../datastore';

const api = new Proxy({}, {
	get(target, pathStart) {
		return new ApiProxy(API_PATH, pathStart);
	}
});

export default api;
export const httpUpstreamsApi = new UpstreamsApi('http');
export const streamUpstreamsApi = new UpstreamsApi('stream');

let apiWritePermissions = null;

export const checkWritePermissions = (sendCredentials = false) => api.http.upstreams.DASHBOARD_INIT.servers.__TEST_FOR_WRITE__.del({
	credentials: sendCredentials ? 'same-origin' : 'omit'
}).then(
	({ error }) => error.status,
	({ status }) => status
).then((status) => {
	if (status === 405 || status === 403) {
		apiWritePermissions = false;
	} else if (status === 401) {
		apiWritePermissions = null;
	} else {
		apiWritePermissions = true;
	}

	return apiWritePermissions;
});

export const isWritable = () => apiWritePermissions;

export const checkApiAvailability = () => {
	const nginxApi = api.nginx;

	return nginxApi.get().catch((err) => {
		if (err.status === 401) {
			throw { type: 'basic_auth' };
		}

		return window.fetch('/status').then((res) => {
			if (res.status === 200) {
				throw { type: 'old_status_found' };
			}

			throw { type: 'api_not_found' };
		});
	});
};

export const initialLoad = () => {
	const apis = [
		api.nginx,
		api.connections.process(calculateConnections),
		api.ssl.process(calculateSSL),
		api.http.requests.process(calculateRequests),
		api.http.server_zones.process(calculateServerZones),
		api.http.location_zones.process(calculateLocationZones),
		api.http.upstreams.process(calculateUpstreams),
		api.stream.server_zones.process(calculateStreamZones),
		api.stream.upstreams.process(calculateStreamUpstreams),
		api.http.caches.process(calculateCaches),
		api.slabs.process(calculateSharedZones),
		api.stream.zone_sync.process(calculateZoneSync),
		api.resolvers.process(calculateResolvers)
	];

	return window.fetch(`${API_PATH}/`)
		.then(response => {
			if (response.status <= 299) {
				return response.json()
					.then(data => {
						if (data) {
							availableApiEndpoints[0] = data;
						}
					})
					.catch(err => {});
			}
		})
		.then(() =>
			Promise.all(
				Object.keys(availableApiEndpoints[1]).map(apiKey =>
					availableApiEndpoints[0].includes(apiKey) ?
						window.fetch(`${API_PATH}/${apiKey}/`).then(
							response => {
								if (response.status <= 299) {
									return response.json()
										.then(data => {
											if (data) {
												availableApiEndpoints[1][apiKey] = data;
											}
										})
										.catch(err => {});
								}
							}
						)
					: Promise.resolve()
				)
			)
				.then(() =>
					new Promise((resolve) => {
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
					})
				)
		);
};