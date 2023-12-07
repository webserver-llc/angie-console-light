/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import calculate, { buildCalculator } from '../httplimitconn.js';
import factories from '../factories.js';

describe('Calculators – HttpLimitReq', () => {
	it('buildCalculator()', () => {
		const spyFactoriesLimitConnReqFactory = jest.spyOn(factories, 'limitConnReqFactory').mockClear();

		const result = buildCalculator();

		// limitConnReqFactory called once
		expect(spyFactoriesLimitConnReqFactory).toHaveBeenCalled();
		// limitConnReqFactory 1st arg
		expect(spyFactoriesLimitConnReqFactory.mock.calls[0][0]).toEqual({
			history: {},
			prevUpdatingPeriod: null
		});

		spyFactoriesLimitConnReqFactory.mockRestore();
	});

	it('calculate()', () => {
		const result = buildCalculator();

		// calculate.name
		expect(calculate.name).toBe(result.name);
	});
});
