/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import appsettings from '../appsettings';
import store from './store';
import AvailableApiEndpoints from './availableApiEndpoints.js';

export const availableApiEndpoints = new AvailableApiEndpoints();

export const OBSERVED = new Map();

export let live = true;

export const pause = () => {
	live = false;
};

export const play = () => {
	live = true;
};

export const unsubscribe = (apis, fn) => {
	apis.forEach((api) => {
		const instance = OBSERVED.get(api.toString());

		if (instance) {
			instance.instancesCount--;
			instance.callbacks = instance.callbacks.filter(callback => callback !== fn);

			if (instance.instancesCount === 0) {
				OBSERVED.delete(api.toString());
			}
		}
	});
};

let timeout = null;

export const startObserve = function loop(force = false) {
	clearTimeout(timeout);

	if (force === true || live) {
		if (force === true) {
			play();
		}

		const timeStart = Date.now();

		Promise.all(
			Array.from(OBSERVED).map(([, instance]) =>
				instance.api.get()
					.then(data => data, err => err)
					.then((data) => {
						if (data.status === 403) {
							availableApiEndpoints.removeEndpoint(instance.api.path);
							OBSERVED.delete(instance.api.toString());
						}
						return {
							data: data && data.error ? null : data,
							api: instance.api,
							timeStart
						};
					})
			)
		).then((data) => {
			data.forEach(({ api, data, timeStart }) => {
				store.handleDataUpdate(api, data, timeStart);

				const apiHandler = OBSERVED.get(api.toString());

				if (apiHandler) {
					apiHandler.callbacks.forEach(callback => callback());
				}
			});
		}).catch((err) => {
			throw err;
		});
	}

	timeout = setTimeout(loop, appsettings.getSetting('updatingPeriod'));
};

let immediate = null;

export const subscribe = (apis, callback) => {
	// TODO: Throttled callback

	apis.forEach(api => {
		let isAvailable = availableApiEndpoints.firstLevelIncludes(api.path[0]);

		const instance = OBSERVED.get(api.toString());

		if (
			isAvailable &&
			availableApiEndpoints.secondLevelIncludes(api.path[0])
		) {
			isAvailable = availableApiEndpoints.thirdLevelIncludes(api.path[0], api.path[1]);
		}

		if (isAvailable) {
			if (instance) {
				instance.callbacks.push(callback);
				instance.instancesCount++;
				return;
			}

			OBSERVED.set(api.toString(), {
				api,
				callbacks: [
					callback
				],
				instancesCount: 1
			});
		} else if (instance) {
			OBSERVED.delete(api.toString());
		}
	});

	window.clearImmediate(immediate);

	immediate = window.setImmediate(startObserve);
};

export const { get, STORE } = store;

export default {
	availableApiEndpoints,
	unsubscribe,
	startObserve,
	subscribe,
	get,
};
