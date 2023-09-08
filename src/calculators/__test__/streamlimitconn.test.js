/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import calculate, { buildCalculator } from '../httplimitconn.js';
import factories from '../factories.js';

describe('Calculators – StreamLimitConn', () => {
	it('buildCalculator()', () => {
		jest.spyOn(factories, 'limitConnReqFactory').mockClear();

		const result = buildCalculator();

		// limitConnReqFactory called once
		expect(factories.limitConnReqFactory).toHaveBeenCalled();
		// limitConnReqFactory 1st arg
		expect(factories.limitConnReqFactory.mock.calls[0][0]).toEqual({
			history: {},
			prevUpdatingPeriod: null
		});
	});

	it('calculate()', () => {
		const result = buildCalculator();

		// calculate.name
		expect(calculate.name).toBe(result.name);
	});
});
