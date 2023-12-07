/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import calculate, { handleZones } from '../zonesync.js';
import { DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT } from '../../constants.js';
import utils from '../utils.js';
import appsettings from '../../appsettings';

describe('Calculators – ZoneSync', () => {
	describe('handleZones()', () => {
		let alertThreshold = 100;
		let STATS; let
			zone;

		beforeAll(() => {
			jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => alertThreshold);
		});

		beforeEach(() => {
			appsettings.getSetting.mockClear();

			STATS = {
				total: 0,
				traffic: {
					in: 0,
					out: 0
				},
				alerts: 0,
				warnings: 0,
				status: 'ok'
			};
			zone = {
				records_total: 1000,
				records_pending: 23
			};
		});

		afterAll(() => {
			appsettings.getSetting.mockRestore();
		});

		it('total records > 0', () => {
			const result = handleZones(STATS, zone);

			// getSetting called once
			expect(appsettings.getSetting).toHaveBeenCalled();
			// getSetting 1st arg
			expect(appsettings.getSetting.mock.calls[0][0]).toBe('zonesyncPendingThreshold');
			// getSetting 2nd arg
			expect(appsettings.getSetting.mock.calls[0][1]).toBe(DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT);
			expect(result.alert).toBeUndefined();
			expect(result.warning).toBeUndefined();
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// returned zone
			expect(result).toEqual(zone);
		});

		it('total records > 0 && alert threshold reached', () => {
			alertThreshold = 0;

			const result = handleZones(STATS, zone);

			// getSetting called once
			expect(appsettings.getSetting).toHaveBeenCalled();
			// getSetting 1st arg
			expect(appsettings.getSetting.mock.calls[0][0]).toBe('zonesyncPendingThreshold');
			// getSetting 2nd arg
			expect(appsettings.getSetting.mock.calls[0][1]).toBe(DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT);
			// zone.alert
			expect(result.alert).toBe(true);
			// STATS.status
			expect(STATS.status).toBe('danger');
			// STATS.alerts
			expect(STATS.alerts).toBe(1);
			expect(result.warning).toBeUndefined();
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// returned zone
			expect(result).toEqual(zone);
		});

		it('total records > 0 && warning threshold reached', () => {
			alertThreshold = 3;

			const result = handleZones(STATS, zone);

			// getSetting called once
			expect(appsettings.getSetting).toHaveBeenCalled();
			// getSetting 1st arg
			expect(appsettings.getSetting.mock.calls[0][0]).toBe('zonesyncPendingThreshold');
			// getSetting 2nd arg
			expect(appsettings.getSetting.mock.calls[0][1]).toBe(DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT);
			expect(result.alert).toBeUndefined();
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// zone.warning
			expect(result.warning).toBe(true);
			// STATS.status
			expect(STATS.status).toBe('warning');
			// STATS.warnings
			expect(STATS.warnings).toBe(1);
			// returned zone
			expect(result).toEqual(zone);
		});

		it('total records == 0 && pending > 0', () => {
			zone.records_total = 0;

			const result = handleZones(STATS, zone);

			// getSetting not called
			expect(appsettings.getSetting).not.toHaveBeenCalled();
			// zone.alert
			expect(result.alert).toBe(true);
			// STATS.status
			expect(STATS.status).toBe('danger');
			// STATS.alerts
			expect(STATS.alerts).toBe(1);
			expect(result.warning).toBeUndefined();
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// returned zone
			expect(result).toEqual(zone);
		});

		it('total records = 0 && pending == 0', () => {
			zone.records_total = 0;
			zone.records_pending = 0;

			const result = handleZones(STATS, zone);

			// getSetting not called
			expect(appsettings.getSetting).not.toHaveBeenCalled();
			expect(result.alert).toBeUndefined();
			expect(result.warning).toBeUndefined();
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// returned zone
			expect(result).toEqual(zone);
		});

		it('STATS collecting', () => {
			alertThreshold = 50;

			// normal
			handleZones(STATS, {
				records_total: 100,
				records_pending: 2
			});
			// alerts
			handleZones(STATS, {
				records_total: 10000,
				records_pending: 6500
			});
			handleZones(STATS, {
				records_total: 100,
				records_pending: 90
			});
			// warnings
			handleZones(STATS, {
				records_total: 1000,
				records_pending: 490
			});
			handleZones(STATS, {
				records_total: 1000,
				records_pending: 400
			});
			handleZones(STATS, {
				records_total: 1000,
				records_pending: 450
			});

			// STATS.alerts
			expect(STATS.alerts).toBe(2);
			// STATS.warnings
			expect(STATS.warnings).toBe(3);
		});
	});

	describe('calculate()', () => {
		const ts = 1597260481443;
		const period = 10000;
		const zonesMap = new Map([
			[ 'test', { a: 123 } ],
			[ 'test_1', { a: 321 } ]
		]);
		const previous = {
			status: {
				msgs_in: 5,
				msgs_out: 4
			},
			lastUpdate: ts - period
		};
		let STATS; let zone_sync; let
			STORE;

		beforeAll(() => {
			jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			jest.spyOn(utils, 'createMapFromObject').mockClear().mockImplementation(() => zonesMap);
			jest.spyOn(handleZones, 'bind').mockClear();
		});

		beforeEach(() => {
			Date.now.mockClear();
			utils.calculateSpeed.mockClear();
			utils.createMapFromObject.mockClear();
			handleZones.bind.mockClear();

			STATS = {
				total: 0,
				traffic: {
					in: 0,
					out: 0
				},
				alerts: 0,
				warnings: 0,
				status: 'ok'
			};
			zone_sync = {
				status: {
					msgs_in: 10,
					msgs_out: 9
				},
				zones: {
					test: { a: 123 },
					test_1: { a: 321 }
				}
			};
			STORE = { __STATUSES: {
				zone_sync: {}
			} };
		});

		afterAll(() => {
			Date.now.mockRestore();
			utils.calculateSpeed.mockRestore();
			utils.createMapFromObject.mockRestore();
			handleZones.bind.mockRestore();
		});

		it('zone_sync is null', () => {
			const result = calculate(null, null, STORE);

			// Date.now not called
			expect(Date.now).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(utils.calculateSpeed).not.toHaveBeenCalled();
			// createMapFromObject not called
			expect(utils.createMapFromObject).not.toHaveBeenCalled();
			// handleZones.bind not called
			expect(handleZones.bind).not.toHaveBeenCalled();
			// __STATUSES.zone_sync.ready
			expect(STORE.__STATUSES.zone_sync.ready).toBe(false);
			expect(STORE.__STATUSES.zone_sync.status).toBeUndefined();
			expect(result).toBeNull();
		});

		it('zone_sync is empty', () => {
			const result = calculate({}, null, STORE);

			// Date.now not called
			expect(Date.now).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(utils.calculateSpeed).not.toHaveBeenCalled();
			// createMapFromObject not called
			expect(utils.createMapFromObject).not.toHaveBeenCalled();
			// handleZones.bind not called
			expect(handleZones.bind).not.toHaveBeenCalled();
			// __STATUSES.zone_sync.ready
			expect(STORE.__STATUSES.zone_sync.ready).toBe(false);
			expect(STORE.__STATUSES.zone_sync.status).toBeUndefined();
			expect(result).toBeNull();
		});

		it('no previous state', () => {
			const result = calculate(zone_sync, null, STORE);

			// Date.now not called
			expect(Date.now).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(utils.calculateSpeed).not.toHaveBeenCalled();
			// createMapFromObject called once
			expect(utils.createMapFromObject).toHaveBeenCalled();
			// createMapFromObject 1st arg
			expect(utils.createMapFromObject.mock.calls[0][0]).toEqual({
				test: { a: 123 },
				test_1: { a: 321 }
			});
			// handleZones.bind called once
			expect(handleZones.bind).toHaveBeenCalled();
			expect(handleZones.bind.mock.calls[0][0]).toBeNull();

			STATS.total = zonesMap.size;

			// handleZones.bind 2nd arg
			expect(handleZones.bind.mock.calls[0][1]).toEqual(STATS);
			// createMapFromObject 2nd arg
			expect(utils.createMapFromObject.mock.calls[0][1].name).toBe('bound handleZones');
			// createMapFromObject 3rd arg
			expect(utils.createMapFromObject.mock.calls[0][2]).toBe(false);
			// zone_sync.zones
			expect(result.zones).toEqual(zonesMap);
			// STATS.total
			expect(STATS.total).toBe(result.zones.size);
			// zone_sync.__STATS
			expect(zone_sync.__STATS).toEqual(STATS);
			// __STATUSES.zone_sync.ready
			expect(STORE.__STATUSES.zone_sync.ready).toBe(true);
			// __STATUSES.zone_sync.status
			expect(STORE.__STATUSES.zone_sync.status).toBe('ok');
			// returned zone_sync
			expect(result).toEqual(zone_sync);
		});

		it('with previous state', () => {
			const result = calculate(zone_sync, previous, STORE);

			// calculateSpeed called twice
			expect(utils.calculateSpeed).toHaveBeenCalledTimes(2);
			// calculateSpeed call 1, arg 1
			expect(utils.calculateSpeed.mock.calls[0][0]).toBe(5);
			// calculateSpeed call 1, arg 2
			expect(utils.calculateSpeed.mock.calls[0][1]).toBe(10);
			// calculateSpeed call 1, arg 3
			expect(utils.calculateSpeed.mock.calls[0][2]).toBe(period);
			// STATS.traffic.in
			expect(result.__STATS.traffic.in).toBe(10);
			// calculateSpeed call 2, arg 1
			expect(utils.calculateSpeed.mock.calls[1][0]).toBe(4);
			// calculateSpeed call 2, arg 2
			expect(utils.calculateSpeed.mock.calls[1][1]).toBe(9);
			// calculateSpeed call 2, arg 3
			expect(utils.calculateSpeed.mock.calls[1][2]).toBe(period);
			// STATS.traffic.out
			expect(result.__STATS.traffic.out).toBe(9);
		});
	});
});
