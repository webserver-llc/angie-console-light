/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { stub } from 'sinon';
import calculate from '../requests.js';
import utils from '../utils.js';

describe('Calculators – Requests', () => {
	describe('calculate()', () => {
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

		before(() => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake(() => ++reqs);
		});

		beforeEach(() => {
			utils.calculateSpeed.resetHistory();
			Date.now.resetHistory();
		});

		after(() => {
			Date.now.restore();
			utils.calculateSpeed.restore();
		});

		it('first call', () => {
			expect(calculate(requests), 'return').to.be.deep.equal(requests);
			expect(utils.calculateSpeed.calledOnce, 'calculateSpeed called once').to.be.true;
			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st arg').to.be.equal(0);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 2nd arg').to.be.equal(requests.total);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 3rd arg').to.be.equal(ts);
		});

		it('with previous', () => {
			expect(calculate(requests, previous), 'return').to.be.deep.equal(requests);
			expect(utils.calculateSpeed.calledOnce, 'calculateSpeed called once').to.be.true;
			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st arg').to.be.equal(previous.total);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 2nd arg').to.be.equal(requests.total);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 3rd arg').to.be.equal(ts - previous.lastUpdate);
		});
	});
});
