/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { stub } from 'sinon';
import calculate, { handleZones } from '../sharedzones.js';
import * as utils from '../utils.js';

describe('Calculators – SharedZones', () => {
	it('handleZones', () => {
		const zone = {
			pages: {
				used: 230,
				free: 770
			}
		};
		const result = handleZones(zone);

		expect(result.pages.total, 'zone.pages.total').to.be.equal(1000);
		expect(result.percentSize, 'zone.percentSize').to.be.equal(23);
		expect(result, 'returned zone').to.be.deep.equal(zone);
	});

	describe('calculate', () => {
		const expectedResult = 'Result of createMapFromObject';
		let STORE;

		before(() => {
			stub(utils, 'createMapFromObject').callsFake(() => expectedResult);
		});

		beforeEach(() => {
			STORE = {
				__STATUSES: {
					shared_zones: {}
				}
			};
		});

		afterEach(() => {
			utils.createMapFromObject.resetHistory();
		});

		after(() => {
			utils.createMapFromObject.restore();
		});

		it('zones wasn\'t provided', () => {
			const result = calculate(null, null, STORE);

			expect(STORE.__STATUSES.shared_zones.ready, '__STATUSES.shared_zones.ready').to.be.false;
			expect(result, 'return').to.be.a('null');
			expect(utils.createMapFromObject.notCalled, 'createMapFromObject not called').to.be.true;
		});

		it('empty zones', () => {
			const result = calculate({}, null, STORE);

			expect(STORE.__STATUSES.shared_zones.ready, '__STATUSES.shared_zones.ready').to.be.false;
			expect(result, 'return').to.be.a('null');
			expect(utils.createMapFromObject.notCalled, 'createMapFromObject not called').to.be.true;
		});

		it('filled zones', () => {
			const zones = {
				zone_1: {
					pages: {
						used: 1,
						free: 22
					}
				}
			};
			const result = calculate(zones, null, STORE);

			expect(STORE.__STATUSES.shared_zones.ready, '__STATUSES.shared_zones.ready').to.be.true;
			expect(utils.createMapFromObject.calledOnce, 'createMapFromObject called once').to.be.true;
			expect(utils.createMapFromObject.args[0][0], 'createMapFromObject 1st arg').to.be.deep.equal(zones);
			expect(utils.createMapFromObject.args[0][1].name, 'createMapFromObject 2nd arg').to.be.equal('handleZones');
			expect(result, 'return').to.be.equal(expectedResult);
		});
	});
});
