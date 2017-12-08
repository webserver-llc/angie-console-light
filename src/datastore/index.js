/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import { getSetting } from '../appsettings';
import { STORE as _STORE, handleDataUpdate, get as getFromStore } from './store';

const OBSERVED = new Map();

let live = true;

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
			instance.instacesCount--;
			instance.callbacks = instance.callbacks.filter(callback => callback !== fn);
		}

		if (instance.instacesCount === 0) {
			OBSERVED.delete(api.toString());
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

		Promise.all(
			Array.from(OBSERVED).map(([path, instance]) => {
				return instance.api.get().then((data) => {
					if (data && data.error) {
						data = null;
					}

					return {
						data,
						api: instance.api
					};
				})
			})
		).then((data) => {
			data.forEach(({ api, data }) => {
				handleDataUpdate(api, data);

				const apiHandler = OBSERVED.get(api.toString());

				if (apiHandler) {
					apiHandler.callbacks.forEach(callback => callback());
				}
			});

		}).catch((err) => {
			throw err;
		});
	}

	timeout = setTimeout(loop, getSetting('updatingPeriod'));
};

let immediate = null;

export const subscribe = (apis, callback) => {
	// TODO: Throttled callback

	apis.forEach(api => {
		const instance = OBSERVED.get(api.toString());

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
	});

	clearImmediate(immediate);
	immediate = setImmediate(() => startObserve());
};

export const get = getFromStore;
export const STORE = _STORE;
