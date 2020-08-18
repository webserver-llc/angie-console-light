/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import appsettings from '../appsettings';
import * as utils from './utils.js';

export const cachesHistory = new Proxy({}, {
	get(history, cacheName) {
		if (!(cacheName in history)) {
			history[cacheName] = [];
		}

		return history[cacheName];
	}
});

export const calculateCacheHit = (cache) => {
	const arrLength = parseInt(
		appsettings.getSetting('cacheDataInterval') / appsettings.getSetting('updatingPeriod'),
		10
	);

	const cacheInHistory = cachesHistory[cache.name];

	cacheInHistory.unshift({
		served: cache.responses.served,
		bypassed: cache.responses.bypassed
	});

	if (cacheInHistory.length < 2) {
		return null;
	}

	if (cacheInHistory.length > arrLength) {
		cacheInHistory.pop();
	}

	const lastIndex = cacheInHistory.length - 1;
	const numerator = cacheInHistory[0].served - cacheInHistory[lastIndex].served;
	const denominator = cacheInHistory[0].served + cacheInHistory[0].bypassed - cacheInHistory[lastIndex].served - cacheInHistory[lastIndex].bypassed;

	return (denominator !== 0) ? Math.round((numerator / denominator) * 100) : 0;
};

export function handleCache(STATS, slabs, cache, cacheName) {
	cache.name = cacheName;

	if (cache.cold) {
		STATS.states.cold++;
	} else {
		STATS.states.warm++;
	}

	cache.responses = {
		served: cache.hit.responses + cache.stale.responses + cache.updating.responses + cache.revalidated.responses,
		written: cache.miss.responses_written + cache.expired.responses_written + cache.bypass.responses_written,
		bypassed: cache.miss.responses + cache.expired.responses + cache.bypass.responses
	};

	cache.traffic = {
		s_served: cache.hit.bytes + cache.stale.bytes + cache.updating.bytes + cache.revalidated.bytes,
		s_written: cache.miss.bytes_written + cache.expired.bytes_written + cache.bypass.bytes_written,
		s_bypassed: cache.miss.bytes + cache.expired.bytes + cache.bypass.bytes
	};

	cache.hit_percents_generic = calculateCacheHit(cache);

	if (typeof cache.max_size === 'number') {
		cache.used = Math.round((cache.size / cache.max_size) * 100);
	} else {
		cache.used = (cache.size > 0) ? 1 : 0;
	}

	utils.pickZoneSize(cache, slabs, cacheName);

	let warning = false;

	if (cache.hit_percents_generic !== null && cache.hit_percents_generic < 30) {
		STATS.status = 'warning';
		warning = true;
	}

	if (cache.used > 105) {
		STATS.alerts++;
		cache.danger = true;
		STATS.status = 'danger';
	} else if (cache.used > 100 && cache.used <= 105) {
		STATS.status = 'warning';
		cache.warning = true;
		warning = true;
	}

	if (warning) {
		STATS.warnings++;
	}

	return cache;
};

export default (caches, previous, STORE) => {
	const __STATUSES = STORE.__STATUSES;

	if (caches === null || Object.keys(caches).length === 0) {
		__STATUSES.caches.ready = false;
		return null;
	}

	const STATS = {
		total: 0,
		states: {
			warm: 0,
			cold: 0
		},
		warnings: 0,
		alerts: 0,
		status: 'ok'
	};
	const { slabs } = STORE;

	caches = utils.createMapFromObject(caches, handleCache.bind(null, STATS, slabs));

	STATS.total = caches.size;

	caches.__STATS = STATS;
	__STATUSES.caches.ready = true;
	__STATUSES.caches.status = STATS.status;

	return caches;
};
