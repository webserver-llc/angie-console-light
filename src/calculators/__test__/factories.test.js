/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import {
	handlePeer,
	handleUpstreams,
	upstreamsCalculator,
	upstreamsCalculatorFactory,
	addHistory,
	limitConnReqHistoryLimit,
	limitConnReqFactory,
	limitConnReqCalculator,
	FailuresCounter,
} from '../factories.js';
import utils from '../utils.js';
import appsettings from '../../appsettings';

describe('Calculators – factories', () => {
	describe('handlePeer', () => {
		const ts = 1597654154847;
		const period = 1000;
		const slabs = 'slabs_test';
		const name = 'test_upstream';
		const previousState = new Map([
			[name, {
				peers: [
					{
						id: 1,
						requests: 30,
						sent: 101,
						received: 99,
						max_conns: 10,
						health_checks: {
							last_passed: 'passed'
						},
						state: 'up',
						responses: {
							'4xx': 0,
							'5xx': 0
						},
						previous_peer_state_duck_test: true
					}, {
						id: 2,
						requests: 0,
						sent: 0,
						received: 0,
						max_conns: 0,
						health_checks: {},
						state: 'down',
						responses: {
							'4xx': 0,
							'5xx': 0
						}
					}
				]
			}]
		]);
		let STATS; let upstream; let
			peer;
		let is4xxThresholdReached = false;
		let spyDateNow; let spyUtilsCalculateSpeed; let spyUtilsIs4xxThresholdReached; let
			spyUtilsHandleErrors;

		previousState.lastUpdate = ts - period;

		beforeAll(() => {
			spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			spyUtilsIs4xxThresholdReached = jest.spyOn(utils, 'is4xxThresholdReached').mockClear().mockImplementation(() => is4xxThresholdReached);
			spyUtilsHandleErrors = jest.spyOn(utils, 'handleErrors').mockClear().mockImplementation(() => { });
		});

		beforeEach(() => {
			spyDateNow.mockClear();
			spyUtilsCalculateSpeed.mockClear();
			spyUtilsIs4xxThresholdReached.mockClear();
			spyUtilsHandleErrors.mockClear();

			STATS = {
				servers: {
					all: 0,
					up: 0,
					down: 0,
					failed: 0,
					draining: 0
				},
				failures: new FailuresCounter(),
				warnings: 0,
				alerts: 0,
				status: 'ok'
			};
			upstream = {
				name,
				configured_health_checks: true,
				stats: {
					all: 0,
					up: 0,
					down: 0,
					failed: 0,
					draining: 0,
					checking: 0
				}
			};
			peer = {
				id: 1,
				requests: 100,
				sent: 100500,
				received: 99500,
				max_conns: 10,
				health_checks: {
					last_passed: 'passed'
				},
				state: 'up',
				responses: {
					'4xx': 0,
					'5xx': 0
				}
			};
		});

		afterAll(() => {
			spyDateNow.mockRestore();
			spyUtilsCalculateSpeed.mockRestore();
			spyUtilsIs4xxThresholdReached.mockRestore();
			spyUtilsHandleErrors.mockRestore();
		});

		([
			'no previousState',
			'no upstream in previousState',
			'no previousPeer'
		]).forEach((title, i) => {
			it(title, () => {
				let _previousState = null;

				switch (i) {
					case 1:
						upstream.name = 'unknown_upstream';
						_previousState = previousState;
						break;
					case 2:
						peer.id = 3;
						_previousState = previousState;
						break;
				}

				handlePeer('', STATS, _previousState, upstream, peer);

				// Date.now not called
				expect(spyDateNow).not.toHaveBeenCalled();
				// calculateSpeed not called
				expect(spyUtilsCalculateSpeed).not.toHaveBeenCalled();
				// peer.max_conns
				expect(peer.max_conns).toBe(10);
				// peer.health_status
				expect(peer.health_status).toBe(true);
				expect(peer.isHttp).toBeUndefined();
				// is4xxThresholdReached not called
				expect(spyUtilsIs4xxThresholdReached).not.toHaveBeenCalled();
				// handleErrors not called
				expect(spyUtilsHandleErrors).not.toHaveBeenCalled();
				// STATS
				expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
					servers: {
						all: 1,
						up: 1,
						down: 0,
						failed: 0,
						draining: 0
					},
					failures: 0,
					warnings: 0,
					alerts: 0,
					status: 'ok'
				});
				// upstream
				expect(upstream).toEqual({
					name: i === 1 ? 'unknown_upstream' : name,
					configured_health_checks: true,
					stats: {
						all: 1,
						up: 1,
						down: 0,
						failed: 0,
						draining: 0,
						checking: 0
					}
				});
			});
		});

		it('with previousPeer, upstreamsKey "upstreams"', () => {
			handlePeer('upstreams', STATS, previousState, upstream, peer);

			// Date.now called once
			expect(spyDateNow).toHaveBeenCalled();
			expect(spyUtilsCalculateSpeed).toHaveBeenCalledTimes(3);
			// calculateSpeed 1st call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][0]).toBe(30);
			// calculateSpeed 1st call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][1]).toBe(100);
			// calculateSpeed 1st call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][2]).toBe(period);
			// peer.server_req_s
			expect(peer.server_req_s).toBe(100);
			expect(peer.server_conn_s).toBeUndefined();
			// calculateSpeed 2nd call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][0]).toBe(101);
			// calculateSpeed 2nd call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][1]).toBe(100500);
			// calculateSpeed 2nd call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][2]).toBe(period);
			// peer.server_sent_s
			expect(peer.server_sent_s).toBe(100500);
			// calculateSpeed 3rd call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[2][0]).toBe(99);
			// calculateSpeed 3rd call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[2][1]).toBe(99500);
			// calculateSpeed 3rd call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[2][2]).toBe(period);
			// peer.server_rcvd_s
			expect(peer.server_rcvd_s).toBe(99500);
			// peer.isHttp
			expect(peer.isHttp).toBe(true);
			// is4xxThresholdReached called once
			expect(spyUtilsIs4xxThresholdReached).toHaveBeenCalled();
			// is4xxThresholdReached 1st arg
			expect(spyUtilsIs4xxThresholdReached.mock.calls[0][0]).toEqual(peer);
			// handleErrors called once
			expect(spyUtilsHandleErrors).toHaveBeenCalled();
			// handleErrors 1st arg
			expect('previous_peer_state_duck_test' in spyUtilsHandleErrors.mock.calls[0][0]).toBe(true);
			// handleErrors 2nd arg
			expect(spyUtilsHandleErrors.mock.calls[0][1]).toEqual(peer);
			// STATS
			expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
				servers: {
					all: 1,
					up: 1,
					down: 0,
					failed: 0,
					draining: 0
				},
				failures: 0,
				warnings: 0,
				alerts: 0,
				status: 'ok'
			});
			// upstream
			expect(upstream).toEqual({
				name,
				configured_health_checks: true,
				stats: {
					all: 1,
					up: 1,
					down: 0,
					failed: 0,
					draining: 0,
					checking: 0
				}
			});
		});

		it('with previousPeer, upstreamsKey "tcp_upstreams"', () => {
			handlePeer('tcp_upstreams', STATS, previousState, upstream, peer);

			// Date.now called once
			expect(spyDateNow).toHaveBeenCalled();
			expect(spyUtilsCalculateSpeed).toHaveBeenCalledTimes(3);
			// calculateSpeed 1st call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][0]).toBe(30);
			// calculateSpeed 1st call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][1]).toBe(100);
			// calculateSpeed 1st call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][2]).toBe(period);
			expect(peer.server_req_s).toBeUndefined();
			// peer.server_conn_s
			expect(peer.server_conn_s).toBe(100);
			// calculateSpeed 2nd call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][0]).toBe(101);
			// calculateSpeed 2nd call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][1]).toBe(100500);
			// calculateSpeed 2nd call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][2]).toBe(period);
			// peer.server_sent_s
			expect(peer.server_sent_s).toBe(100500);
			// calculateSpeed 3rd call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[2][0]).toBe(99);
			// calculateSpeed 3rd call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[2][1]).toBe(99500);
			// calculateSpeed 3rd call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[2][2]).toBe(period);
			// peer.server_rcvd_s
			expect(peer.server_rcvd_s).toBe(99500);
			// peer.max_conns
			expect(peer.max_conns).toBe(10);
			// peer.health_status
			expect(peer.health_status).toBe(true);
			expect(peer.isHttp).toBeUndefined();
			// is4xxThresholdReached not called
			expect(spyUtilsIs4xxThresholdReached).not.toHaveBeenCalled();
			// handleErrors not called
			expect(spyUtilsHandleErrors).not.toHaveBeenCalled();
			// STATS
			expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
				servers: {
					all: 1,
					up: 1,
					down: 0,
					failed: 0,
					draining: 0
				},
				failures: 0,
				warnings: 0,
				alerts: 0,
				status: 'ok'
			});
			// upstream
			expect(upstream).toEqual({
				name,
				configured_health_checks: true,
				stats: {
					all: 1,
					up: 1,
					down: 0,
					failed: 0,
					draining: 0,
					checking: 0
				}
			});
		});

		it('with previousPeer, custom upstreamsKey', () => {
			handlePeer('', STATS, previousState, upstream, peer);

			// Date.now called once
			expect(Date.now).toHaveBeenCalled();
			expect(utils.calculateSpeed).toHaveBeenCalledTimes(2);
			expect(peer.server_req_s).toBeUndefined();
			expect(peer.server_conn_s).toBeUndefined();
			// calculateSpeed 1st call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][0]).toBe(101);
			// calculateSpeed 1st call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][1]).toBe(100500);
			// calculateSpeed 1st call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[0][2]).toBe(period);
			// peer.server_sent_s
			expect(peer.server_sent_s).toBe(100500);
			// calculateSpeed 2nd call 1st arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][0]).toBe(99);
			// calculateSpeed 2nd call 2nd arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][1]).toBe(99500);
			// calculateSpeed 2nd call 3rd arg
			expect(spyUtilsCalculateSpeed.mock.calls[1][2]).toBe(period);
			// peer.server_rcvd_s
			expect(peer.server_rcvd_s).toBe(99500);
			// peer.max_conns
			expect(peer.max_conns).toBe(10);
			// peer.health_status
			expect(peer.health_status).toBe(true);
			expect(peer.isHttp).toBeUndefined();
			// is4xxThresholdReached not called
			expect(spyUtilsIs4xxThresholdReached).not.toHaveBeenCalled();
			// handleErrors not called
			expect(spyUtilsHandleErrors).not.toHaveBeenCalled();
			// STATS
			expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
				servers: {
					all: 1,
					up: 1,
					down: 0,
					failed: 0,
					draining: 0
				},
				failures: 0,
				warnings: 0,
				alerts: 0,
				status: 'ok'
			});
			// upstream
			expect(upstream).toEqual({
				name,
				configured_health_checks: true,
				stats: {
					all: 1,
					up: 1,
					down: 0,
					failed: 0,
					draining: 0,
					checking: 0
				}
			});
		});

		it('falsy max_conns', () => {
			peer.max_conns = null;

			handlePeer('', STATS, previousState, upstream, peer);

			// peer.max_conns
			expect(peer.max_conns).toBe(Infinity);
		});

		it('no health_checks.last_passed', () => {
			delete peer.health_checks.last_passed;

			handlePeer('', STATS, previousState, upstream, peer);

			expect(peer.health_status).toBeNull();
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
		});

		it('falsy health_checks.last_passed', () => {
			peer.health_checks.last_passed = null;
			handlePeer('', STATS, previousState, upstream, peer);
			// peer.health_status
			expect(peer.health_status).toBe(false);
			// STATS.status
			expect(STATS.status).toBe('danger');
			// STATS.alerts
			expect(STATS.alerts).toBe(1);

			peer.health_checks.last_passed = undefined;
			handlePeer('', STATS, previousState, upstream, peer);
			// peer.health_status
			expect(peer.health_status).toBe(false);
			// STATS.status
			expect(STATS.status).toBe('danger');
			// STATS.alerts
			expect(STATS.alerts).toBe(2);
		});

		it('peer state "down"', () => {
			peer.state = 'down';

			handlePeer('', STATS, previousState, upstream, peer);

			// STATS
			expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
				servers: {
					all: 1,
					up: 0,
					down: 1,
					failed: 0,
					draining: 0
				},
				failures: 0,
				warnings: 0,
				alerts: 0,
				status: 'ok'
			});
			// upstream
			expect(upstream).toEqual({
				name,
				configured_health_checks: true,
				stats: {
					all: 1,
					up: 0,
					down: 1,
					failed: 0,
					draining: 0,
					checking: 0
				}
			});
		});

		it('peer state "unavail"', () => {
			peer.state = 'unavail';

			handlePeer('', STATS, previousState, upstream, peer);

			// STATS
			expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
				servers: {
					all: 1,
					up: 0,
					down: 0,
					failed: 1,
					draining: 0
				},
				failures: 1,
				warnings: 0,
				alerts: 0,
				status: 'ok'
			});
			// upstream
			expect(upstream).toEqual({
				name,
				configured_health_checks: true,
				stats: {
					all: 1,
					up: 0,
					down: 0,
					failed: 1,
					draining: 0,
					checking: 0
				},
				hasFailedPeer: true
			});
		});

		it('peer state "unhealthy"', () => {
			peer.state = 'unhealthy';

			handlePeer('', STATS, previousState, upstream, peer);

			// STATS
			expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
				servers: {
					all: 1,
					up: 0,
					down: 0,
					failed: 1,
					draining: 0
				},
				failures: 1,
				warnings: 0,
				alerts: 0,
				status: 'ok'
			});
			// upstream
			expect(upstream).toEqual({
				name,
				configured_health_checks: true,
				stats: {
					all: 1,
					up: 0,
					down: 0,
					failed: 1,
					draining: 0,
					checking: 0
				},
				hasFailedPeer: true
			});
		});

		it('peer state "draining"', () => {
			peer.state = 'draining';

			handlePeer('', STATS, previousState, upstream, peer);

			// STATS
			expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
				servers: {
					all: 1,
					up: 0,
					down: 0,
					failed: 0,
					draining: 1
				},
				failures: 0,
				warnings: 0,
				alerts: 0,
				status: 'ok'
			});
			// upstream
			expect(upstream).toEqual({
				name,
				configured_health_checks: true,
				stats: {
					all: 1,
					up: 0,
					down: 0,
					failed: 0,
					draining: 1,
					checking: 0
				}
			});
		});

		it('peer state "checking"', () => {
			peer.state = 'checking';

			handlePeer('', STATS, previousState, upstream, peer);

			// STATS
			expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
				servers: {
					all: 1,
					up: 0,
					down: 0,
					failed: 0,
					draining: 0
				},
				failures: 0,
				warnings: 0,
				alerts: 0,
				status: 'ok'
			});
			// upstream
			expect(upstream).toEqual({
				name,
				configured_health_checks: true,
				stats: {
					all: 1,
					up: 0,
					down: 0,
					failed: 0,
					draining: 0,
					checking: 1
				}
			});
		});

		it('4xx threshold reached, upstreamsKey "upstreams"', () => {
			is4xxThresholdReached = true;

			handlePeer('upstreams', STATS, previousState, upstream, peer);

			// STATS
			expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
				servers: {
					all: 1,
					up: 1,
					down: 0,
					failed: 0,
					draining: 0
				},
				failures: 0,
				warnings: 1,
				alerts: 0,
				status: 'warning'
			});

			is4xxThresholdReached = false;
		});

		it('4xx threshold reached, custom upstreamsKey', () => {
			is4xxThresholdReached = true;

			handlePeer('', STATS, previousState, upstream, peer);

			// STATS
			expect({ ...STATS, failures: STATS.failures.toString() }).toEqual({
				servers: {
					all: 1,
					up: 1,
					down: 0,
					failed: 0,
					draining: 0
				},
				failures: 0,
				warnings: 0,
				alerts: 0,
				status: 'ok'
			});

			is4xxThresholdReached = false;
		});
	});

	it('handleUpstreams()', () => {
		const upstreamsKey = 'upstreams_key';
		const STATS = 'stats_test';
		const previousState = 'previous_state_test';
		const slabs = 'slabs_test';
		const upstream = {
			duck_test_for_upstream: true,
			zone: 'upstreamZone',
			peers: [1, 2]
		};
		const name = 'upstream_name';
		let handlePeerSpy;

		const spyUtilsPickZoneSite = jest.spyOn(utils, 'pickZoneSize').mockClear().mockImplementation(() => { });
		const spyHandlePeerBind = jest.spyOn(handlePeer, 'bind').mockClear().mockImplementation(() => {
			handlePeerSpy = jest.fn();

			return handlePeerSpy;
		});

		const result = handleUpstreams(upstreamsKey, STATS, previousState, slabs, upstream, name);

		// upstream.name
		expect(result.name).toBe(name);
		// pickZoneSize called once
		expect(spyUtilsPickZoneSite).toHaveBeenCalled();
		// pickZoneSize 1st arg
		expect('duck_test_for_upstream' in spyUtilsPickZoneSite.mock.calls[0][0]).toBe(true);
		// pickZoneSize 2nd arg
		expect(spyUtilsPickZoneSite.mock.calls[0][1]).toBe(slabs);
		// pickZoneSize 3rd arg
		expect(spyUtilsPickZoneSite.mock.calls[0][2]).toBe(upstream.zone);
		// upstream.stats
		expect(result.stats).toEqual({
			all: 0,
			up: 0,
			down: 0,
			failed: 0,
			draining: 0,
			checking: 0
		});
		// handlePeer.bind called once
		expect(spyHandlePeerBind).toHaveBeenCalled();
		expect(spyHandlePeerBind.mock.calls[0][0]).toBeNull();
		// handlePeer.bind 2nd arg
		expect(spyHandlePeerBind.mock.calls[0][1]).toBe(upstreamsKey);
		// handlePeer.bind 3rd arg
		expect(spyHandlePeerBind.mock.calls[0][2]).toEqual(STATS);
		// handlePeer.bind 4th arg
		expect(spyHandlePeerBind.mock.calls[0][3]).toBe(previousState);
		// handlePeer.bind 5th arg
		expect(spyHandlePeerBind.mock.calls[0][4]).toEqual(upstream);
		// handlePeer called twice
		expect(handlePeerSpy).toHaveBeenCalledTimes(2);

		upstream.peers.forEach((peer, i) => {
			// [peer ${ i }] handlePeer 1st arg
			expect(handlePeerSpy.mock.calls[i][0]).toBe(peer);
		});

		// returned upstream
		expect(result).toEqual(upstream);

		spyUtilsPickZoneSite.mockRestore();
		spyHandlePeerBind.mockRestore();
	});

	describe('upstreamsCalculator()', () => {
		const upstreamsKey = 'upstreams';
		const previousState = 'previous_state_test';
		const STORE = {
			slabs: 'slabs_test',
			__STATUSES: {
				[upstreamsKey]: {}
			}
		};
		const defaultStats = {
			total: 0,
			servers: {
				all: 0,
				up: 0,
				down: 0,
				failed: 0,
				draining: 0
			},
			failures: 0,
			warnings: 0,
			alerts: 0,
			status: 'ok'
		};
		let upstreamsMap; let spyUtilsCreateMapFromObject; let
			spyHandleUpstreamsBind;
		const handleUpstreamsBound = 'bound handleUpstreams';

		beforeAll(() => {
			spyUtilsCreateMapFromObject = jest.spyOn(utils, 'createMapFromObject').mockClear().mockImplementation(() => upstreamsMap);
			spyHandleUpstreamsBind = jest.spyOn(handleUpstreams, 'bind').mockClear().mockImplementation(() => handleUpstreamsBound);
		});

		beforeEach(() => {
			spyUtilsCreateMapFromObject.mockClear();
			spyHandleUpstreamsBind.mockClear();
		});

		afterAll(() => {
			spyUtilsCreateMapFromObject.mockRestore();
			spyHandleUpstreamsBind.mockRestore();
		});

		it('no upstreams', () => {
			const result = upstreamsCalculator(upstreamsKey, null, previousState, STORE);

			// __STATUSES ready
			expect(STORE.__STATUSES[upstreamsKey].ready).toBe(false);
			expect(STORE.__STATUSES[upstreamsKey].status).toBeUndefined();
			// handleUpstreams.bind not called
			expect(spyHandleUpstreamsBind).not.toHaveBeenCalled();
			// createMapFromObject not called
			expect(spyUtilsCreateMapFromObject).not.toHaveBeenCalled();
			expect(result).toBeNull();
		});

		it('empty upstreams', () => {
			const result = upstreamsCalculator(upstreamsKey, {}, previousState, STORE);

			// __STATUSES ready
			expect(STORE.__STATUSES[upstreamsKey].ready).toBe(false);
			expect(STORE.__STATUSES[upstreamsKey].status).toBeUndefined();
			// handleUpstreams.bind not called
			expect(spyHandleUpstreamsBind).not.toHaveBeenCalled();
			// createMapFromObject not called
			expect(spyUtilsCreateMapFromObject).not.toHaveBeenCalled();
			expect(result).toBeNull();
		});

		it('filled upstreams', () => {
			const upstreams = {
				test_upstream: {},
				test_upstream_1: {}
			};

			upstreamsMap = new Map([
				['test_upstream', {}],
				['test_upstream_1', {}]
			]);

			const result = upstreamsCalculator(upstreamsKey, upstreams, previousState, STORE);
			const STATS = { ...defaultStats, total: upstreamsMap.size };

			// handleUpstreams.bind called once
			expect(spyHandleUpstreamsBind).toHaveBeenCalled();
			expect(spyHandleUpstreamsBind.mock.calls[0][0]).toBeNull();
			// handleUpstreams.bind 2nd arg
			expect(spyHandleUpstreamsBind.mock.calls[0][1]).toBe(upstreamsKey);
			// handleUpstreams.bind 3rd arg
			const stats = spyHandleUpstreamsBind.mock.calls[0][2];
			expect({ ...stats, failures: stats.failures.toString() }).toEqual(STATS);
			// handleUpstreams.bind 4th arg
			expect(spyHandleUpstreamsBind.mock.calls[0][3]).toBe(previousState);
			// handleUpstreams.bind 5th arg
			expect(spyHandleUpstreamsBind.mock.calls[0][4]).toBe(STORE.slabs);
			// createMapFromObject called once
			expect(spyUtilsCreateMapFromObject).toHaveBeenCalled();
			// createMapFromObject 1st arg
			expect(spyUtilsCreateMapFromObject.mock.calls[0][0]).toEqual(upstreams);
			// createMapFromObject 2nd arg
			expect(spyUtilsCreateMapFromObject.mock.calls[0][1]).toBe(handleUpstreamsBound);
			// __STATUSES ready
			expect(STORE.__STATUSES[upstreamsKey].ready).toBe(true);
			// __STATUSES status
			expect(STORE.__STATUSES[upstreamsKey].status).toBe('ok');
			// upstreams.__STATS
			expect({ ...result.__STATS, failures: result.__STATS.failures.toString() }).toEqual(STATS);

			upstreamsMap.__STATS = STATS;

			// returned upstreams
			expect(result).toEqual(upstreamsMap);
		});
	});

	it('upstreamsCalculatorFactory()', () => {
		const expectedResult = 'expectedResult';
		const key = 'test_upstream';

		const spyUpstreamsCalculatorBind = jest.spyOn(upstreamsCalculator, 'bind').mockClear().mockImplementation(() => expectedResult);

		// result
		expect(upstreamsCalculatorFactory(key)).toBe(expectedResult);
		// upstreamsCalculator.bind called once
		expect(spyUpstreamsCalculatorBind).toHaveBeenCalled();
		expect(spyUpstreamsCalculatorBind
			.mock.calls[0][0]).toBeNull();
		// upstreamsCalculator.bind 2nd arg
		expect(spyUpstreamsCalculatorBind
			.mock.calls[0][1]).toBe(key);

		spyUpstreamsCalculatorBind.mockRestore();
	});

	it('addHistory()', () => {
		const memo = {
			history: {}
		};
		const historyLimit = 3;
		const ts_1 = 1597739942;
		const zone_1 = {
			prop_1: 25,
			prop_2: 0,
			prop_3: 8
		};
		const zoneName = 'test_zone';
		let result = addHistory(memo, historyLimit, ts_1, zone_1, zoneName);

		// history type
		expect(memo.history[zoneName]).toBeInstanceOf(Array);
		// history length
		expect(memo.history[zoneName]).toHaveLength(1);
		// history 1st item
		expect(memo.history[zoneName][0]).toEqual({ obj: zone_1, _ts: ts_1 });
		// result.obj
		expect(result.obj).toEqual(zone_1);
		// result.history.ts
		expect(result.history.ts).toBe(ts_1);
		// result.history.data
		expect(result.history.data).toBeInstanceOf(Array);
		// result.history.data
		expect(result.history.data).toHaveLength(1);
		// result.history.data 1st item
		expect(result.history.data[0]).toEqual({
			obj: {
				prop_1: 0,
				prop_2: 0,
				prop_3: 0
			},
			_ts: ts_1
		});

		const ts_0 = ts_1 - 1;
		const zone_0 = {
			prop_1: zone_1.prop_1 - 5,
			prop_2: 0,
			prop_3: zone_1.prop_3 - 6
		};
		const sortSpy = jest.spyOn(memo.history[zoneName], 'sort').mockClear();

		result = addHistory(memo, historyLimit, ts_0, zone_0, zoneName);

		// history type
		expect(memo.history[zoneName]).toBeInstanceOf(Array);
		// history length
		expect(memo.history[zoneName]).toHaveLength(2);
		// history 1st item
		expect(memo.history[zoneName][0]).toEqual({ obj: zone_0, _ts: ts_0 });
		// history 2nd item
		expect(memo.history[zoneName][1]).toEqual({ obj: zone_1, _ts: ts_1 });
		// history.sort called once
		expect(sortSpy).toHaveBeenCalled();
		// history.sort fn
		expect(sortSpy.mock.calls[0][0]({ _ts: 1 }, { _ts: 2 })).toBe(-1);
		// history.sort fn
		expect(sortSpy.mock.calls[0][0]({ _ts: 2 }, { _ts: 1 })).toBe(1);
		// result.obj
		expect(result.obj).toEqual(zone_0);
		// result.history.ts
		expect(result.history.ts).toBe(ts_0);
		// result.history.data
		expect(result.history.data).toBeInstanceOf(Array);
		// result.history.data
		expect(result.history.data).toHaveLength(2);
		// result.history.data 1st item
		expect(result.history.data[0]).toEqual({
			obj: {
				prop_1: 0,
				prop_2: 0,
				prop_3: 0
			},
			_ts: ts_0
		});
		// result.history.data 2nd item
		expect(result.history.data[1]).toEqual({
			obj: {
				prop_1: 5,
				prop_2: 0,
				prop_3: 6
			},
			_ts: ts_1
		});

		sortSpy.mockRestore();

		const ts_2 = ts_1 + 1;
		const zone_2 = {
			prop_1: zone_1.prop_1 - 2,
			prop_2: zone_1.prop_2 + 10,
			prop_3: zone_1.prop_3
		};

		result = addHistory(memo, historyLimit, ts_2, zone_2, zoneName);

		// history type
		expect(memo.history[zoneName]).toBeInstanceOf(Array);
		// history length
		expect(memo.history[zoneName]).toHaveLength(3);
		// history 1st item
		expect(memo.history[zoneName][0]).toEqual({ obj: zone_0, _ts: ts_0 });
		// history 2nd item
		expect(memo.history[zoneName][1]).toEqual({ obj: zone_1, _ts: ts_1 });
		// history 3rd item
		expect(memo.history[zoneName][2]).toEqual({ obj: zone_2, _ts: ts_2 });
		// result.obj
		expect(result.obj).toEqual(zone_2);
		// result.history.ts
		expect(result.history.ts).toBe(ts_2);
		// result.history.data
		expect(result.history.data).toBeInstanceOf(Array);
		// result.history.data
		expect(result.history.data).toHaveLength(3);
		// result.history.data 1st item
		expect(result.history.data[0]).toEqual({
			obj: {
				prop_1: 0,
				prop_2: 0,
				prop_3: 0
			},
			_ts: ts_0
		});
		// result.history.data 2nd item
		expect(result.history.data[1]).toEqual({
			obj: {
				prop_1: 5,
				prop_2: 0,
				prop_3: 6
			},
			_ts: ts_1
		});
		// result.history.data 3rd item
		expect(result.history.data[2]).toEqual({
			obj: {
				prop_1: 0,
				prop_2: 10,
				prop_3: 0
			},
			_ts: ts_2
		});

		const ts_3 = ts_2 + 1;
		const zone_3 = {
			prop_1: zone_2.prop_1 + 1,
			prop_2: zone_2.prop_2 + 2,
			prop_3: zone_2.prop_3 + 3
		};

		result = addHistory(memo, historyLimit, ts_3, zone_3, zoneName);

		// history type
		expect(memo.history[zoneName]).toBeInstanceOf(Array);
		// history length
		expect(memo.history[zoneName]).toHaveLength(3);
		// history 1st item
		expect(memo.history[zoneName][0]).toEqual({ obj: zone_1, _ts: ts_1 });
		// history 2nd item
		expect(memo.history[zoneName][1]).toEqual({ obj: zone_2, _ts: ts_2 });
		// history 3rd item
		expect(memo.history[zoneName][2]).toEqual({ obj: zone_3, _ts: ts_3 });
		// result.obj
		expect(result.obj).toEqual(zone_3);
		// result.history.ts
		expect(result.history.ts).toBe(ts_3);
		// result.history.data
		expect(result.history.data).toBeInstanceOf(Array);
		// result.history.data
		expect(result.history.data).toHaveLength(3);
		// result.history.data 1st item
		expect(result.history.data[0]).toEqual({
			obj: {
				prop_1: 0,
				prop_2: 0,
				prop_3: 0
			},
			_ts: ts_1
		});
		// result.history.data 2nd item
		expect(result.history.data[1]).toEqual({
			obj: {
				prop_1: 0,
				prop_2: 10,
				prop_3: 0
			},
			_ts: ts_2
		});
		// result.history.data 3rd item
		expect(result.history.data[2]).toEqual({
			obj: {
				prop_1: 1,
				prop_2: 2,
				prop_3: 3
			},
			_ts: ts_3
		});
	});

	describe('limitConnReqCalculator()', () => {
		let spyAddHistoryBind; let spyUtilsCreateMapFromObject; let
			spyAppSettingsGetSettings;
		const updatingPeriod = 1000;
		const expectedResult = 'expected_result';
		const addHistoryBound = 'bound addHistory';
		let memo;
		const timeStart = 1597739942000;
		const data = {
			zone_1: {},
			zone_2: {}
		};

		beforeAll(() => {
			spyAppSettingsGetSettings = jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => updatingPeriod);
			spyUtilsCreateMapFromObject = jest.spyOn(utils, 'createMapFromObject').mockClear().mockImplementation(() => expectedResult);
			spyAddHistoryBind = jest.spyOn(addHistory, 'bind').mockClear().mockImplementation(() => addHistoryBound);
		});

		beforeEach(() => {
			spyAppSettingsGetSettings.mockClear();
			spyUtilsCreateMapFromObject.mockClear();
			spyAddHistoryBind.mockClear();

			memo = {
				prevUpdatingPeriod: 5000
			};
		});

		afterAll(() => {
			spyAppSettingsGetSettings.mockRestore();
			spyUtilsCreateMapFromObject.mockRestore();
			spyAddHistoryBind.mockRestore();
		});

		it('no data', () => {
			const result = limitConnReqCalculator(memo, null, null, null, timeStart);

			// getSetting not called
			expect(spyAppSettingsGetSettings).not.toHaveBeenCalled();
			// createMapFromObject not called
			expect(spyUtilsCreateMapFromObject).not.toHaveBeenCalled();
			// addHistory.bind not called
			expect(spyAddHistoryBind).not.toHaveBeenCalled();
			// memo
			expect(memo).toEqual({
				prevUpdatingPeriod: 5000
			});
			expect(result).toBeNull();
		});

		it('empty data', () => {
			const result = limitConnReqCalculator(memo, {}, null, null, timeStart);

			// getSetting not called
			expect(spyAppSettingsGetSettings).not.toHaveBeenCalled();
			// createMapFromObject not called
			expect(spyUtilsCreateMapFromObject).not.toHaveBeenCalled();
			// addHistory.bind not called
			expect(spyAddHistoryBind).not.toHaveBeenCalled();
			// memo
			expect(memo).toEqual({
				prevUpdatingPeriod: 5000
			});
			expect(result).toBeNull();
		});

		it('updatingPeriod changed', () => {
			const result = limitConnReqCalculator(memo, data, null, null, timeStart);

			// getSetting called once
			expect(spyAppSettingsGetSettings).toHaveBeenCalled();
			// getSetting 1st arg
			expect(spyAppSettingsGetSettings.mock.calls[0][0]).toBe('updatingPeriod');
			// memo
			expect(memo).toEqual({
				prevUpdatingPeriod: updatingPeriod,
				history: {}
			});
			// addHistory.bind called once
			expect(spyAddHistoryBind).toHaveBeenCalled();
			expect(spyAddHistoryBind.mock.calls[0][0]).toBeNull();
			// addHistory.bind 2nd arg
			expect(spyAddHistoryBind.mock.calls[0][1]).toEqual(memo);
			// addHistory.bind 3rd arg
			expect(spyAddHistoryBind.mock.calls[0][2]).toBe(limitConnReqHistoryLimit);
			// addHistory.bind 4th arg
			expect(spyAddHistoryBind.mock.calls[0][3]).toBe(1597739942);
			// createMapFromObject called once
			expect(spyUtilsCreateMapFromObject).toHaveBeenCalled();
			// createMapFromObject 1st arg
			expect(spyUtilsCreateMapFromObject.mock.calls[0][0]).toEqual(data);
			// createMapFromObject 2nd arg
			expect(spyUtilsCreateMapFromObject.mock.calls[0][1]).toBe(addHistoryBound);
			// returned data
			expect(result).toBe(expectedResult);
		});

		it('updatingPeriod not changed', () => {
			memo.prevUpdatingPeriod = updatingPeriod;
			const result = limitConnReqCalculator(memo, data, null, null, timeStart);

			// getSetting called once
			expect(spyAppSettingsGetSettings).toHaveBeenCalled();
			// getSetting 1st arg
			expect(spyAppSettingsGetSettings.mock.calls[0][0]).toBe('updatingPeriod');
			// memo
			expect(memo).toEqual({
				prevUpdatingPeriod: updatingPeriod
			});
			// addHistory.bind called once
			expect(spyAddHistoryBind).toHaveBeenCalled();
			expect(spyAddHistoryBind.mock.calls[0][0]).toBeNull();
			// addHistory.bind 2nd arg
			expect(spyAddHistoryBind.mock.calls[0][1]).toEqual(memo);
			// addHistory.bind 3rd arg
			expect(spyAddHistoryBind.mock.calls[0][2]).toBe(limitConnReqHistoryLimit);
			// addHistory.bind 4th arg
			expect(spyAddHistoryBind.mock.calls[0][3]).toBe(1597739942);
			// createMapFromObject 1st arg
			expect(spyUtilsCreateMapFromObject.mock.calls[0][0]).toEqual(data);
			// createMapFromObject 2nd arg
			expect(spyUtilsCreateMapFromObject.mock.calls[0][1]).toBe(addHistoryBound);
			// returned data
			expect(result).toBe(expectedResult);
		});
	});

	it('limitConnReqFactory()', () => {
		const expectedResult = 'expectedResult';
		const memo = 'test_memo';

		const spyLimitConnReqCalcutorBind = jest.spyOn(limitConnReqCalculator, 'bind').mockClear().mockImplementation(() => expectedResult);

		// result
		expect(limitConnReqFactory(memo)).toBe(expectedResult);
		// limitConnReqCalculator.bind called once
		expect(spyLimitConnReqCalcutorBind).toHaveBeenCalled();
		expect(spyLimitConnReqCalcutorBind.mock.calls[0][0]).toBeNull();
		// limitConnReqCalculator.bind 2nd arg
		expect(spyLimitConnReqCalcutorBind.mock.calls[0][1]).toBe(memo);
	});
});
