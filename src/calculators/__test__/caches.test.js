/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
import calculate, {
	cachesHistory,
	calculateCacheHit,
	handleCache
} from '../caches.js';
import appsettings from '../../appsettings';
import utils from '../utils.js';

describe('Calculators – Caches', () => {
	it('cachesHistory', () => {
		const key = 'test_cache_history';

		expect(cachesHistory).to.be.an('object');
		expect(cachesHistory[key]).to.be.deep.equal([]);
	});

	it('calculateCacheHit()', () => {
		const cache = {
			name: 'test_cache',
			responses: {
				served: 17,
				bypassed: 2
			}
		};
		const cacheDataInterval = appsettings.getSetting('cacheDataInterval');
		const updatingPeriod = appsettings.getSetting('updatingPeriod');

		appsettings.setSetting('cacheDataInterval', 3000);
		appsettings.setSetting('updatingPeriod', 1000);
		spy(appsettings, 'getSetting');

		assert(calculateCacheHit(cache) === null, 'Should return null for first call');
		assert(appsettings.getSetting.calledTwice, '"getSetting" should be called twice');
		assert(
			appsettings.getSetting.args[0][0] === 'cacheDataInterval',
			'First call of "getSettings should be for "cacheDataInterval" prop'
		);
		assert(
			appsettings.getSetting.args[1][0] === 'updatingPeriod',
			'Second call of "getSettings should be for "updatingPeriod" prop'
		);
		assert(cachesHistory[cache.name].length === 1, '"cachesHistory" should includes one record');
		expect(calculateCacheHit(cache)).to.be.equal(0);
		expect(cachesHistory[cache.name]).to.be.deep.equal([cache.responses, cache.responses]);

		const cache_1 = Object.assign({}, cache, { responses: { served: 33, bypassed: 0 } });

		expect(calculateCacheHit(cache_1)).to.be.equal(114);
		expect(cachesHistory[cache.name]).to.be.deep.equal([cache_1.responses, cache.responses, cache.responses]);

		const cache_2 = Object.assign({}, cache, { responses: { served: 10, bypassed: 3 } });

		expect(calculateCacheHit(cache_2)).to.be.equal(117);
		expect(cachesHistory[cache.name]).to.be.deep.equal([cache_2.responses, cache_1.responses, cache.responses]);

		appsettings.setSetting('cacheDataInterval', cacheDataInterval);
		appsettings.setSetting('updatingPeriod', updatingPeriod);
		appsettings.getSetting.restore();
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
		const slabs = { 'slabs_test': true };
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
		stub(utils, 'pickZoneSize').callsFake(() => {});

		let result = handleCache(STATS, slabs, cache, cacheName);

		expect(result, 'Modify cache arg').to.be.deep.equal(cache);
		expect(result.name, 'cache.name').to.be.equal(cacheName);
		expect(STATS.states.warm, 'STATS.states.warm').to.be.equal(1);
		expect(STATS.states.cold, 'STATS.states.cold').to.be.equal(0);
		expect(result.responses, 'cache.responses').to.be.deep.equal({
			served: 32,
			written: 4,
			bypassed: 8
		});
		expect(result.traffic, 'cache.traffic').to.be.deep.equal({
			s_served: 80,
			s_written: 38,
			s_bypassed: 50
		});

		cachesHistory[cacheName] = startCachesHistory.slice();

		expect(result.hit_percents_generic, 'cache.hit_percents_generic').to.be.equal(calculateCacheHit(cache));

		delete cachesHistory[cacheName];

		expect(result.used, 'cache.used').to.be.equal(8);
		expect(utils.pickZoneSize.calledOnce, 'pickZoneSize calledOnce').to.be.true;
		expect(utils.pickZoneSize.args[0][0], 'pickZoneSize 1st arg').to.be.deep.equal(cache);
		expect(utils.pickZoneSize.args[0][1], 'pickZoneSize 2nd arg').to.be.deep.equal(slabs);
		expect(utils.pickZoneSize.args[0][2], 'pickZoneSize 3rd arg').to.be.deep.equal(cacheName);
		expect(result.danger, 'cache.danger').to.be.an('undefined');
		expect(result.warning, 'cache.warning').to.be.an('undefined');
		expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
		expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
		expect(STATS.status, 'STATS.status').to.be.equal('ok');

		cache.cold = true;
		result = handleCache(STATS, slabs, cache, cacheName);

		expect(STATS.states.warm, 'STATS.states.warm (cold -> true)').to.be.equal(1);
		expect(STATS.states.warm, 'STATS.states.cold (cold -> true)').to.be.equal(1);
		expect(STATS.warnings, 'STATS.warnings (cold -> true)').to.be.equal(0);
		expect(STATS.status, 'STATS.status (cold -> true)').to.be.equal('ok');

		cache.max_size = null;
		result = handleCache(STATS, slabs, cache, cacheName);

		expect(result.used, 'cache.used (max_size -> null)').to.be.equal(1);
		expect(STATS.status, 'STATS.status (max_size -> null)').to.be.equal('warning');
		expect(STATS.warnings, 'STATS.warnings (max_size -> null)').to.be.equal(1);

		cache.size = 0;
		result = handleCache(STATS, slabs, cache, cacheName);

		expect(result.used, 'cache.used (size -> 0)').to.be.equal(0);
		expect(STATS.status, 'STATS.status (size -> 0)').to.be.equal('warning');
		expect(STATS.warnings, 'STATS.warnings (size -> 0)').to.be.equal(2);

		cache.size = 102;
		cache.max_size = 100;
		result = handleCache(STATS, slabs, cache, cacheName);

		expect(result.used, 'cache.used').to.be.equal(102);
		expect(STATS.status, 'STATS.status (cache.used -> 102)').to.be.equal('warning');
		expect(STATS.warnings, 'STATS.warnings (cache.used -> 102)').to.be.equal(3);
		expect(result.danger, 'cache.danger').to.be.an('undefined');
		expect(result.warning, 'cache.warning').to.be.true;

		cache.size = 110;
		result = handleCache(STATS, slabs, cache, cacheName);

		expect(result.used, 'cache.used').to.be.equal(110);
		expect(STATS.status, 'STATS.status (cache.used -> 110)').to.be.equal('danger');
		expect(STATS.alerts, 'STATS.alerts (cache.used -> 110)').to.be.equal(1);
		expect(result.danger, 'cache.danger').to.be.true;

		utils.pickZoneSize.restore();
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

		stub(utils, 'createMapFromObject').callsFake(() => _caches);

		expect(calculate(null, null, STORE), 'caches is null').to.be.a('null');
		expect(STORE.__STATUSES.caches.ready, 'ready after null caches').to.be.false;
		expect(utils.createMapFromObject.notCalled, 'createMapFromObject after null caches').to.be.true;
		expect(calculate({}, null, STORE), 'caches is empty').to.be.a('null');
		expect(utils.createMapFromObject.notCalled, 'createMapFromObject after empty caches').to.be.true;

		spy(handleCache, 'bind');

		let result = calculate(caches, null, STORE);

		expect(utils.createMapFromObject.calledOnce, 'createMapFromObject called once').to.be.true;
		expect(utils.createMapFromObject.args[0][0], 'createMapFromObject 1st arg').to.be.deep.equal(caches);
		expect(utils.createMapFromObject.args[0][1], 'createMapFromObject 2nd arg')
			.to.be.deep.equal(handleCache.bind.returnValues[0]);
		expect(handleCache.bind.calledOnce, 'handleCache call count').to.be.true;
		expect(handleCache.bind.args[0][0], 'handleCache 1st arg').to.be.a('null');

		STATS.total = result.size;

		expect(handleCache.bind.args[0][1], 'handleCache 2nd arg').to.be.deep.equal(STATS);
		expect(handleCache.bind.args[0][2], 'handleCache 3rd arg').to.be.deep.equal(STORE.slabs);
		expect(result.__STATS.total, 'caches.__STATS.total').to.be.equal(1);
		expect(STORE.__STATUSES.caches, 'STORE.__STATUSES').to.be.deep.equal({ ready: true, status: STATS.status });

		utils.createMapFromObject.restore();
		handleCache.bind.restore();
	});
});
