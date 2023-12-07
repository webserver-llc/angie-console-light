/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import { handleZones, zones as zonesCalculate, upstreams as upstreamsCalculate } from '../stream.js';
import utils from '../utils.js';

describe('Calculators – Stream', () => {
	describe('handleZones', () => {
		const ts = 1596792686803;
		const name = 'test_zone';
		const previous = new Map([
			[name, {
				sent: 125,
				received: 122,
				connections: 14,
				processing: 31
			}]
		]);
		let STATS; let
			zone;
		let handleErrors = () => {};

		previous.lastUpdate = ts - 1000;

		beforeAll(() => {
			jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			jest.spyOn(utils, 'calculateTraffic').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation((_, zone) => { handleErrors(zone); });
		});

		beforeEach(() => {
			Date.now.mockClear();
			utils.calculateSpeed.mockClear();
			utils.calculateTraffic.mockClear();
			utils.handleErrors.mockClear();

			STATS = {
				conn_total: 0,
				conn_current: 0,
				conn_s: 0,
				traffic: {
					in: 0,
					out: 0
				},
				status: 'ok',
				STATS_TEST: true
			};
			zone = {
				sent: 135,
				received: 132,
				connections: 24,
				processing: 27
			};
		});

		afterAll(() => {
			Date.now.mockRestore();
			utils.calculateSpeed.mockRestore();
			utils.calculateTraffic.mockRestore();
			utils.handleErrors.mockRestore();
		});

		it('no previous state', () => {
			const result = handleZones(STATS, null, zone);

			// Date.now not called
			expect(Date.now).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(utils.calculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// STATS.conn_s
			expect(STATS.conn_s).toBe(0);
			// calculateTraffic not called
			expect(utils.calculateTraffic).not.toHaveBeenCalled();
			// handleErrors called once
			expect(utils.handleErrors).toHaveBeenCalled();
			expect(utils.handleErrors.mock.calls[0][0]).toBeNull();
			// handleErrors 2nd arg
			expect(utils.handleErrors.mock.calls[0][1]).toEqual(zone);
			// handleErrors 3rd arg
			expect(utils.handleErrors.mock.calls[0][2]).toBe('sessions');
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.conn_total
			expect(STATS.conn_total).toBe(24);
			// STATS.conn_current
			expect(STATS.conn_current).toBe(27);
			// STATS.traffic.in
			expect(STATS.traffic.in).toBe(0);
			// STATS.traffic.out
			expect(STATS.traffic.out).toBe(0);
			// returned zone
			expect(result).toEqual(zone);
		});

		it('no zone in previous state', () => {
			const result = handleZones(STATS, previous, zone, 'unknown_zone');

			// Date.now not called
			expect(Date.now).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(utils.calculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// STATS.conn_s
			expect(STATS.conn_s).toBe(0);
			// calculateTraffic not called
			expect(utils.calculateTraffic).not.toHaveBeenCalled();
			// handleErrors called once
			expect(utils.handleErrors).toHaveBeenCalled();
			expect(utils.handleErrors.mock.calls[0][0]).toBeUndefined();
			// handleErrors 2nd arg
			expect(utils.handleErrors.mock.calls[0][1]).toEqual(zone);
			// handleErrors 3rd arg
			expect(utils.handleErrors.mock.calls[0][2]).toBe('sessions');
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.conn_total
			expect(STATS.conn_total).toBe(24);
			// STATS.conn_current
			expect(STATS.conn_current).toBe(27);
			// STATS.traffic.in
			expect(STATS.traffic.in).toBe(0);
			// STATS.traffic.out
			expect(STATS.traffic.out).toBe(0);
			// returned zone
			expect(result).toEqual(zone);
		});

		it('with previous state', () => {
			const previousZone = previous.get(name);
			const period = ts - previous.lastUpdate;
			const result = handleZones(STATS, previous, zone, name);

			// Date.now called once
			expect(Date.now).toHaveBeenCalled();
			expect(utils.calculateSpeed).toHaveBeenCalledTimes(3);
			// calculateSpeed 1st call 1st arg
			expect(utils.calculateSpeed.mock.calls[0][0]).toBe(previousZone.sent);
			// calculateSpeed 1st call 2nd arg
			expect(utils.calculateSpeed.mock.calls[0][1]).toBe(zone.sent);
			// calculateSpeed 1st call 3rd arg
			expect(utils.calculateSpeed.mock.calls[0][2]).toBe(period);
			// zone.sent_s
			expect(result.sent_s).toBe(zone.sent);
			// calculateSpeed 2nd call 1st arg
			expect(utils.calculateSpeed.mock.calls[1][0]).toBe(previousZone.received);
			// calculateSpeed 2nd call 2nd arg
			expect(utils.calculateSpeed.mock.calls[1][1]).toBe(zone.received);
			// calculateSpeed 2nd call 3rd arg
			expect(utils.calculateSpeed.mock.calls[1][2]).toBe(period);
			// zone.rcvd_s
			expect(result.rcvd_s).toBe(zone.received);
			// calculateSpeed 3rd call 1st arg
			expect(utils.calculateSpeed.mock.calls[2][0]).toBe(previousZone.connections);
			// calculateSpeed 3rd call 2nd arg
			expect(utils.calculateSpeed.mock.calls[2][1]).toBe(zone.connections);
			// calculateSpeed 3rd call 3rd arg
			expect(utils.calculateSpeed.mock.calls[2][2]).toBe(period);
			// zone.zone_conn_s
			expect(result.zone_conn_s).toBe(zone.connections);
			// STATS.conn_s
			expect(STATS.conn_s).toBe(zone.connections);
			// calculateTraffic called once
			expect(utils.calculateTraffic).toHaveBeenCalled();
			// calculateTraffic 1st arg
			expect(utils.calculateTraffic.mock.calls[0][0].STATS_TEST).toBe(true);
			// calculateTraffic 2nd arg
			expect(utils.calculateTraffic.mock.calls[0][1]).toEqual(zone);
			// handleErrors 1st arg
			expect(utils.handleErrors.mock.calls[0][0]).toEqual(previousZone);
			// handleErrors 2nd arg
			expect(utils.handleErrors.mock.calls[0][1]).toEqual(zone);
			// handleErrors 3rd arg
			expect(utils.handleErrors.mock.calls[0][2]).toBe('sessions');
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.conn_total
			expect(STATS.conn_total).toBe(24);
			// STATS.conn_current
			expect(STATS.conn_current).toBe(27);
			// STATS.traffic.in
			expect(STATS.traffic.in).toBe(0);
			// STATS.traffic.out
			expect(STATS.traffic.out).toBe(0);
			// returned zone
			expect(result).toEqual(zone);
		});

		it('STATS collecting', () => {
			handleZones(STATS, null, zone);
			handleZones(STATS, previous, zone, 'unknown_zone');
			handleZones(STATS, previous, zone, name);
			handleZones(STATS, previous, zone, name);

			// STATS.conn_s
			expect(STATS.conn_s).toBe(48);
			// STATS.conn_total
			expect(STATS.conn_total).toBe(96);
			// STATS.conn_current
			expect(STATS.conn_current).toBe(108);
		});

		it('handles 5xx changing', () => {
			const _handleErrors = handleErrors;

			handleErrors = zone => {
				zone['5xxChanged'] = true;
			};

			handleZones(STATS, null, zone);

			// STATS.status
			expect(STATS.status).toBe('danger');

			handleErrors = _handleErrors;
		});

		it('handles 4xx changing', () => {
			const _handleErrors = handleErrors;

			handleErrors = zone => {
				zone['4xxChanged'] = true;
			};

			handleZones(STATS, null, zone);

			// STATS.status
			expect(STATS.status).toBe('danger');

			handleErrors = _handleErrors;
		});
	});

	it('zones()', () => {
		const previousState = 'previousState';
		const STATS = {
			conn_total: 0,
			conn_current: 0,
			conn_s: 0,
			traffic: {
				in: 0,
				out: 0
			},
			status: 'ok'
		};
		const zones = { test_zones: {} };
		const zonesMap = new Map([
			['test_zones', {}]
		]);
		const STORE = {
			__STATUSES: {
				tcp_zones: {}
			}
		};

		jest.spyOn(handleZones, 'bind').mockClear();
		jest.spyOn(utils, 'createMapFromObject').mockClear().mockImplementation(() => zonesMap);

		expect(zonesCalculate(null, null, STORE)).toBeNull();
		// __STATUSES.tcp_zones.ready [zones = {}]
		expect(STORE.__STATUSES.tcp_zones.ready).toBe(false);

		delete STORE.__STATUSES.tcp_zones.ready;

		expect(zonesCalculate({}, null, STORE)).toBeNull();
		// __STATUSES.tcp_zones.ready [zones = {}]
		expect(STORE.__STATUSES.tcp_zones.ready).toBe(false);

		const result = zonesCalculate(zones, previousState, STORE);

		// createMapFromObject called once
		expect(utils.createMapFromObject).toHaveBeenCalled();
		// createMapFromObject 1st arg
		expect(utils.createMapFromObject.mock.calls[0][0]).toEqual(zones);
		// createMapFromObject 2nd arg
		expect(utils.createMapFromObject.mock.calls[0][1].name).toBe('bound handleZones');
		// handleZones.bind called once
		expect(handleZones.bind).toHaveBeenCalled();
		expect(handleZones.bind.mock.calls[0][0]).toBeNull();
		// handleZones.bind 2nd arg
		expect(handleZones.bind.mock.calls[0][1]).toEqual(STATS);
		// handleZones.bind 3rd arg
		expect(handleZones.bind.mock.calls[0][2]).toBe(previousState);
		// zones.__STATS
		expect(result.__STATS).toEqual(STATS);
		// STORE.__STATUSES.tcp_zones
		expect(STORE.__STATUSES.tcp_zones).toEqual({
			ready: true,
			status: STATS.status
		});
	});

	it('upstreams()', () => {
		// upstreamsCalculate.name
		expect(upstreamsCalculate.name).toBe('bound upstreamsCalculator');
	});
});
