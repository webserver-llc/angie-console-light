/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import __STATUSES from './status.js';

export const STORE = {
	__STATUSES
};

window.STORE = STORE;

export const handleDataUpdate = ({ path, processors }, data, timeStart) => {
	let ptr = STORE;

	path.forEach((path, i, arr) => {
		if (!ptr[path]) {
			if (i === arr.length - 1) {
				ptr[path] = null;
			} else {
				ptr[path] = {};
			}
		}

		if (i !== arr.length - 1) {
			ptr = ptr[path];
		}
	});

	processors.forEach((fn) => {
		data = fn(data, ptr[path[path.length - 1]], STORE, timeStart);
	});

	if (data !== null) {
		data.lastUpdate = Date.now();
	}

	ptr[path[path.length - 1]] = data;
};

export const get = (apis) => {
	const res = {};

	apis.forEach((api) => {
		let ptr = STORE;

		api.path.forEach((path) => {
			if (ptr === null || !ptr[path]) {
				ptr = null;
				return;
			}

			ptr = ptr[path];
		});

		if (ptr !== null) {
			res[api.path[api.path.length - 1]] = ptr;
		} else {
			res[api.path[api.path.length - 1]] = null;
		}
	});

	return res;
};

export default {
	STORE,
	handleDataUpdate,
	get,
};
