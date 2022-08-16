/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
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
		expect(getYMax(data, metrics, []), 'no disabled').to.be.equal(35);
		expect(getYMax(data, metrics, ['b']), '"b" disabled').to.be.equal(12);
	});
});
