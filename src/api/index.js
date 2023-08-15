/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import ApiProxy from './ApiProxy.js';
import UpstreamsApi from './UpstreamsApi.js';
import { API_PATH } from '../constants.js';

import mapperHttpResponse from './mappers/httpResponse.js';

import calculateServerZones from '../calculators/serverzones.js';
import calculateLocationZones from '../calculators/locationzones.js';
import calculateConnections from '../calculators/connections.js';
import calculateSharedZones from '../calculators/sharedzones.js';
import calculateCaches from '../calculators/caches.js';

const api = new Proxy({}, {
	get(target, pathStart) {
		return new ApiProxy(API_PATH, pathStart);
	}
});

export default api;

export const httpUpstreamsApi = new UpstreamsApi('http');
export const streamUpstreamsApi = new UpstreamsApi('stream');

let apiWritePermissions = null;

export const checkWritePermissions = (sendCredentials = false) =>
	api.http.upstreams.DASHBOARD_INIT.servers.__TEST_FOR_WRITE__.del({
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
	const angieApi = api.angie;

	return angieApi.get().catch((err) => {
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

export const initialLoad = ({
	subscribe,
	unsubscribe,
	availableApiEndpoints
}) => {
	const apis = [
		api.angie,
		api.connections.process(calculateConnections),
		api.http.server_zones.setMapper(mapperHttpResponse).process(calculateServerZones),
		api.http.location_zones.setMapper(mapperHttpResponse).process(calculateLocationZones),
		api.slabs.process(calculateSharedZones),
		api.http.caches.process(calculateCaches),
	];

	return window.fetch(`${API_PATH}/`)
		.then(response => {
			if (response.status <= 299) {
				return response.json()
					.then(data => {
						if (data) {
							availableApiEndpoints.fillFirstLevel(data);
						}
					})
					.catch(() => {});
			}
		})
		.then(() =>
			Promise.all(
				availableApiEndpoints.getSecondLevel().map(apiKey =>
					availableApiEndpoints.firstLevelIncludes(apiKey)
						? window.fetch(`${API_PATH}/${apiKey}/`).then(
							response => {
								if (response.status <= 299) {
									return response.json()
										.then(data => {
											if (data) {
												availableApiEndpoints.fillThirdLevel(apiKey, data);
											}
										})
										.catch(() => {});
								}
							}
						)
						: Promise.resolve()
				)
			)
				.then(() => new Promise((resolve) => {
					let called = false;
					subscribe(apis, () => {
						// FIXME: This callback should be called just once for this bulk of apis

						if (called) {
							return;
						}

						called = true;
						unsubscribe(apis);

						resolve();
					});
				})
				));
};

export const apiUtils = {
	checkWritePermissions,
	checkApiAvailability,
	initialLoad,
	isWritable,
};
