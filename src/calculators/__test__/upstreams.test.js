/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import calculate from '../upstreams.js';

describe('Calculators – Upstreams', () => {
	it('calculate()', () => {
		// name
		expect(calculate.name).toBe('bound upstreamsCalculator');
	});
});
