/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import {
	getYMax
} from '../utils.js';

describe('Chart utils', () => {
	const data = [{
		obj: {
			a: 12,
			b: 3,
			c: 0
		}
	}, {
		obj: {
			a: 0,
			b: 35,
			c: 0
		}
	}, {
		obj: {
			a: 1,
			b: 14,
			c: 3
		}
	}];
	const metrics = ['a', 'b', 'c', 'd'];

	it('getYMax()', () => {
		// no disabled
		expect(getYMax(data, metrics, [])).toBe(35);
		// "b" disabled
		expect(getYMax(data, metrics, ['b'])).toBe(12);
	});
});
