/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import {
	formatUptime,
	formatReadableBytes,
	formatMs,
	formatDate,
	formatLastCheckDate,
	getHTTPCodesArray,
	getSSLHandhsakesFailures,
	getSSLVeryfiedFailures,
	isEmptyObj,
} from '../utils.js';

describe('Utils', () => {
	it('formatUptime()', () => {
		expect(formatUptime()).toBe('');
		expect(formatUptime(999)).toBe('999ms');
		expect(formatUptime(59999)).toBe('59.99s');
		expect(formatUptime(68342)).toBe('1m');
		expect(formatUptime(120 * 1000)).toBe('2m');
		expect(formatUptime(1.5 * 3600 * 1000)).toBe('1h 30m');
		expect(formatUptime(1.32 * 24 * 3600 * 1000)).toBe('1d 7h 40m');
		expect(formatUptime(1.32 * 24 * 3600 * 1000, true)).toBe('1d 7h ');
	});

	it('formatReadableBytes()', () => {
		expect(formatReadableBytes()).toBe('0');
		expect(formatReadableBytes(null)).toBe('0');
		expect(formatReadableBytes(NaN)).toBe('0');
		expect(formatReadableBytes(Infinity)).toBe('0');
		expect(formatReadableBytes('qwe')).toBe('0');
		expect(formatReadableBytes(0)).toBe('0');

		expect(formatReadableBytes(7)).toBe('7.00 B');
		expect(formatReadableBytes(16)).toBe('16.0 B');
		expect(formatReadableBytes(406)).toBe('406 B');
		expect(formatReadableBytes(1001)).toBe('1001 B');

		expect(formatReadableBytes(534591)).toBe('522 KiB');
		expect(formatReadableBytes(534591, 'B')).toBe('534591 B');

		expect(formatReadableBytes(9524000)).toBe('9.08 MiB');
		expect(formatReadableBytes(9524000, 'KiB')).toBe('9301 KiB');
		expect(formatReadableBytes(9524000, 'B')).toBe('9524000 B');

		expect(formatReadableBytes(2548575999)).toBe('2.37 GiB');
		expect(formatReadableBytes(2548575999, 'MiB')).toBe('2431 MiB');
		expect(formatReadableBytes(2548575999, 'KiB')).toBe('2488844 KiB');
		expect(formatReadableBytes(2548575999, 'B')).toBe('2548575999 B');

		expect(formatReadableBytes(5799511627775)).toBe('5.27 TiB');
		expect(formatReadableBytes(5799511627775, 'GiB')).toBe('5401 GiB');
		expect(formatReadableBytes(5799511627775, 'MiB')).toBe('5530845 MiB');
		expect(formatReadableBytes(5799511627775, 'KiB')).toBe('5663585574 KiB');
		expect(formatReadableBytes(5799511627775, 'B')).toBe('5799511627775 B');

		const customUnits = {
			0: 'b',
			1: 'Kb',
			2: 'Mb',
			3: 'Gb',
			4: 'Tb'
		};

		expect(formatReadableBytes(5799511627775, null, customUnits)).toBe('5.27 Tb');
		expect(formatReadableBytes(5799511627775, 'Gb', customUnits)).toBe('5401 Gb');
		expect(formatReadableBytes(5799511627775, 'Mb', customUnits)).toBe('5530845 Mb');
		expect(formatReadableBytes(5799511627775, 'Kb', customUnits)).toBe('5663585574 Kb');
		expect(formatReadableBytes(5799511627775, 'b', customUnits)).toBe('5799511627775 b');
	});

	it('formatMs()', () => {
		expect(formatMs()).toBe('–');
		expect(formatMs(312)).toBe('312ms');
	});

	it('formatDate()', () => {
		expect(formatDate()).toBe('');

		const ts = 1596096046972;
		const date = new Date(ts);
		const year = date.getFullYear();
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();
		const tz = date.toTimeString().split(' ')[1];

		expect(formatDate(ts)).toBe([
			`${ year }-${ month < 10 ? '0' : '' }${ month }-${ day < 10 ? '0' : '' }${ day }`,
			`${ hours < 10 ? '0' : '' }${ hours }:${ minutes < 10 ? '0' : '' }${ minutes }:${ seconds < 10 ? '0' : '' }${ seconds }`,
			tz
		].join(' '));
	});

	it('getHTTPCodesArray()', () => {
		[{
			testCase: 'No codes',
			args: [null, '2'],
			result: [],
		}, {
			testCase: 'Empty codes',
			args: [{}, '2'],
			result: [],
		}, {
			testCase: 'Non empty codes',
			args: [{
				200: 1000,
				201: 3,
				301: 1,
				404: 5,
				500: 25,
				202: 4,
			}, '2'],
			result: [{
				code: '200',
				value: 1000,
			}, {
				code: '201',
				value: 3,
			}, {
				code: '202',
				value: 4,
			}],
		}].forEach(({ testCase, args, result }) => {
			// testCase
			expect(getHTTPCodesArray(...args)).toEqual(result);
		});
	});

	it('getSSLHandhsakesFailures()', () => {
		// no arguments
		expect(getSSLHandhsakesFailures()).toEqual([]);
		// empty object as an argument
		expect(getSSLHandhsakesFailures({})).toEqual([]);

		const ssl = {
			no_common_protocol: 2,
			no_common_cipher: 4,
			handshake_timeout: 79,
			peer_rejected_cert: 3,
		};

		getSSLHandhsakesFailures(ssl).forEach((item, i) => {
			// [${ i }] ${ item.id }, value prop
			expect(item).toHaveProperty('value', ssl[item.id]);
			// [${ i }] ${ item.id }, id exists
			expect('id' in item).toBe(true);
			// [${ i }] ${ item.id }, label exists
			expect('label' in item).toBe(true);
		});
	});

	it('getSSLVeryfiedFailures()', () => {
		// no arguments
		expect(getSSLVeryfiedFailures()).toEqual([0, []]);
		// empty object as an argument
		expect(getSSLVeryfiedFailures({})).toEqual([0, []]);
		// empty "verify_failures"
		expect(getSSLVeryfiedFailures({
			verify_failures: {}
		})).toEqual([0, []]);

		const ssl = {
			verify_failures: {
				no_cert: 123,
				expired_cert: 90,
				revoked_cert: 6,
				hostname_mismatch: 10,
				other: 3,
			},
		};
		const [total, items] = getSSLVeryfiedFailures(ssl);

		// total value
		expect(total).toBe(232);

		items.forEach((item, i) => {
			// [${ i }] ${ item.id }, value prop
			expect(item).toHaveProperty('value', ssl.verify_failures[item.id]);
			// [${ i }] ${ item.id }, id exists
			expect('id' in item).toBe(true);
			// [${ i }] ${ item.id }, label exists
			expect('label' in item).toBe(true);
		});
	});

	it('isEmptyObj()', () => {
		// without argument
		expect(() => isEmptyObj()).toThrow(/set/);
		// with undefined argument
		expect(() => isEmptyObj(undefined)).toThrow(/set/);
		// with null argument
		expect(() => isEmptyObj(null)).toThrow('available');
		// empty object
		expect(isEmptyObj({})).toBe(true);
		// empty object
		expect(isEmptyObj({ a: 1 })).toBe(false);
	});

	it('formatLastCheckDate()', () => {
		const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
		jest.spyOn(Date, 'now').mockClear().mockImplementation(() => 1692346714363);
		// invalid timestamp
		expect(formatLastCheckDate('2023-08-18T08:18:45Z')).toBe('-');
		// ms
		expect(formatLastCheckDate('2023-08-18T08:18:34Z')).toBe('363ms');
		// s
		expect(formatLastCheckDate('2023-08-18T08:18:24Z')).toBe('10.36s');
		// m
		expect(formatLastCheckDate('2023-08-18T08:17:00Z')).toBe('1m');
		// h
		expect(formatLastCheckDate('2023-08-18T07:17:00Z')).toBe('1h 1m');
		// h
		expect(formatLastCheckDate('2023-08-16T07:17:00Z')).toBe('2d 1h 1m');
		consoleWarnMock.mockRestore();
	});
});
