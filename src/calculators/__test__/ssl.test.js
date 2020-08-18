/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { stub } from 'sinon';
import calculate from '../ssl.js';
import * as utils from '../utils.js';

describe('Calculators – SSL', () => {
	describe('calculate()', () => {
		const ts = 1597146438703;
		const period = 1000;
		const previous = {
			handshakes: 133,
			handshakes_failed: 3,
			session_reuses: 5,
			lastUpdate: ts - period
		};
		let ssl;

		before(() => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
		});

		beforeEach(() => {
			Date.now.resetHistory();
			utils.calculateSpeed.resetHistory();

			ssl = {
				handshakes: 160,
				handshakes_failed: 8,
				session_reuses: 5
			};
		});

		after(() => {
			Date.now.restore();
			utils.calculateSpeed.restore();
		});

		it('no previous', () => {
			const result = calculate(ssl);

			expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
			expect(utils.calculateSpeed.calledThrice, 'calculateSpeed called thrice').to.be.true;

			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st call 1st arg').to.be.a('null');
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 1st call 2nd arg').to.be.equal(ssl.handshakes);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 1st call 3rd arg').to.be.equal(ts);
			expect(result.handshakes_s, 'ssl.handshakes_s').to.be.equal(ssl.handshakes);

			expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 2nd call 1st arg').to.be.a('null');
			expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd call 2nd arg').to.be.equal(ssl.handshakes_failed);
			expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 2nd call 3rd arg').to.be.equal(ts);
			expect(result.handshakes_failed_s, 'ssl.handshakes_failed_s').to.be.equal(ssl.handshakes_failed);

			expect(utils.calculateSpeed.args[2][0], 'calculateSpeed 3rd call 1st arg').to.be.a('null');
			expect(utils.calculateSpeed.args[2][1], 'calculateSpeed 3rd call 2nd arg').to.be.equal(ssl.session_reuses);
			expect(utils.calculateSpeed.args[2][2], 'calculateSpeed 3rd call 3rd arg').to.be.equal(ts);
			expect(result.session_reuses_s, 'ssl.session_reuses_s').to.be.equal(ssl.session_reuses);

			expect(result, 'returned ssl').to.be.deep.equal(ssl);
		});

		it('with previous', () => {
			const result = calculate(ssl, previous);

			expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
			expect(utils.calculateSpeed.calledThrice, 'calculateSpeed called thrice').to.be.true;

			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st call 1st arg').to.be.equal(previous.handshakes);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 1st call 2nd arg').to.be.equal(ssl.handshakes);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 1st call 3rd arg').to.be.equal(period);
			expect(result.handshakes_s, 'ssl.handshakes_s').to.be.equal(ssl.handshakes);

			expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 2nd call 1st arg')
				.to.be.equal(previous.handshakes_failed);
			expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd call 2nd arg').to.be.equal(ssl.handshakes_failed);
			expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 2nd call 3rd arg').to.be.equal(period);
			expect(result.handshakes_failed_s, 'ssl.handshakes_failed_s').to.be.equal(ssl.handshakes_failed);

			expect(utils.calculateSpeed.args[2][0], 'calculateSpeed 3rd call 1st arg')
				.to.be.equal(previous.session_reuses);
			expect(utils.calculateSpeed.args[2][1], 'calculateSpeed 3rd call 2nd arg').to.be.equal(ssl.session_reuses);
			expect(utils.calculateSpeed.args[2][2], 'calculateSpeed 3rd call 3rd arg').to.be.equal(period);
			expect(result.session_reuses_s, 'ssl.session_reuses_s').to.be.equal(ssl.session_reuses);

			expect(result, 'returned ssl').to.be.deep.equal(ssl);
		});
	});
});
