/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import calculate, { handleZones } from '../sharedzones.js';
import utils from '../utils.js';

describe('Calculators – SharedZones', () => {
	it('handleZones', () => {
		const zone = {
			pages: {
				used: 230,
				free: 770
			}
		};
		const result = handleZones(zone);

		// zone.pages.total
		expect(result.pages.total).toBe(1000);
		// zone.percentSize
		expect(result.percentSize).toBe(23);
		// returned zone
		expect(result).toEqual(zone);
	});

	describe('calculate', () => {
		const expectedResult = 'Result of createMapFromObject';
		let STORE;

		beforeAll(() => {
			jest.spyOn(utils, 'createMapFromObject').mockClear().mockImplementation(() => expectedResult);
		});

		beforeEach(() => {
			STORE = {
				__STATUSES: {
					shared_zones: {}
				}
			};
		});

		afterEach(() => {
			utils.createMapFromObject.mockClear();
		});

		afterAll(() => {
			utils.createMapFromObject.mockRestore();
		});

		it('zones wasn\'t provided', () => {
			const result = calculate(null, null, STORE);

			// __STATUSES.shared_zones.ready
			expect(STORE.__STATUSES.shared_zones.ready).toBe(false);
			expect(result).toBeNull();
			// createMapFromObject not called
			expect(utils.createMapFromObject).not.toHaveBeenCalled();
		});

		it('empty zones', () => {
			const result = calculate({}, null, STORE);

			// __STATUSES.shared_zones.ready
			expect(STORE.__STATUSES.shared_zones.ready).toBe(false);
			expect(result).toBeNull();
			// createMapFromObject not called
			expect(utils.createMapFromObject).not.toHaveBeenCalled();
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

			// __STATUSES.shared_zones.ready
			expect(STORE.__STATUSES.shared_zones.ready).toBe(true);
			// createMapFromObject called once
			expect(utils.createMapFromObject).toHaveBeenCalled();
			// createMapFromObject 1st arg
			expect(utils.createMapFromObject.mock.calls[0][0]).toEqual(zones);
			// createMapFromObject 2nd arg
			expect(utils.createMapFromObject.mock.calls[0][1].name).toBe('handleZones');
			// return
			expect(result).toBe(expectedResult);
		});
	});
});
