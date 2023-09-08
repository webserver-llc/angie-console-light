/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import {
	is4xxThresholdReached,
	calculateSpeed,
	calculateTraffic,
	createMapFromObject,
	handleErrors,
	pickZoneSize,
	countResolverResponses,
} from '../utils.js';
import appsettings from '../../appsettings';

describe('Calculators – utils', () => {
	it('is4xxThresholdReached()', () => {
		jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => 50);

		expect(
			is4xxThresholdReached({ responses: { '4xx': 49 }, requests: 100 })
		).toBe(false);
		// getSetting called once
		expect(appsettings.getSetting).toHaveBeenCalled();
		// getSetting 1st arg
		expect(appsettings.getSetting.mock.calls[0][0]).toBe('warnings4xxThresholdPercent');
		expect(
			is4xxThresholdReached({ responses: { '4xx': 50 }, requests: 100 })
		).toBe(false);
		// getSetting called twice
		expect(appsettings.getSetting).toHaveBeenCalledTimes(2);
		// getSetting 1st arg
		expect(appsettings.getSetting.mock.calls[1][0]).toBe('warnings4xxThresholdPercent');
		expect(
			is4xxThresholdReached({ responses: { '4xx': 51 }, requests: 100 })
		).toBe(true);
		// getSetting called thrice
		expect(appsettings.getSetting).toHaveBeenCalledTimes(3);
		// getSetting 1st arg
		expect(appsettings.getSetting.mock.calls[2][0]).toBe('warnings4xxThresholdPercent');
	});

	it('calculateSpeed()', () => {
		jest.spyOn(Math, 'floor').mockClear();

		// previous == undefined, now == undefined
		expect(calculateSpeed()).toBe('n/a');
		// previous == null, now == undefined
		expect(calculateSpeed(null)).toBe('n/a');
		// previous == undefined, now == null
		expect(calculateSpeed(undefined, null)).toBe('n/a');
		// previous == null, now == null
		expect(calculateSpeed(null, null)).toBe('n/a');
		// previous and now are Strings
		expect(calculateSpeed('123', '3')).toBe('n/a');
		// previous is a String
		expect(calculateSpeed('123', 3)).toBe('n/a');
		// now is a String
		expect(calculateSpeed(43, '34')).toBe('n/a');
		// previous > now
		expect(calculateSpeed(32, 1)).toBe(0);
		// previous < now
		expect(calculateSpeed(3, 50, 2000)).toBe(23);
		// Math.floor called once
		expect(Math.floor).toHaveBeenCalled();
		// Math.floor 1st arg
		expect(Math.floor.mock.calls[0][0]).toBe(23.5);
	});

	it('calculateTraffic', () => {
		const obj = { traffic: {
			in: 0,
			out: 0
		} };

		calculateTraffic(obj, {});

		// traffic.in [zone = {}]
		expect(obj.traffic.in).toBe(0);
		// traffic.out [zone = {}]
		expect(obj.traffic.out).toBe(0);

		calculateTraffic(obj, { rcvd_s: null, sent_s: null });

		// traffic.in [zone = { rcvd_s: null, sent_s: null }]
		expect(obj.traffic.in).toBe(0);
		// traffic.out [zone = { rcvd_s: null, sent_s: null }]
		expect(obj.traffic.out).toBe(0);

		calculateTraffic(obj, { rcvd_s: '123', sent_s: 'null' });

		// traffic.in [zone = { rcvd_s: "123", sent_s: "null" }]
		expect(obj.traffic.in).toBe(0);
		// traffic.out [zone = { rcvd_s: "123", sent_s: "null" }]
		expect(obj.traffic.out).toBe(0);

		calculateTraffic(obj, { rcvd_s: {}, sent_s: () => {} });

		// traffic.in [zone = { rcvd_s: {}, sent_s: () => {} }]
		expect(obj.traffic.in).toBe(0);
		// traffic.out [zone = { rcvd_s: {}, sent_s: () => {} }]
		expect(obj.traffic.out).toBe(0);

		calculateTraffic(obj, { rcvd_s: 123, sent_s: 456 });

		// traffic.in [zone = { rcvd_s: 123, sent_s: 456 }]
		expect(obj.traffic.in).toBe(123);
		// traffic.out [zone = { rcvd_s: 123, sent_s: 456 }]
		expect(obj.traffic.out).toBe(456);

		calculateTraffic(obj, { rcvd_s: 7, sent_s: 14 });

		// traffic.in [zone = { rcvd_s: 7, sent_s: 14 }]
		expect(obj.traffic.in).toBe(130);
		// traffic.out [zone = { rcvd_s: 7, sent_s: 14 }]
		expect(obj.traffic.out).toBe(470);
	});

	describe('createMapFromObject()', () => {
		const obj = {
			b: { ba: 123, bb: '456' },
			a: { aa: 789, ab: '012' }
		};
		const cb = jest.fn((_, key, i) => `${ key }_${ i }`);

		beforeAll(() => {
			jest.spyOn(Array.prototype, 'sort').mockClear();
		});

		beforeEach(() => {
			Array.prototype.sort.mockClear();
			cb.mockClear();
		});

		afterAll(() => {
			Array.prototype.sort.mockRestore();
		});

		it('with sort', () => {
			const result = createMapFromObject(obj, cb);

			// Array sort called once
			expect(Array.prototype.sort).toHaveBeenCalled();
			// cb called twice
			expect(cb).toHaveBeenCalledTimes(2);
			// cd 1st call 1st arg
			expect(cb.mock.calls[0][0]).toEqual(obj.a);
			// cd 1st call 2nd arg
			expect(cb.mock.calls[0][1]).toBe('a');
			// cd 1st call 3rd arg
			expect(cb.mock.calls[0][2]).toBe(0);
			// cd 2nd call 1st arg
			expect(cb.mock.calls[1][0]).toEqual(obj.b);
			// cd 2nd call 2nd arg
			expect(cb.mock.calls[1][1]).toBe('b');
			// cd 2nd call 3rd arg
			expect(cb.mock.calls[1][2]).toBe(1);
			// result instanceOf Map
			expect(result).toBeInstanceOf(Map);
			// result size
			expect(result.size).toBe(2);
			// prop "b" of result
			expect(result.get('b')).toBe('b_1');
			// prop "a" of result
			expect(result.get('a')).toBe('a_0');
		});

		it('without sort', () => {
			const result = createMapFromObject(obj, cb, false);

			// Array sort not called
			expect(Array.prototype.sort).not.toHaveBeenCalled();
			// cb called twice
			expect(cb).toHaveBeenCalledTimes(2);
			// cd 1st call 1st arg
			expect(cb.mock.calls[0][0]).toEqual(obj.b);
			// cd 1st call 2nd arg
			expect(cb.mock.calls[0][1]).toBe('b');
			// cd 1st call 3rd arg
			expect(cb.mock.calls[0][2]).toBe(0);
			// cd 2nd call 1st arg
			expect(cb.mock.calls[1][0]).toEqual(obj.a);
			// cd 2nd call 2nd arg
			expect(cb.mock.calls[1][1]).toBe('a');
			// cd 2nd call 3rd arg
			expect(cb.mock.calls[1][2]).toBe(1);
			// result instanceOf Map
			expect(result).toBeInstanceOf(Map);
			// result size
			expect(result.size).toBe(2);
			// prop "b" of result
			expect(result.get('b')).toBe('b_0');
			// prop "a" of result
			expect(result.get('a')).toBe('a_1');
		});
	});

	describe('handleErrors()', () => {
		const defaultKey = 'responses';
		const key = 'test';
		const previousData = {
			[defaultKey]: { '4xx': 0, '5xx': 0 },
			[key]: { '4xx': 0, '5xx': 0 }
		};
		let data;

		beforeEach(() => {
			data = {
				[defaultKey]: { '4xx': 0, '5xx': 0 },
				[key]: { '4xx': 0, '5xx': 0 }
			};
		});

		it('no previousData', () => {
			handleErrors(null, data);

			expect(data[defaultKey]['4xxChanged']).toBeUndefined();
			expect(data[defaultKey]['5xxChanged']).toBeUndefined();
			expect(data[key]['4xxChanged']).toBeUndefined();
			expect(data[key]['5xxChanged']).toBeUndefined();

			handleErrors(undefined, data);

			expect(data[defaultKey]['4xxChanged']).toBeUndefined();
			expect(data[defaultKey]['5xxChanged']).toBeUndefined();
			expect(data[key]['4xxChanged']).toBeUndefined();
			expect(data[key]['5xxChanged']).toBeUndefined();
		});

		it('no growth', () => {
			handleErrors(previousData, data);

			expect(data[defaultKey]['4xxChanged']).toBeUndefined();
			expect(data[defaultKey]['5xxChanged']).toBeUndefined();
			expect(data[key]['4xxChanged']).toBeUndefined();
			expect(data[key]['5xxChanged']).toBeUndefined();
		});

		it('4xx growth', () => {
			data[defaultKey]['4xx'] = 123;

			handleErrors(previousData, data);

			// 4xxChanged
			expect(data['4xxChanged']).toBe(true);
			expect(data['5xxChanged']).toBeUndefined();
		});

		it('5xx growth', () => {
			data[defaultKey]['5xx'] = 5;

			handleErrors(previousData, data);

			expect(data['4xxChanged']).toBeUndefined();
			// 5xxChanged
			expect(data['5xxChanged']).toBe(true);
		});

		it('4xx and 5xx growth', () => {
			data[defaultKey]['4xx'] = 34;
			data[defaultKey]['5xx'] = 96;

			handleErrors(previousData, data);

			// 4xxChanged
			expect(data['4xxChanged']).toBe(true);
			// 5xxChanged
			expect(data['5xxChanged']).toBe(true);
		});

		it('custom key', () => {
			data[key]['5xx'] = 5;

			handleErrors(previousData, data, key);

			expect(data['4xxChanged']).toBeUndefined();
			// 5xxChanged
			expect(data['5xxChanged']).toBe(true);
		});
	});

	describe('pickZoneSize()', () => {
		let obj;
		const zoneName = 'zone_1';
		const slabs = new Map([
			[ zoneName, {
				percentSize: 34,
				a: 123,
				b: '456'
			} ]
		]);

		beforeAll(() => {
			jest.spyOn(Map.prototype, 'get').mockClear();
		});

		beforeEach(() => {
			obj = {};

			Map.prototype.get.mockClear();
		});

		afterAll(() => {
			Map.prototype.get.mockRestore();
		});

		it('no slabs', () => {
			pickZoneSize(obj);

			// slabs.get not called
			expect(Map.prototype.get).not.toHaveBeenCalled();
			// obj
			expect(obj).toEqual({
				zoneSize: null
			});
		});

		it('no zone', () => {
			const name = 'unknown_zone';

			pickZoneSize(obj, slabs, name);

			// slabs.get called once
			expect(Map.prototype.get).toHaveBeenCalled();
			// slabs.get 1st arg
			expect(Map.prototype.get.mock.calls[0][0]).toBe(name);
			// obj
			expect(obj).toEqual({
				zoneSize: null
			});
		});

		it('slabs and zone provided', () => {
			pickZoneSize(obj, slabs, zoneName);

			// slabs.get called once
			expect(Map.prototype.get).toHaveBeenCalled();
			// slabs.get 1st arg
			expect(Map.prototype.get.mock.calls[0][0]).toBe(zoneName);
			// obj
			expect(obj).toEqual({
				slab: slabs.get(zoneName),
				zoneSize: 34
			});
		});
	});

	it('countResolverResponses()', () => {
		let result = countResolverResponses({});

		// allResponses [responses = {}]
		expect(result.allResponses).toBe(0);
		// errResponses [responses = {}]
		expect(result.errResponses).toBe(0);

		result = countResolverResponses({
			timedout: 4,
			noerror: 338,
			response_type_1: 42,
			response_type_2: 0,
			response_type_3: '73',
			response_type_4: 2,
			response_type_5: null,
			response_type_6: 'just a string'
		});

		// allResponses
		expect(result.allResponses).toBe(382);
		// errResponses
		expect(result.errResponses).toBe(48);
	});
});
