/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import calculate from '../requests.js';
import utils from '../utils.js';

describe('Calculators – Requests', () => {
	describe('calculate()', () => {
		let spyDateNow; let
			spyUtilsCalculateSpeed;
		const ts = 1597004040005;
		const requests = {
			a: 123,
			b: '456',
			total: 930
		};
		const previous = {
			total: 1000,
			lastUpdate: ts - 5000
		};
		let reqs = 100500;

		beforeAll(() => {
			spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation(() => ++reqs);
		});

		beforeEach(() => {
			spyUtilsCalculateSpeed.mockClear();
			spyDateNow.mockClear();
		});

		afterAll(() => {
			Date.now.mockRestore();
			utils.calculateSpeed.mockRestore();
		});

		it('first call', () => {
			// return
			expect(calculate(requests)).toEqual(requests);
			// calculateSpeed called once
			expect(spyUtilsCalculateSpeed).toHaveBeenCalled();
			// calculateSpeed 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][0]).toBe(0);
			// calculateSpeed 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][1]).toBe(requests.total);
			// calculateSpeed 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][2]).toBe(ts);
		});

		it('with previous', () => {
			// return
			expect(calculate(requests, previous)).toEqual(requests);
			// calculateSpeed called once
			expect(spyUtilsCalculateSpeed).toHaveBeenCalled();
			// calculateSpeed 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][0]).toBe(previous.total);
			// calculateSpeed 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][1]).toBe(requests.total);
			// calculateSpeed 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][2]).toBe(ts - previous.lastUpdate);
		});
	});
});
