/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import calculate, { handleZones } from '../serverzones.js';
import utils from '../utils.js';
import appsettings from '../../appsettings';

describe('Calculators – ServerZones', () => {
	describe('handleZones()', () => {
		const ts = 1596792686803;
		const serverName = 'test_server';
		let STATS; let server; let previousState; let
			STORE;

		beforeEach(() => {
			STATS = {
				total: 0,
				traffic: {
					in: 0,
					out: 0
				},
				warnings: 0,
				alerts: 0,
				status: 'ok'
			};
			server = {
				data: {
					sent: 135,
					received: 132,
				},
				requests: 24,
				passedToIs4xx: true
			};
			previousState = new Map([
				[serverName, {
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
					server_zones: {}
				}
			};
		});

		it('no previous state', () => {
			jest.spyOn(Date, 'now').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			jest.spyOn(utils, 'calculateTraffic').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => false);
			jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation(() => {});

			const result = handleZones(STATS, null, server);

			// Date.now not called
			expect(Date.now).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(utils.calculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// calculateTraffic not called
			expect(utils.calculateTraffic).not.toHaveBeenCalled();
			// is4xxThresholdReached called once
			expect(utils.is4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(utils.is4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			expect(result.warning).toBeUndefined();
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// handleErrors called once
			expect(utils.handleErrors).toHaveBeenCalled();
			expect(utils.handleErrors.mock.calls[0][0]).toBeNull();
			// handleErrors 2nd arg
			expect(utils.handleErrors.mock.calls[0][1]).toEqual(server);
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// returned server
			expect(result).toEqual(server);
		});

		it('no location in previous state', () => {
			jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			jest.spyOn(utils, 'calculateTraffic').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => false);
			jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation(() => {});

			const result = handleZones(STATS, previousState, server, 'unknown_server');

			// Date.now not called
			expect(Date.now).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(utils.calculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// calculateTraffic not called
			expect(utils.calculateTraffic).not.toHaveBeenCalled();
			// is4xxThresholdReached called once
			expect(utils.is4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(utils.is4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			expect(result.warning).toBeUndefined();
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// handleErrors called once
			expect(utils.handleErrors).toHaveBeenCalled();
			expect(utils.handleErrors.mock.calls[0][0]).toBeUndefined();
			// handleErrors 2nd arg
			expect(utils.handleErrors.mock.calls[0][1]).toEqual(server);
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// returned server
			expect(result).toEqual(server);
		});

		it('with previous state', () => {
			jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			jest.spyOn(utils, 'calculateTraffic').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => false);
			jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation(() => {});

			const previousServer = previousState.get(serverName);
			const period = ts - previousState.lastUpdate;
			const result = handleZones(STATS, previousState, server, serverName);

			// Date.now called once
			expect(Date.now).toHaveBeenCalled();
			expect(utils.calculateSpeed).toHaveBeenCalledTimes(3);
			// calculateSpeed 1st call 1st arg
			expect(utils.calculateSpeed.mock.calls[0][0]).toBe(previousServer.data.sent);
			// calculateSpeed 1st call 2nd arg
			expect(utils.calculateSpeed.mock.calls[0][1]).toBe(server.data.sent);
			// calculateSpeed 1st call 3rd arg
			expect(utils.calculateSpeed.mock.calls[0][2]).toBe(period);
			// server.sent_s
			expect(result.sent_s).toBe(server.data.sent);
			// calculateSpeed 2nd call 1st arg
			expect(utils.calculateSpeed.mock.calls[1][0]).toBe(previousServer.data.received);
			// calculateSpeed 2nd call 2nd arg
			expect(utils.calculateSpeed.mock.calls[1][1]).toBe(server.data.received);
			// calculateSpeed 2nd call 3rd arg
			expect(utils.calculateSpeed.mock.calls[1][2]).toBe(period);
			// server.rcvd_s
			expect(result.rcvd_s).toBe(server.data.received);
			// calculateSpeed 3rd call 1st arg
			expect(utils.calculateSpeed.mock.calls[2][0]).toBe(previousServer.requests);
			// calculateSpeed 3rd call 2nd arg
			expect(utils.calculateSpeed.mock.calls[2][1]).toBe(server.requests);
			// calculateSpeed 3rd call 3rd arg
			expect(utils.calculateSpeed.mock.calls[2][2]).toBe(period);
			// server.zone_req_s
			expect(result.zone_req_s).toBe(server.requests);
			// calculateTraffic called once
			expect(utils.calculateTraffic).toHaveBeenCalled();
			// calculateTraffic 1st arg
			expect(utils.calculateTraffic.mock.calls[0][0]).toEqual(STATS);
			// calculateTraffic 2nd arg
			expect(utils.calculateTraffic.mock.calls[0][1]).toEqual(server);
			// is4xxThresholdReached called once
			expect(utils.is4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(utils.is4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			expect(result.warning).toBeUndefined();
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// handleErrors called once
			expect(utils.handleErrors).toHaveBeenCalled();
			// handleErrors 1st arg
			expect(utils.handleErrors.mock.calls[0][0]).toEqual(previousServer);
			// handleErrors 2nd arg
			expect(utils.handleErrors.mock.calls[0][1]).toEqual(server);
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// returned server
			expect(result).toEqual(server);
		});

		it('4xx threshold reached', () => {
			jest.spyOn(Date, 'now').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			jest.spyOn(utils, 'calculateTraffic').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => true);
			jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation(() => {});

			const result = handleZones(STATS, null, server);

			// Date.now not called
			expect(Date.now).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(utils.calculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// calculateTraffic not called
			expect(utils.calculateTraffic).not.toHaveBeenCalled();
			// is4xxThresholdReached called once
			expect(utils.is4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(utils.is4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			// server.warning
			expect(result.warning).toBe(true);
			// STATS.status
			expect(STATS.status).toBe('warning');
			// STATS.warnings
			expect(STATS.warnings).toBe(1);
			// handleErrors called once
			expect(utils.handleErrors).toHaveBeenCalled();
			expect(utils.handleErrors.mock.calls[0][0]).toBeNull();
			// handleErrors 2nd arg
			expect(utils.handleErrors.mock.calls[0][1]).toEqual(server);
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			// returned server
			expect(result).toEqual(server);
		});

		it('handles 5xx changing', () => {
			jest.spyOn(Date, 'now').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			jest.spyOn(utils, 'calculateTraffic').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => false);
			jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation((_, server) => {
				server['5xxChanged'] = true;
			});

			const result = handleZones(STATS, null, server);

			// Date.now not called
			expect(Date.now).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(utils.calculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// is4xxThresholdReached called once
			expect(utils.is4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(utils.is4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			expect(result.warning).toBeUndefined();
			// STATS.warnings
			expect(STATS.warnings).toBe(0);
			// handleErrors called once
			expect(utils.handleErrors).toHaveBeenCalled();
			expect(utils.handleErrors.mock.calls[0][0]).toBeNull();
			// handleErrors 2nd arg
			expect(utils.handleErrors.mock.calls[0][1]).toEqual(server);
			// STATS.status
			expect(STATS.status).toBe('danger');
			// STATS.alerts
			expect(STATS.alerts).toBe(1);
			// returned server
			expect(result).toEqual(server);
		});

		it('handles 5xx changing (with 4xx threshold reached)', () => {
			jest.spyOn(Date, 'now').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			jest.spyOn(utils, 'calculateTraffic').mockClear().mockImplementation(() => {});
			jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => true);
			jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation((_, server) => {
				server['5xxChanged'] = true;
			});

			const result = handleZones(STATS, null, server);

			// Date.now not called
			expect(Date.now).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(utils.calculateSpeed).not.toHaveBeenCalled();
			expect(result.sent_s).toBeUndefined();
			expect(result.rcvd_s).toBeUndefined();
			expect(result.zone_req_s).toBeUndefined();
			// is4xxThresholdReached called once
			expect(utils.is4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(utils.is4xxThresholdReached.mock.calls[0][0].passedToIs4xx).toBe(true);
			// server.warning
			expect(result.warning).toBe(true);
			// STATS.warnings
			expect(STATS.warnings).toBe(1);
			// handleErrors called once
			expect(utils.handleErrors).toHaveBeenCalled();
			expect(utils.handleErrors.mock.calls[0][0]).toBeNull();
			// handleErrors 2nd arg
			expect(utils.handleErrors.mock.calls[0][1]).toEqual(server);
			// STATS.status
			expect(STATS.status).toBe('danger');
			// STATS.alerts
			expect(STATS.alerts).toBe(1);
			// returned server
			expect(result).toEqual(server);
		});
	});

	it('calculate()', () => {
		const previousState = 'previousState';
		const STATS = {
			total: 0,
			traffic: {
				in: 0,
				out: 0
			},
			warnings: 0,
			alerts: 0,
			status: 'ok'
		};
		const zones = { test_server: {} };
		const zonesMap = new Map([
			['test_server', {}]
		]);
		const STORE = {
			__STATUSES: {
				server_zones: {}
			}
		};

		jest.spyOn(handleZones, 'bind').mockClear();
		jest.spyOn(utils, 'createMapFromObject').mockClear().mockImplementation(() => zonesMap);

		expect(calculate(null, null, STORE)).toBeNull();
		// __STATUSES.server_zones.ready [zones = {}]
		expect(STORE.__STATUSES.server_zones.ready).toBe(false);

		delete STORE.__STATUSES.server_zones.ready;

		expect(calculate({}, null, STORE)).toBeNull();
		// __STATUSES.server_zones.ready [zones = {}]
		expect(STORE.__STATUSES.server_zones.ready).toBe(false);

		const result = calculate(zones, previousState, STORE);

		// createMapFromObject called once
		expect(utils.createMapFromObject).toHaveBeenCalled();
		// createMapFromObject 1st arg
		expect(utils.createMapFromObject.mock.calls[0][0]).toEqual(zones);
		// createMapFromObject 2nd arg
		expect(utils.createMapFromObject.mock.calls[0][1].name).toBe('bound handleZones');
		// handleZones.bind called once
		expect(handleZones.bind).toHaveBeenCalled();
		expect(handleZones.bind.mock.calls[0][0]).toBeNull();

		STATS.total = zonesMap.size;

		// handleZones.bind 2nd arg
		expect(handleZones.bind.mock.calls[0][1]).toEqual(STATS);
		// handleZones.bind 3rd arg
		expect(handleZones.bind.mock.calls[0][2]).toBe(previousState);
		// createMapFromObject 3rd arg
		expect(utils.createMapFromObject.mock.calls[0][2]).toBe(false);
		// zones.__STATS
		expect(result.__STATS).toEqual(STATS);
		// STORE.__STATUSES.server_zones
		expect(STORE.__STATUSES.server_zones).toEqual({
			ready: true,
			status: STATS.status
		});
	});
});
