/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { stub } from 'sinon';
import {
	formatUptime,
	formatReadableBytes,
	formatMs,
	formatDate,
	getHTTPCodesArray,
	getSSLHandhsakesFailures,
} from '../utils.js';

describe('Utils', () => {
	it('formatUptime()', () => {
		expect(formatUptime()).to.be.equal('');
		expect(formatUptime(999)).to.be.equal('999ms');
		expect(formatUptime(59999)).to.be.equal('59.99s');
		expect(formatUptime(68342)).to.be.equal('1m');
		expect(formatUptime(120 * 1000)).to.be.equal('2m');
		expect(formatUptime(1.5 * 3600 * 1000)).to.be.equal('1h 30m');
		expect(formatUptime(1.32 * 24 * 3600 * 1000)).to.be.equal('1d 7h 40m');
		expect(formatUptime(1.32 * 24 * 3600 * 1000, true)).to.be.equal('1d 7h ');
	});

	it('formatReadableBytes()', () => {
		expect(formatReadableBytes()).to.be.equal('0');
		expect(formatReadableBytes(null)).to.be.equal('0');
		expect(formatReadableBytes(NaN)).to.be.equal('0');
		expect(formatReadableBytes(Infinity)).to.be.equal('0');
		expect(formatReadableBytes('qwe')).to.be.equal('0');
		expect(formatReadableBytes(0)).to.be.equal('0');

		expect(formatReadableBytes(7)).to.be.equal('7.00 B');
		expect(formatReadableBytes(16)).to.be.equal('16.0 B');
		expect(formatReadableBytes(406)).to.be.equal('406 B');
		expect(formatReadableBytes(1001)).to.be.equal('1001 B');

		expect(formatReadableBytes(534591)).to.be.equal('522 KiB');
		expect(formatReadableBytes(534591, 'B')).to.be.equal('534591 B');

		expect(formatReadableBytes(9524000)).to.be.equal('9.08 MiB');
		expect(formatReadableBytes(9524000, 'KiB')).to.be.equal('9301 KiB');
		expect(formatReadableBytes(9524000, 'B')).to.be.equal('9524000 B');

		expect(formatReadableBytes(2548575999)).to.be.equal('2.37 GiB');
		expect(formatReadableBytes(2548575999, 'MiB')).to.be.equal('2431 MiB');
		expect(formatReadableBytes(2548575999, 'KiB')).to.be.equal('2488844 KiB');
		expect(formatReadableBytes(2548575999, 'B')).to.be.equal('2548575999 B');

		expect(formatReadableBytes(5799511627775)).to.be.equal('5.27 TiB');
		expect(formatReadableBytes(5799511627775, 'GiB')).to.be.equal('5401 GiB');
		expect(formatReadableBytes(5799511627775, 'MiB')).to.be.equal('5530845 MiB');
		expect(formatReadableBytes(5799511627775, 'KiB')).to.be.equal('5663585574 KiB');
		expect(formatReadableBytes(5799511627775, 'B')).to.be.equal('5799511627775 B');

		const customUnits = {
			0: 'b',
			1: 'Kb',
			2: 'Mb',
			3: 'Gb',
			4: 'Tb'
		};

		expect(formatReadableBytes(5799511627775, null, customUnits)).to.be.equal('5.27 Tb');
		expect(formatReadableBytes(5799511627775, 'Gb', customUnits)).to.be.equal('5401 Gb');
		expect(formatReadableBytes(5799511627775, 'Mb', customUnits)).to.be.equal('5530845 Mb');
		expect(formatReadableBytes(5799511627775, 'Kb', customUnits)).to.be.equal('5663585574 Kb');
		expect(formatReadableBytes(5799511627775, 'b', customUnits)).to.be.equal('5799511627775 b');
	});

	it('formatMs()', () => {
		expect(formatMs()).to.be.equal('–');
		expect(formatMs(312)).to.be.equal('312ms');
	});

	it('formatDate()', () => {
		expect(formatDate()).to.be.equal('');

		const ts = 1596096046972;
		const date = new Date(ts);
		const year = date.getFullYear();
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();
		const tz = date.toTimeString().split(' ')[1];

		expect(formatDate(ts)).to.be.equal([
			`${ year }-${ month < 10 ? '0' : '' }${ month }-${ day < 10 ? '0' : '' }${ day }`,
			`${ hours < 10 ? '0' : '' }${ hours }:${ minutes < 10 ? '0' : '' }${ minutes }:${ seconds < 10 ? '0' : '' }${ seconds }`,
			tz
		].join(' '));
	});

	it('getHTTPCodesArray()', () => {
		[{
			testCase: "No codes",
			args: [null, '2'],
			result: [],
		}, {
			testCase: "Empty codes",
			args: [{}, '2'],
			result: [],
		}, {
			testCase: "Non empty codes",
			args: [{
				'200': 1000,
				'201': 3,
				'301': 1,
				'404': 5,
				'500': 25,
				'202': 4,
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
			expect(getHTTPCodesArray(...args), testCase).to.deep.equal(result)
		});
	});

	it('getSSLHandhsakesFailures()', () => {
		expect(getSSLHandhsakesFailures(), 'no arguments').to.be.deep.equal([]);
		expect(getSSLHandhsakesFailures({}), 'empty object as an argument').to.be.deep.equal([]);

		let ssl = {
      no_common_protocol: 2,
      no_common_cipher: 4,
      handshake_timeout: 79,
      peer_rejected_cert: 3,
      verify_failures: {},
		};

		getSSLHandhsakesFailures(ssl).forEach((item, i) => {
			expect(item, `[${ i }] ${ item.id }, value prop`).to.have.property('value', ssl[item.id]);
			expect('id' in item, `[${ i }] ${ item.id }, id exists`).to.be.true;
			expect('label' in item, `[${ i }] ${ item.id }, label exists`).to.be.true;
		});

		ssl = {
      verify_failures: {
        expired_cert: 90,
        revoked_cert: 6,
        hostname_mismatch: 10,
        other: 3,
      },
		};

		getSSLHandhsakesFailures(ssl).forEach((item, i) => {
			expect(item, `[${ i }] verify_failures.${ item.id }, value prop`).to.have.property(
				'value',
				ssl.verify_failures[item.id]
			);
			expect('id' in item, `[${ i }] ${ item.id }, id exists`).to.be.true;
			expect('label' in item, `[${ i }] ${ item.id }, label exists`).to.be.true;
		});
	});
});
