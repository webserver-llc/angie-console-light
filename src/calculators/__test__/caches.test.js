/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import calculate, { cachesHistory, calculateCacheHit, handleCache } from '../caches.js';
import appsettings from '../../appsettings';
import utils from '../utils.js';

describe('Calculators – Caches', () => {
	it('cachesHistory', () => {
		const key = 'test_cache_history';

		expect(cachesHistory).toBeInstanceOf(Object);
		expect(cachesHistory[key]).toEqual([]);
	});

	it('calculateCacheHit()', () => {
		const cache = {
			name: 'test_cache',
			responses: {
				served: 17,
				bypassed: 2
			}
		};
		appsettings.init();
		const cacheDataInterval = appsettings.getSetting('cacheDataInterval');
		const updatingPeriod = appsettings.getSetting('updatingPeriod');

		appsettings.setSetting('cacheDataInterval', 3000);
		appsettings.setSetting('updatingPeriod', 1000);
		const spyAppSettingsGet = jest.spyOn(appsettings, 'getSetting').mockClear();

		expect(calculateCacheHit(cache) === null).toBeTruthy();
		expect(spyAppSettingsGet).toHaveBeenCalledTimes(2);
		expect(appsettings.getSetting.mock.calls[0][0] === 'cacheDataInterval').toBeTruthy();
		expect(appsettings.getSetting.mock.calls[1][0] === 'updatingPeriod').toBeTruthy();
		expect(cachesHistory[cache.name].length === 1).toBeTruthy();
		expect(calculateCacheHit(cache)).toBe(0);
		expect(cachesHistory[cache.name]).toEqual([cache.responses, cache.responses]);

		const cache_1 = { ...cache, responses: { served: 33, bypassed: 0 } };

		expect(calculateCacheHit(cache_1)).toBe(114);
		expect(cachesHistory[cache.name]).toEqual([cache_1.responses, cache.responses, cache.responses]);

		const cache_2 = { ...cache, responses: { served: 10, bypassed: 3 } };

		expect(calculateCacheHit(cache_2)).toBe(117);
		expect(cachesHistory[cache.name]).toEqual([cache_2.responses, cache_1.responses, cache.responses]);

		appsettings.setSetting('cacheDataInterval', cacheDataInterval);
		appsettings.setSetting('updatingPeriod', updatingPeriod);
		appsettings.getSetting.mockRestore();
	});

	it('handleCache()', () => {
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
		const slabs = { slabs_test: true };
		const cache = {
			size: 41763234,
			max_size: 536870912,
			cold: false,
			hit: { responses: 1, bytes: 10 },
			stale: { responses: 22, bytes: 20 },
			updating: { responses: 9, bytes: 50 },
			revalidated: { responses: 0, bytes: 0 },
			miss: {
				responses: 1,
				bytes: 40,
				responses_written: 3,
				bytes_written: 33
			},
			expired: {
				responses: 3,
				bytes: 0,
				responses_written: 0,
				bytes_written: 0
			},
			bypass: {
				responses: 4,
				bytes: 10,
				responses_written: 1,
				bytes_written: 5
			}
		};
		const cacheName = 'http_cache';
		const startCachesHistory = [{
			served: 0,
			bypassed: 0
		}, {
			served: 3,
			bypassed: 1
		}];

		cachesHistory[cacheName] = startCachesHistory.slice();
		const spyUtilsPickZoneSize = jest.spyOn(utils, 'pickZoneSize').mockClear().mockImplementation(() => {});

		let result = handleCache(STATS, slabs, cache, cacheName);

		// Modify cache arg
		expect(result).toEqual(cache);
		// cache.name
		expect(result.name).toBe(cacheName);
		// STATS.states.warm
		expect(STATS.states.warm).toBe(1);
		// STATS.states.cold
		expect(STATS.states.cold).toBe(0);
		// cache.responses
		expect(result.responses).toEqual({
			served: 32,
			written: 4,
			bypassed: 8
		});
		// cache.traffic
		expect(result.traffic).toEqual({
			s_served: 80,
			s_written: 38,
			s_bypassed: 50
		});

		cachesHistory[cacheName] = startCachesHistory.slice();

		// cache.hit_percents_generic
		expect(result.hit_percents_generic).toBe(calculateCacheHit(cache));

		delete cachesHistory[cacheName];

		// cache.used
		expect(result.used).toBe(8);
		// pickZoneSize calledOnce
		expect(spyUtilsPickZoneSize).toHaveBeenCalled();
		// pickZoneSize 1st arg
		expect(spyUtilsPickZoneSize.mock.calls[0][0]).toEqual(cache);
		// pickZoneSize 2nd arg
		expect(spyUtilsPickZoneSize.mock.calls[0][1]).toEqual(slabs);
		// pickZoneSize 3rd arg
		expect(spyUtilsPickZoneSize.mock.calls[0][2]).toEqual(cacheName);
		expect(result.danger).toBeUndefined();
		expect(result.warning).toBeUndefined();
		// STATS.alerts
		expect(STATS.alerts).toBe(0);
		// STATS.warnings
		expect(STATS.warnings).toBe(0);
		// STATS.status
		expect(STATS.status).toBe('ok');

		cache.cold = true;
		result = handleCache(STATS, slabs, cache, cacheName);

		// STATS.states.warm (cold -> true)
		expect(STATS.states.warm).toBe(1);
		// STATS.states.cold (cold -> true)
		expect(STATS.states.warm).toBe(1);
		// STATS.warnings (cold -> true)
		expect(STATS.warnings).toBe(0);
		// STATS.status (cold -> true)
		expect(STATS.status).toBe('ok');

		cache.max_size = null;
		result = handleCache(STATS, slabs, cache, cacheName);

		// cache.used (max_size -> null)
		expect(result.used).toBe(1);
		// STATS.status (max_size -> null)
		expect(STATS.status).toBe('warning');
		// STATS.warnings (max_size -> null)
		expect(STATS.warnings).toBe(1);

		cache.size = 0;
		result = handleCache(STATS, slabs, cache, cacheName);

		// cache.used (size -> 0)
		expect(result.used).toBe(0);
		// STATS.status (size -> 0)
		expect(STATS.status).toBe('warning');
		// STATS.warnings (size -> 0)
		expect(STATS.warnings).toBe(2);

		cache.size = 102;
		cache.max_size = 100;
		result = handleCache(STATS, slabs, cache, cacheName);

		// cache.used
		expect(result.used).toBe(102);
		// STATS.status (cache.used -> 102)
		expect(STATS.status).toBe('warning');
		// STATS.warnings (cache.used -> 102)
		expect(STATS.warnings).toBe(3);
		expect(result.danger).toBeUndefined();
		// cache.warning
		expect(result.warning).toBe(true);

		cache.size = 110;
		result = handleCache(STATS, slabs, cache, cacheName);

		// cache.used
		expect(result.used).toBe(110);
		// STATS.status (cache.used -> 110)
		expect(STATS.status).toBe('danger');
		// STATS.alerts (cache.used -> 110)
		expect(STATS.alerts).toBe(1);
		// cache.danger
		expect(result.danger).toBe(true);

		utils.pickZoneSize.mockRestore();
	});

	it('calculate()', () => {
		const caches = JSON.parse('{"http_cache":{"size":0}}');
		const STORE = {
			__STATUSES: { caches: {} },
			slabs: {}
		};
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
		const _caches = new Map([['http_cache', caches.http_cache]]);

		const spyUtilsCreateMapFromObject = jest.spyOn(utils, 'createMapFromObject').mockClear().mockImplementation(() => _caches);

		expect(calculate(null, null, STORE)).toBeNull();
		// ready after null caches
		expect(STORE.__STATUSES.caches.ready).toBe(false);
		// createMapFromObject after null caches
		expect(spyUtilsCreateMapFromObject).not.toHaveBeenCalled();
		expect(calculate({}, null, STORE)).toBeNull();
		// createMapFromObject after empty caches
		expect(spyUtilsCreateMapFromObject).not.toHaveBeenCalled();

		const spyCacheBind = jest.spyOn(handleCache, 'bind').mockClear();

		const result = calculate(caches, null, STORE);

		// createMapFromObject called once
		expect(spyUtilsCreateMapFromObject).toHaveBeenCalled();
		// createMapFromObject 1st arg
		expect(spyUtilsCreateMapFromObject.mock.calls[0][0]).toEqual(caches);
		// createMapFromObject 2nd arg
		spyCacheBind.mockReturnValue(spyUtilsCreateMapFromObject.mock.calls[0][1]);
		// handleCache call count
		expect(spyCacheBind).toHaveBeenCalled();
		expect(spyCacheBind.mock.calls[0][0]).toBeNull();

		STATS.total = result.size;

		// handleCache 2nd arg
		expect(handleCache.bind.mock.calls[0][1]).toEqual(STATS);
		// handleCache 3rd arg
		expect(handleCache.bind.mock.calls[0][2]).toEqual(STORE.slabs);
		// caches.__STATS.total
		expect(result.__STATS.total).toBe(1);
		// STORE.__STATUSES
		expect(STORE.__STATUSES.caches).toEqual({ ready: true, status: STATS.status });

		utils.createMapFromObject.mockRestore();
		handleCache.bind.mockRestore();
	});
});
