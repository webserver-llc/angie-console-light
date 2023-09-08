/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import calculate from '../connections.js';
import utils from '../utils.js';

describe('Calculators – Connections', () => {
	it('calculate()', () => {
		const ts = 1596706703143;
		const td = 1000;
		const connections = {
			active: 10,
			idle: 2,
			accepted: 14
		};
		const previous = {
			accepted: 10,
			lastUpdate: ts - td
		};
		const expectedSpeed = 'test_speed';

		const spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation(() => expectedSpeed);
		const spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);

		let result = calculate(connections);

		// connections.current
		expect(result.current).toBe(connections.active + connections.idle);
		// connections.accepted_s
		expect(result.accepted_s).toBe(expectedSpeed);
		// calculateSpeed called once
    		expect(spyUtilsCalculateSpeed).toHaveBeenCalled();
		expect(spyUtilsCalculateSpeed.mock.calls[0][0]).toBeNull();
		// calculateSpeed 2nd arg
		expect(spyUtilsCalculateSpeed.mock.calls[0][1]).toBe(connections.accepted);
		// calculateSpeed 3rd arg
		expect(spyUtilsCalculateSpeed.mock.calls[0][2]).toBe(ts);
		// Date.now called once
		expect(spyDateNow).toHaveBeenCalled();
		// result
		expect(result).toEqual(connections);

		result = calculate(connections, previous);

		// calculateSpeed called twice
		expect(spyUtilsCalculateSpeed).toHaveBeenCalledTimes(2);
		// calculateSpeed 1st arg
		expect(spyUtilsCalculateSpeed.mock.calls[1][0]).toBe(previous.accepted);
		// calculateSpeed 2nd arg
		expect(spyUtilsCalculateSpeed.mock.calls[1][1]).toBe(connections.accepted);
		// calculateSpeed 3rd arg
		expect(spyUtilsCalculateSpeed.mock.calls[1][2]).toBe(ts - previous.lastUpdate);
		// Date.now called twice
		expect(spyDateNow).toHaveBeenCalled();
		// result
		expect(result).toEqual(connections);
	});
});
