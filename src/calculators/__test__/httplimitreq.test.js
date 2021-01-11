/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy } from 'sinon';
import calculate, { buildCalculator } from '../httplimitconn.js';
import * as factories from '../factories.js';

describe('Calculators – HttpLimitReq', () => {
	it('buildCalculator()', () => {
		spy(factories, 'limitConnReqFactory');

		const result = buildCalculator();

		expect(factories.limitConnReqFactory.calledOnce, 'limitConnReqFactory called once').to.be.true;
		expect(factories.limitConnReqFactory.args[0][0], 'limitConnReqFactory 1st arg').to.be.deep.equal({
			history: {},
			prevUpdatingPeriod: null
		});

		factories.limitConnReqFactory.restore();
	});

	it('calculate()', () => {
		const result = buildCalculator();

		expect(calculate.name, 'calculate.name').to.be.equal(result.name);
	});
});
