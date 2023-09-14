/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import ApiProxy from './ApiProxy.js';
import UpstreamsApi from './upstreamsApi';
import { API_PATH } from '../constants.js';

import mapperHttpResponse from './mappers/httpResponse.js';
import mapperHttpUpstreams from './mappers/httpUpstreams.js';
import mapperStreamServerZones from './mappers/streamServerZones.js';

import calculateAngie from '../calculators/angie.js';
import calculateServerZones from '../calculators/serverzones.js';
import calculateLocationZones from '../calculators/locationzones.js';
import calculateConnections from '../calculators/connections.js';
import calculateSharedZones from '../calculators/sharedzones.js';
import calculateCaches from '../calculators/caches.js';
import calculateUpstreams from '../calculators/upstreams.js';
import calculateResolvers from '../calculators/resolvers.js';
import { zones as calculateStreamZones } from '../calculators/stream.js';
import mapperResolvers from './mappers/resolvers.js';

const api = new Proxy({}, {
	get(target, pathStart) {
		return new ApiProxy(API_PATH, pathStart);
	}
});

export default api;

/* TODO Circular dependency! Move UpstreamsApi to other module, bacause UpstreamsApi use default api from this module.
 * Jest doesnt work if module has circular dependencies */
export const httpUpstreamsApi = new UpstreamsApi('http');
/* TODO Circular dependency! Move UpstreamsApi to other module, bacause UpstreamsApi use default api from this module.
 * Jest doesnt work if module has circular dependencies */
export const streamUpstreamsApi = new UpstreamsApi('stream');

export let isAngieProFlag = false;
let apiWritePermissions = null;

export const checkWritePermissions = (upstream, server, sendCredentials = false) =>
	api.config.http.upstreams[upstream].servers[server].get({
		credentials: sendCredentials ? 'same-origin' : 'omit'
	}).then(() => {
		apiWritePermissions = true;
		return apiWritePermissions;
	}).catch(({ status }) => {
		if ([403, 404, 405].indexOf(status) !== -1) {
			apiWritePermissions = false;
		} else {
			apiWritePermissions = null;
		}
		return apiWritePermissions;
	});

export const isWritable = () => apiWritePermissions;
export const isAngiePro = () => isAngieProFlag;

export function defineAngieVersion(build) {
	if (!build) {
		isAngieProFlag = false;
	} else if (typeof build === 'string' && build.toLowerCase().indexOf('pro') !== -1) {
		isAngieProFlag = true;
	} else {
		isAngieProFlag = false;
	}
}

export const checkApiAvailability = () => window.fetch(`${API_PATH}/`).then(response => {
	let err = false;

	if (response.status > 299) {
		err = true;
	}

	return response
		.json()
		.then((data) => {
			if (err) {
				throw data;
			}
			return data;
		})
		.catch((data) => {
			throw {
				error: data.error ? `${data.error}: ${data.description}` : null,
				status: response.status,
			};
		});
}).catch((err) => {
	if (err.status === 401) {
		throw { type: 'basic_auth' };
	}

	throw { type: 'api_not_found' };
});

export const initialLoad = ({
	subscribe,
	unsubscribe,
	availableApiEndpoints
}) => {
	const apis = [
		api.angie.process(calculateAngie),
		api.connections.process(calculateConnections),
		api.http.server_zones.setMapper(mapperHttpResponse).process(calculateServerZones),
		api.http.location_zones.setMapper(mapperHttpResponse).process(calculateLocationZones),
		api.slabs.process(calculateSharedZones),
		api.http.caches.process(calculateCaches),
		api.http.upstreams.setMapper(mapperHttpUpstreams).process(calculateUpstreams),
		api.resolvers.setMapper(mapperResolvers).process(calculateResolvers),
		api.stream.server_zones.setMapper(mapperStreamServerZones).process(calculateStreamZones),
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
	defineAngieVersion,
	isWritable,
	isAngiePro,
};
