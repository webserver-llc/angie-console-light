/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
import {
	is4xxThresholdReached,
	calculateSpeed,
	calculateTraffic,
	createMapFromObject,
	handleErrors,
	pickZoneSize,
	countResolverResponses
} from '../utils.js';
import appsettings from '../../appsettings';

describe('Calculators – utils', () => {
	it('is4xxThresholdReached()', () => {
		stub(appsettings, 'getSetting').callsFake(() => 50);

		expect(
			is4xxThresholdReached({ responses: { '4xx': 49 }, requests: { total: 100 } })
		).to.be.false;
		expect(appsettings.getSetting.calledOnce, 'getSetting called once').to.be.true;
		expect(appsettings.getSetting.args[0][0], 'getSetting 1st arg').to.be.equal('warnings4xxThresholdPercent');
		expect(
			is4xxThresholdReached({ responses: { '4xx': 50 }, requests: { total: 100 } })
		).to.be.false;
		expect(appsettings.getSetting.calledTwice, 'getSetting called twice').to.be.true;
		expect(appsettings.getSetting.args[1][0], 'getSetting 1st arg').to.be.equal('warnings4xxThresholdPercent');
		expect(
			is4xxThresholdReached({ responses: { '4xx': 51 }, requests: { total: 100 } })
		).to.be.true;
		expect(appsettings.getSetting.calledThrice, 'getSetting called thrice').to.be.true;
		expect(appsettings.getSetting.args[2][0], 'getSetting 1st arg').to.be.equal('warnings4xxThresholdPercent');

		appsettings.getSetting.restore();
	});

	it('calculateSpeed()', () => {
		spy(Math, 'floor');

		expect(calculateSpeed(), 'previous == undefined, now == undefined').to.be.equal('n/a');
		expect(calculateSpeed(null), 'previous == null, now == undefined').to.be.equal('n/a');
		expect(calculateSpeed(undefined, null), 'previous == undefined, now == null').to.be.equal('n/a');
		expect(calculateSpeed(null, null), 'previous == null, now == null').to.be.equal('n/a');
		expect(calculateSpeed('123', '3'), 'previous and now are Strings').to.be.equal('n/a');
		expect(calculateSpeed('123', 3), 'previous is a String').to.be.equal('n/a');
		expect(calculateSpeed(43, '34'), 'now is a String').to.be.equal('n/a');
		expect(calculateSpeed(32, 1), 'previous > now').to.be.equal(0);
		expect(calculateSpeed(3, 50, 2000), 'previous < now').to.be.equal(23);
		expect(Math.floor.calledOnce, 'Math.floor called once').to.be.true;
		expect(Math.floor.args[0][0], 'Math.floor 1st arg').to.be.equal(23.5);

		Math.floor.restore();
	});

	it('calculateTraffic', () => {
		const obj = { traffic: {
			in: 0,
			out: 0
		} };

		calculateTraffic(obj, {});

		expect(obj.traffic.in, 'traffic.in [zone = {}]').to.be.equal(0);
		expect(obj.traffic.out, 'traffic.out [zone = {}]').to.be.equal(0);

		calculateTraffic(obj, { rcvd_s: null, sent_s: null });

		expect(obj.traffic.in, 'traffic.in [zone = { rcvd_s: null, sent_s: null }]').to.be.equal(0);
		expect(obj.traffic.out, 'traffic.out [zone = { rcvd_s: null, sent_s: null }]').to.be.equal(0);

		calculateTraffic(obj, { rcvd_s: '123', sent_s: 'null' });

		expect(obj.traffic.in, 'traffic.in [zone = { rcvd_s: "123", sent_s: "null" }]').to.be.equal(0);
		expect(obj.traffic.out, 'traffic.out [zone = { rcvd_s: "123", sent_s: "null" }]').to.be.equal(0);

		calculateTraffic(obj, { rcvd_s: {}, sent_s: () => {} });

		expect(obj.traffic.in, 'traffic.in [zone = { rcvd_s: {}, sent_s: () => {} }]').to.be.equal(0);
		expect(obj.traffic.out, 'traffic.out [zone = { rcvd_s: {}, sent_s: () => {} }]').to.be.equal(0);

		calculateTraffic(obj, { rcvd_s: 123, sent_s: 456 });

		expect(obj.traffic.in, 'traffic.in [zone = { rcvd_s: 123, sent_s: 456 }]').to.be.equal(123);
		expect(obj.traffic.out, 'traffic.out [zone = { rcvd_s: 123, sent_s: 456 }]').to.be.equal(456);

		calculateTraffic(obj, { rcvd_s: 7, sent_s: 14 });

		expect(obj.traffic.in, 'traffic.in [zone = { rcvd_s: 7, sent_s: 14 }]').to.be.equal(130);
		expect(obj.traffic.out, 'traffic.out [zone = { rcvd_s: 7, sent_s: 14 }]').to.be.equal(470);
	});

	describe('createMapFromObject()', () => {
		const obj = {
			b: { ba: 123, bb: '456' },
			a: { aa: 789, ab: '012' }
		};
		const cb = spy((_, key, i) => `${ key }_${ i }`);

		before(() => {
			spy(Array.prototype, 'sort');
		});

		beforeEach(() => {
			Array.prototype.sort.resetHistory();
			cb.resetHistory();
		});

		after(() => {
			Array.prototype.sort.restore();
		});

		it('with sort', () => {
			const result = createMapFromObject(obj, cb);

			expect(Array.prototype.sort.calledOnce, 'Array sort called once').to.be.true;
			expect(cb.calledTwice, 'cb called twice').to.be.true;
			expect(cb.args[0][0], 'cd 1st call 1st arg').to.be.deep.equal(obj.a);
			expect(cb.args[0][1], 'cd 1st call 2nd arg').to.be.equal('a');
			expect(cb.args[0][2], 'cd 1st call 3rd arg').to.be.equal(0);
			expect(cb.args[1][0], 'cd 2nd call 1st arg').to.be.deep.equal(obj.b);
			expect(cb.args[1][1], 'cd 2nd call 2nd arg').to.be.equal('b');
			expect(cb.args[1][2], 'cd 2nd call 3rd arg').to.be.equal(1);
			expect(result, 'result instanceOf Map').to.be.an.instanceof(Map);
			expect(result.size, 'result size').to.be.equal(2);
			expect(result.get('b'), 'prop "b" of result').to.be.equal('b_1');
			expect(result.get('a'), 'prop "a" of result').to.be.equal('a_0');
		});

		it('without sort', () => {
			const result = createMapFromObject(obj, cb, false);

			expect(Array.prototype.sort.notCalled, 'Array sort not called').to.be.true;
			expect(cb.calledTwice, 'cb called twice').to.be.true;
			expect(cb.args[0][0], 'cd 1st call 1st arg').to.be.deep.equal(obj.b);
			expect(cb.args[0][1], 'cd 1st call 2nd arg').to.be.equal('b');
			expect(cb.args[0][2], 'cd 1st call 3rd arg').to.be.equal(0);
			expect(cb.args[1][0], 'cd 2nd call 1st arg').to.be.deep.equal(obj.a);
			expect(cb.args[1][1], 'cd 2nd call 2nd arg').to.be.equal('a');
			expect(cb.args[1][2], 'cd 2nd call 3rd arg').to.be.equal(1);
			expect(result, 'result instanceOf Map').to.be.an.instanceof(Map);
			expect(result.size, 'result size').to.be.equal(2);
			expect(result.get('b'), 'prop "b" of result').to.be.equal('b_0');
			expect(result.get('a'), 'prop "a" of result').to.be.equal('a_1');
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

			expect(data[defaultKey]['4xxChanged'], '4xxChanged').to.be.an('undefined');
			expect(data[defaultKey]['5xxChanged'], '5xxChanged').to.be.an('undefined');
			expect(data[key]['4xxChanged'], `4xxChanged ["${ key }" key]`).to.be.an('undefined');
			expect(data[key]['5xxChanged'], `5xxChanged ["${ key }" key]`).to.be.an('undefined');

			handleErrors(undefined, data);

			expect(data[defaultKey]['4xxChanged'], '4xxChanged [previousData = undefined]').to.be.an('undefined');
			expect(data[defaultKey]['5xxChanged'], '5xxChanged [previousData = undefined]').to.be.an('undefined');
			expect(data[key]['4xxChanged'], `4xxChanged ["${ key }" key]`).to.be.an('undefined');
			expect(data[key]['5xxChanged'], `5xxChanged ["${ key }" key]`).to.be.an('undefined');
		});

		it('no growth', () => {
			handleErrors(previousData, data);

			expect(data[defaultKey]['4xxChanged'], '4xxChanged').to.be.an('undefined');
			expect(data[defaultKey]['5xxChanged'], '5xxChanged').to.be.an('undefined');
			expect(data[key]['4xxChanged'], `4xxChanged ["${ key }" key]`).to.be.an('undefined');
			expect(data[key]['5xxChanged'], `5xxChanged ["${ key }" key]`).to.be.an('undefined');
		});

		it('4xx growth', () => {
			data[defaultKey]['4xx'] = 123;

			handleErrors(previousData, data);

			expect(data['4xxChanged'], '4xxChanged').to.be.true;
			expect(data['5xxChanged'], '5xxChanged').to.be.an('undefined');
		});

		it('5xx growth', () => {
			data[defaultKey]['5xx'] = 5;

			handleErrors(previousData, data);

			expect(data['4xxChanged'], '4xxChanged').to.be.an('undefined');
			expect(data['5xxChanged'], '5xxChanged').to.be.true;
		});

		it('4xx and 5xx growth', () => {
			data[defaultKey]['4xx'] = 34;
			data[defaultKey]['5xx'] = 96;

			handleErrors(previousData, data);

			expect(data['4xxChanged'], '4xxChanged').to.be.true;
			expect(data['5xxChanged'], '5xxChanged').to.be.true;
		});

		it('custom key', () => {
			data[key]['5xx'] = 5;

			handleErrors(previousData, data, key);

			expect(data['4xxChanged'], '4xxChanged').to.be.an('undefined');
			expect(data['5xxChanged'], '5xxChanged').to.be.true;
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

		before(() => {
			spy(Map.prototype, 'get');
		});

		beforeEach(() => {
			obj = {};

			Map.prototype.get.resetHistory();
		});

		after(() => {
			Map.prototype.get.restore();
		});

		it('no slabs', () => {
			pickZoneSize(obj);

			expect(Map.prototype.get.notCalled, 'slabs.get not called').to.be.true;
			expect(obj, 'obj').to.be.deep.equal({
				zoneSize: null
			});
		});

		it('no zone', () => {
			const name = 'unknown_zone';

			pickZoneSize(obj, slabs, name);

			expect(Map.prototype.get.calledOnce, 'slabs.get called once').to.be.true;
			expect(Map.prototype.get.args[0][0], 'slabs.get 1st arg').to.be.equal(name);
			expect(obj, 'obj').to.be.deep.equal({
				zoneSize: null
			});
		});

		it('slabs and zone provided', () => {
			pickZoneSize(obj, slabs, zoneName);

			expect(Map.prototype.get.calledOnce, 'slabs.get called once').to.be.true;
			expect(Map.prototype.get.args[0][0], 'slabs.get 1st arg').to.be.equal(zoneName);
			expect(obj, 'obj').to.be.deep.equal({
				slab: slabs.get(zoneName),
				zoneSize: 34
			});
		});
	});

	it('countResolverResponses()', () => {
		let result = countResolverResponses({});

		expect(result.allResponses, 'allResponses [responses = {}]').to.be.equal(0);
		expect(result.errResponses, 'errResponses [responses = {}]').to.be.equal(0);

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

		expect(result.allResponses, 'allResponses').to.be.equal(382);
		expect(result.errResponses, 'errResponses').to.be.equal(48);
	});
});
