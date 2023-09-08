/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import calculate, { handleZones } from '../locationzones.js';
import utils from '../utils.js';

describe('Calculators – LocationZones', () => {
	describe('handleZones()', () => {
		const ts = 1596792686803;
		const locationName = 'test_location';
		let STATS; let location; let previousState; let
			STORE;

		beforeEach(() => {
			STATS = {
				total: 0,
				warnings: 0,
				alerts: 0,
				status: 'ok'
			};
			location = {
				data: {
					sent: 135,
					received: 132,
				},
				requests: 24,
				passedToIs4xx: true
			};
			previousState = new Map([
				[locationName, {
					data: {
						sent: 125,
						received: 122,
					},
					requests: 14
				}]
			]);
			previousState.lastUpdate = ts - 1000;
			STORE = {
				__STATUSES: {
					location_zones: {}
				}
			};
		});

		it('no previous state', () => {
			const spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => {});
			const spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			const spyUtilsIs4xxThresholdReached = jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => false);
			const spyUtilsHandleErrors = jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation(() => {});

			const result = handleZones(STATS, null, location);

			// Date.now not called
			expect(spyDateNow).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(spyUtilsCalculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// is4xxThresholdReached called once
			expect(spyUtilsIs4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(spyUtilsIs4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			expect(result.warning).toBeUndefined();
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// handleErrors called once
			expect(spyUtilsHandleErrors).toHaveBeenCalled();
			expect(spyUtilsHandleErrors.mock.calls[0][0]).toBeNull();
			// handleErrors 2nd arg
			expect(spyUtilsHandleErrors.mock.calls[0][1]).toEqual(location);
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// returned location
			expect(result).toEqual(location);
		});

		it('no location in previous state', () => {
			const spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			const spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			const spyUtilsIs4xxThresholdReached = jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => false);
			const spyUtilsHandleErrors = jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation(() => {});

			const result = handleZones(STATS, previousState, location, 'unknown_location');

			// Date.now not called
			expect(spyDateNow).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(spyUtilsCalculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// is4xxThresholdReached called once
			expect(spyUtilsIs4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(spyUtilsIs4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			expect(result.warning).toBeUndefined();
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// handleErrors called once
			expect(spyUtilsHandleErrors).toHaveBeenCalled();
			expect(spyUtilsHandleErrors.mock.calls[0][0]).toBeUndefined();
			// handleErrors 2nd arg
			expect(spyUtilsHandleErrors.mock.calls[0][1]).toEqual(location);
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// returned location
			expect(result).toEqual(location);
		});

		it('with previous state', () => {
			const spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			const spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			const spyUtilsIs4xxThresholdReached = jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => false);
			const spyUtilsHandleErrors = jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation(() => {});

			const previousLocation = previousState.get(locationName);
			const period = ts - previousState.lastUpdate;
			const result = handleZones(STATS, previousState, location, locationName);

			// Date.now called once
			expect(spyDateNow).toHaveBeenCalled();
			expect(spyUtilsCalculateSpeed).toHaveBeenCalledTimes(3);
			// calculateSpeed 1st call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][0]).toBe(previousLocation.data.sent);
			// calculateSpeed 1st call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][1]).toBe(location.data.sent);
			// calculateSpeed 1st call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][2]).toBe(period);
			// location.sent_s
			expect(result.sent_s).toBe(location.data.sent);
			// calculateSpeed 2nd call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][0]).toBe(previousLocation.data.received);
			// calculateSpeed 2nd call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][1]).toBe(location.data.received);
			// calculateSpeed 2nd call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][2]).toBe(period);
			// location.rcvd_s
			expect(result.rcvd_s).toBe(location.data.received);
			// calculateSpeed 3rd call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[2][0]).toBe(previousLocation.requests);
			// calculateSpeed 3rd call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[2][1]).toBe(location.requests);
			// calculateSpeed 3rd call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[2][2]).toBe(period);
			// location.zone_req_s
			expect(result.zone_req_s).toBe(location.requests);
			// is4xxThresholdReached called once
			expect(spyUtilsIs4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(spyUtilsIs4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			expect(result.warning).toBeUndefined();
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// handleErrors called once
			expect(spyUtilsHandleErrors).toHaveBeenCalled();
			// handleErrors 1st arg
			expect(spyUtilsHandleErrors.mock.calls[0][0]).toEqual(previousLocation);
			// handleErrors 2nd arg
			expect(spyUtilsHandleErrors.mock.calls[0][1]).toEqual(location);
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// returned location
			expect(result).toEqual(location);
		});

		it('4xx threshold reached', () => {
			const spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => {});
			const spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			const spyUtilsIs4xxThresholdReached = jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => true);
			const spyUtilsHandleErrors = jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation(() => {});

			const result = handleZones(STATS, null, location);

			// Date.now not called
			expect(spyDateNow).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(spyUtilsCalculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// is4xxThresholdReached called once
			expect(spyUtilsIs4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(spyUtilsIs4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			// location.warning
			expect(result.warning).toBe(true);
			// STATS.status
			expect(STATS.status).toBe('warning');
			// STATS.warnings
			expect(STATS.warnings).toBe(1);
			// handleErrors called once
			expect(spyUtilsHandleErrors).toHaveBeenCalled();
			expect(spyUtilsHandleErrors.mock.calls[0][0]).toBeNull();
			// handleErrors 2nd arg
			expect(spyUtilsHandleErrors.mock.calls[0][1]).toEqual(location);
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// returned location
			expect(result).toEqual(location);
		});

		it('handles 5xx changing', () => {
			const spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => {});
			const spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			const spyUtilsIs4xxThresholdReached = jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => false);
			const spyUtilsHandleErrors = jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation((_, location) => {
				location['5xxChanged'] = true;
			});

			const result = handleZones(STATS, null, location);

			// Date.now not called
			expect(spyDateNow).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(spyUtilsCalculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// is4xxThresholdReached called once
			expect(spyUtilsIs4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(spyUtilsIs4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			expect(result.warning).toBeUndefined();
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// handleErrors called once
			expect(spyUtilsHandleErrors).toHaveBeenCalled();
			expect(spyUtilsHandleErrors.mock.calls[0][0]).toBeNull();
			// handleErrors 2nd arg
			expect(spyUtilsHandleErrors.mock.calls[0][1]).toEqual(location);
			// STATS.status
			expect(STATS.status).toBe('danger');
			// STATS.alerts
			expect(STATS.alerts).toBe(1);
			// returned location
			expect(result).toEqual(location);
		});

		it('handles 5xx changing (with 4xx threshold reached)', () => {
			const spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => {});
			const spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			const spyUtilsIs4xxThresholdReached = jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => true);
			const spyUtilsHandleErrors = jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation((_, location) => {
				location['5xxChanged'] = true;
			});

			const result = handleZones(STATS, null, location);

			// Date.now not called
			expect(spyDateNow).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(spyUtilsCalculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// is4xxThresholdReached called once
			expect(spyUtilsIs4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(spyUtilsIs4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			// location.warning
			expect(result.warning).toBe(true);
			// STATS.warnings
			expect(STATS.warnings).toBe(1);
			// handleErrors called once
			expect(spyUtilsHandleErrors).toHaveBeenCalled();
			expect(spyUtilsHandleErrors.mock.calls[0][0]).toBeNull();
			// handleErrors 2nd arg
			expect(spyUtilsHandleErrors.mock.calls[0][1]).toEqual(location);
			// STATS.status
			expect(STATS.status).toBe('danger');
			// STATS.alerts
			expect(STATS.alerts).toBe(1);
			// returned location
			expect(result).toEqual(location);
		});
	});

	it('calculate()', () => {
		const previousState = 'previousState';
		const STATS = {
			total: 0,
			warnings: 0,
			alerts: 0,
			status: 'ok'
		};
		const locations = { test_location: {} };
		const locationsMap = new Map([
			['test_location', {}]
		]);
		const STORE = {
			__STATUSES: {
				location_zones: {}
			}
		};

		const spyHandleZonesBind = jest.spyOn(handleZones, 'bind').mockClear();
		const spyUtilsCreateMapFromObject = jest.spyOn(utils, 'createMapFromObject').mockClear().mockImplementation(() => locationsMap);

		expect(calculate(null, null, STORE)).toBeNull();
		// __STATUSES.location_zones.ready [locations = {}]
		expect(STORE.__STATUSES.location_zones.ready).toBe(false);

		delete STORE.__STATUSES.location_zones.ready;

		expect(calculate({}, null, STORE)).toBeNull();
		// __STATUSES.location_zones.ready [locations = {}]
		expect(STORE.__STATUSES.location_zones.ready).toBe(false);

		const result = calculate(locations, previousState, STORE);

		// createMapFromObject called once
		expect(spyUtilsCreateMapFromObject).toHaveBeenCalled();
		// createMapFromObject 1st arg
		expect(spyUtilsCreateMapFromObject.mock.calls[0][0]).toEqual(locations);
		// createMapFromObject 2nd arg
		expect(spyUtilsCreateMapFromObject.mock.calls[0][1].name).toBe('bound handleZones');
		// handleZones.bind called once
		expect(handleZones.bind).toHaveBeenCalled();
		expect(spyHandleZonesBind.mock.calls[0][0]).toBeNull();

		STATS.total = locationsMap.size;

		// handleZones.bind 2nd arg
		expect(spyHandleZonesBind.mock.calls[0][1]).toEqual(STATS);
		// handleZones.bind 3rd arg
		expect(spyHandleZonesBind.mock.calls[0][2]).toBe(previousState);
		// createMapFromObject 3rd arg
		expect(spyUtilsCreateMapFromObject.mock.calls[0][2]).toBe(false);
		// locations.__STATS
		expect(result.__STATS).toEqual(STATS);
		// STORE.__STATUSES.location_zones
		expect(STORE.__STATUSES.location_zones).toEqual({
			ready: true,
			status: STATS.status
		});
	});
});
