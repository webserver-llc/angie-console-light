/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy } from 'sinon';
import calculate, { buildCalculator } from '../httplimitconn.js';
import * as utils from '../utils.js';

describe('HttpLimitConn calculator', () => {
	it('buildCalculator()', () => {
		spy(utils, 'limitConnReqFactory');

		const result = buildCalculator();

		expect(utils.limitConnReqFactory.calledOnce, 'limitConnReqFactory called once').to.be.true;
		expect(utils.limitConnReqFactory.args[0][0], 'limitConnReqFactory 1st arg').to.be.deep.equal({
			history: {},
			prevUpdatingPeriod: null
		});

		utils.limitConnReqFactory.restore();
	});

	it('calculate()', () => {
		const result = buildCalculator();

		expect(calculate.name, 'calculate.name').to.be.equal(result.name);
	});
});
