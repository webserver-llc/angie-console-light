/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { stub } from 'sinon';
import calculate from '../connections.js';
import * as utils from '../utils.js';

describe('Connections calculator', () => {
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

		stub(utils, 'calculateSpeed').callsFake(() => expectedSpeed);
		stub(Date, 'now').callsFake(() => ts);

		let result = calculate(connections);

		expect(result.current, 'connections.current').to.be.equal(connections.active + connections.idle);
		expect(result.accepted_s, 'connections.accepted_s').to.be.equal(expectedSpeed);
		expect(utils.calculateSpeed.calledOnce, 'calculateSpeed called once').to.be.true;
		expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st arg').to.be.a('null');
		expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 2nd arg').to.be.equal(connections.accepted);
		expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 3rd arg').to.be.equal(ts);
		expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
		expect(result, 'result').to.be.deep.equal(connections);

		result = calculate(connections, previous);

		expect(utils.calculateSpeed.calledTwice, 'calculateSpeed called twice').to.be.true;
		expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 1st arg').to.be.equal(previous.accepted);
		expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd arg').to.be.equal(connections.accepted);
		expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 3rd arg').to.be.equal(ts - previous.lastUpdate);
		expect(Date.now.calledTwice, 'Date.now called twice').to.be.true;
		expect(result, 'result').to.be.deep.equal(connections);

		utils.calculateSpeed.restore();
		Date.now.restore();
	});
});
