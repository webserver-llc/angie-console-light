/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
import {
	handlePeer,
	handleUpstreams,
	upstreamsCalculator,
	upstreamsCalculatorFactory,
	handleZone,
	limitConnReqHistoryLimit,
	limitConnReqFactory,
	limitConnReqCalculator
} from '../factories.js';
import * as utils from '../utils.js';
import appsettings from '../../appsettings';

describe('Calculators – factories', () => {
	describe('handlePeer', () => {
		const ts = 1597654154847;
		const period = 1000;
		const slabs = 'slabs_mock';
		const name = 'test_upstream';
		const previousState = new Map([
			[ name, { peers: [
				{
					id: 1,
					requests: 30,
					connections: 2,
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
					'previous_peer_state_duck_test': true
				}, {
					id: 2,
					requests: 0,
					connections: 0,
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
			] } ]
		]);
		let STATS, upstream, peer;
		let is4xxThresholdReached = false;

		previousState.lastUpdate = ts - period;

		before(() => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'is4xxThresholdReached').callsFake(() => is4xxThresholdReached);
			stub(utils, 'handleErrors').callsFake(() => {});
		});

		beforeEach(() => {
			Date.now.resetHistory();
			utils.calculateSpeed.resetHistory();
			utils.is4xxThresholdReached.resetHistory();
			utils.handleErrors.resetHistory();

			STATS = {
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
			upstream = {
				name,
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
				connections: 9,
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

		after(() => {
			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		([
			'no previousState',
			'no upstream in previousState',
			'no previousPeer'
		]).forEach((title, i) => {
			it(title, () => {
				let _previousState = null;

				switch(i){
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

				expect(Date.now.notCalled, 'Date.now not called').to.be.true;
				expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
				expect(peer.max_conns, 'peer.max_conns').to.be.equal(10);
				expect(peer.health_status, 'peer.health_status').to.be.true;
				expect(peer.isHttp, 'peer.isHttp').to.be.an('undefined');
				expect(utils.is4xxThresholdReached.notCalled, 'is4xxThresholdReached not called').to.be.true;
				expect(utils.handleErrors.notCalled, 'handleErrors not called').to.be.true;
				expect(STATS, 'STATS').to.be.deep.equal({
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
				expect(upstream, 'upstream').to.be.deep.equal({
					name: i === 1 ? 'unknown_upstream' : name,
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

			expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
			expect(utils.calculateSpeed.callCount, 'calculateSpeed call count').to.be.equal(3);
			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st call 1st arg').to.be.equal(30);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 1st call 2nd arg').to.be.equal(100);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 1st call 3rd arg').to.be.equal(period);
			expect(peer.server_req_s, 'peer.server_req_s').to.be.equal(100);
			expect(peer.server_conn_s, 'peer.server_conn_s').to.be.an('undefined');
			expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 2nd call 1st arg').to.be.equal(101);
			expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd call 2nd arg').to.be.equal(100500);
			expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 2nd call 3rd arg').to.be.equal(period);
			expect(peer.server_sent_s, 'peer.server_sent_s').to.be.equal(100500);
			expect(utils.calculateSpeed.args[2][0], 'calculateSpeed 3rd call 1st arg').to.be.equal(99);
			expect(utils.calculateSpeed.args[2][1], 'calculateSpeed 3rd call 2nd arg').to.be.equal(99500);
			expect(utils.calculateSpeed.args[2][2], 'calculateSpeed 3rd call 3rd arg').to.be.equal(period);
			expect(peer.server_rcvd_s, 'peer.server_rcvd_s').to.be.equal(99500);
			expect(peer.isHttp, 'peer.isHttp').to.be.true;
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0], 'is4xxThresholdReached 1st arg').to.be.deep.equal(peer);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect('previous_peer_state_duck_test' in utils.handleErrors.args[0][0], 'handleErrors 1st arg')
				.to.be.true;
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(peer);
			expect(STATS, 'STATS').to.be.deep.equal({
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
			expect(upstream, 'upstream').to.be.deep.equal({
				name,
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

			expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
			expect(utils.calculateSpeed.callCount, 'calculateSpeed call count').to.be.equal(3);
			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st call 1st arg').to.be.equal(2);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 1st call 2nd arg').to.be.equal(9);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 1st call 3rd arg').to.be.equal(period);
			expect(peer.server_req_s, 'peer.server_req_s').to.be.an('undefined');
			expect(peer.server_conn_s, 'peer.server_conn_s').to.be.equal(9);
			expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 2nd call 1st arg').to.be.equal(101);
			expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd call 2nd arg').to.be.equal(100500);
			expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 2nd call 3rd arg').to.be.equal(period);
			expect(peer.server_sent_s, 'peer.server_sent_s').to.be.equal(100500);
			expect(utils.calculateSpeed.args[2][0], 'calculateSpeed 3rd call 1st arg').to.be.equal(99);
			expect(utils.calculateSpeed.args[2][1], 'calculateSpeed 3rd call 2nd arg').to.be.equal(99500);
			expect(utils.calculateSpeed.args[2][2], 'calculateSpeed 3rd call 3rd arg').to.be.equal(period);
			expect(peer.server_rcvd_s, 'peer.server_rcvd_s').to.be.equal(99500);
			expect(peer.max_conns, 'peer.max_conns').to.be.equal(10);
			expect(peer.health_status, 'peer.health_status').to.be.true;
			expect(peer.isHttp, 'peer.isHttp').to.be.an('undefined');
			expect(utils.is4xxThresholdReached.notCalled, 'is4xxThresholdReached not called').to.be.true;
			expect(utils.handleErrors.notCalled, 'handleErrors not called').to.be.true;
			expect(STATS, 'STATS').to.be.deep.equal({
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
			expect(upstream, 'upstream').to.be.deep.equal({
				name,
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

			expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
			expect(utils.calculateSpeed.callCount, 'calculateSpeed call count').to.be.equal(2);
			expect(peer.server_req_s, 'peer.server_req_s').to.be.an('undefined');
			expect(peer.server_conn_s, 'peer.server_conn_s').to.be.an('undefined');
			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st call 1st arg').to.be.equal(101);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 1st call 2nd arg').to.be.equal(100500);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 1st call 3rd arg').to.be.equal(period);
			expect(peer.server_sent_s, 'peer.server_sent_s').to.be.equal(100500);
			expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 2nd call 1st arg').to.be.equal(99);
			expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd call 2nd arg').to.be.equal(99500);
			expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 2nd call 3rd arg').to.be.equal(period);
			expect(peer.server_rcvd_s, 'peer.server_rcvd_s').to.be.equal(99500);
			expect(peer.max_conns, 'peer.max_conns').to.be.equal(10);
			expect(peer.health_status, 'peer.health_status').to.be.true;
			expect(peer.isHttp, 'peer.isHttp').to.be.an('undefined');
			expect(utils.is4xxThresholdReached.notCalled, 'is4xxThresholdReached not called').to.be.true;
			expect(utils.handleErrors.notCalled, 'handleErrors not called').to.be.true;
			expect(STATS, 'STATS').to.be.deep.equal({
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
			expect(upstream, 'upstream').to.be.deep.equal({
				name,
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

			expect(peer.max_conns, 'peer.max_conns').to.be.equal(Infinity);
		});

		it('no health_checks.last_passed', () => {
			delete peer.health_checks.last_passed;

			handlePeer('', STATS, previousState, upstream, peer);

			expect(peer.health_status, 'peer.health_status').to.be.a('null');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
		});

		it('falsy health_checks.last_passed', () => {
			peer.health_checks.last_passed = null;
			handlePeer('', STATS, previousState, upstream, peer);
			expect(peer.health_status, 'peer.health_status').to.be.false;
			expect(STATS.status, 'STATS.status').to.be.equal('danger');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(1);

			peer.health_checks.last_passed = undefined;
			handlePeer('', STATS, previousState, upstream, peer);
			expect(peer.health_status, 'peer.health_status').to.be.false;
			expect(STATS.status, 'STATS.status').to.be.equal('danger');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(2);
		});

		it('peer state "down"', () => {
			peer.state = 'down';

			handlePeer('', STATS, previousState, upstream, peer);

			expect(STATS, 'STATS').to.be.deep.equal({
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
			expect(upstream, 'upstream').to.be.deep.equal({
				name,
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

			expect(STATS, 'STATS').to.be.deep.equal({
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
			expect(upstream, 'upstream').to.be.deep.equal({
				name,
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

			expect(STATS, 'STATS').to.be.deep.equal({
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
			expect(upstream, 'upstream').to.be.deep.equal({
				name,
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

			expect(STATS, 'STATS').to.be.deep.equal({
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
			expect(upstream, 'upstream').to.be.deep.equal({
				name,
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

			expect(STATS, 'STATS').to.be.deep.equal({
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
			expect(upstream, 'upstream').to.be.deep.equal({
				name,
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

			expect(STATS, 'STATS').to.be.deep.equal({
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

			expect(STATS, 'STATS').to.be.deep.equal({
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
		const STATS = 'stats_mock';
		const previousState = 'previous_state_mock';
		const slabs = 'slabs_mock';
		const upstream = {
			duck_test_for_upstream: true,
			zone: 'upstreamZone',
			peers: [ 1, 2 ]
		};
		const name = 'upstream_name';
		let handlePeerSpy;

		stub(utils, 'pickZoneSize').callsFake(() => {});
		stub(handlePeer, 'bind').callsFake(() => {
			handlePeerSpy = spy();

			return handlePeerSpy;
		});

		const result = handleUpstreams(upstreamsKey, STATS, previousState, slabs, upstream, name);

		expect(result.name, 'upstream.name').to.be.equal(name);
		expect(utils.pickZoneSize.calledOnce, 'pickZoneSize called once').to.be.true;
		expect('duck_test_for_upstream' in utils.pickZoneSize.args[0][0], 'pickZoneSize 1st arg').to.be.true;
		expect(utils.pickZoneSize.args[0][1], 'pickZoneSize 2nd arg').to.be.equal(slabs);
		expect(utils.pickZoneSize.args[0][2], 'pickZoneSize 3rd arg').to.be.equal(upstream.zone);
		expect(result.stats, 'upstream.stats').to.be.deep.equal({
			all: 0,
			up: 0,
			down: 0,
			failed: 0,
			draining: 0,
			checking: 0
		});
		expect(handlePeer.bind.calledOnce, 'handlePeer.bind called once').to.be.true;
		expect(handlePeer.bind.args[0][0], 'handlePeer.bind 1st arg').to.be.a('null');
		expect(handlePeer.bind.args[0][1], 'handlePeer.bind 2nd arg').to.be.equal(upstreamsKey);
		expect(handlePeer.bind.args[0][2], 'handlePeer.bind 3rd arg').to.be.deep.equal(STATS);
		expect(handlePeer.bind.args[0][3], 'handlePeer.bind 4th arg').to.be.equal(previousState);
		expect(handlePeer.bind.args[0][4], 'handlePeer.bind 5th arg').to.be.deep.equal(upstream);
		expect(handlePeerSpy.calledTwice, 'handlePeer called twice').to.be.true;

		upstream.peers.forEach((peer, i) => {
			expect(handlePeerSpy.args[i][0], `[peer ${ i }] handlePeer 1st arg`).to.be.equal(peer);
		});

		expect(result, 'returned upstream').to.be.deep.equal(upstream);

		utils.pickZoneSize.restore();
		handlePeer.bind.restore();
	});

	describe('upstreamsCalculator()', () => {
		const upstreamsKey = 'upstreams';
		const previousState = 'previous_state_mock';
		const STORE = {
			slabs: 'slabs_mock',
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
		let upstreamsMap;
		const handleUpstreamsBound = 'bound handleUpstreams';

		before(() => {
			stub(utils, 'createMapFromObject').callsFake(() => upstreamsMap);
			stub(handleUpstreams, 'bind').callsFake(() => handleUpstreamsBound);
		});

		beforeEach(() => {
			utils.createMapFromObject.resetHistory();
			handleUpstreams.bind.resetHistory();
		});

		after(() => {
			utils.createMapFromObject.restore();
			handleUpstreams.bind.restore();
		});

		it('no upstreams', () => {
			const result = upstreamsCalculator(upstreamsKey, null, previousState, STORE);

			expect(STORE.__STATUSES[upstreamsKey].ready, '__STATUSES ready').to.be.false;
			expect(STORE.__STATUSES[upstreamsKey].status, '__STATUSES status').to.be.an('undefined');
			expect(handleUpstreams.bind.notCalled, 'handleUpstreams.bind not called').to.be.true;
			expect(utils.createMapFromObject.notCalled, 'createMapFromObject not called').to.be.true;
			expect(result, 'returned upstreams').to.be.a('null');
		});

		it('empty upstreams', () => {
			const result = upstreamsCalculator(upstreamsKey, {}, previousState, STORE);

			expect(STORE.__STATUSES[upstreamsKey].ready, '__STATUSES ready').to.be.false;
			expect(STORE.__STATUSES[upstreamsKey].status, '__STATUSES status').to.be.an('undefined');
			expect(handleUpstreams.bind.notCalled, 'handleUpstreams.bind not called').to.be.true;
			expect(utils.createMapFromObject.notCalled, 'createMapFromObject not called').to.be.true;
			expect(result, 'returned upstreams').to.be.a('null');
		});

		it('filled upstreams', () => {
			const upstreams = {
				'test_upstream': {},
				'test_upstream_1': {}
			};

			upstreamsMap = new Map([
				[ 'test_upstream', {} ],
				[ 'test_upstream_1', {} ]
			]);

			const result = upstreamsCalculator(upstreamsKey, upstreams, previousState, STORE);
			const STATS = Object.assign({}, defaultStats, { total: upstreamsMap.size });

			expect(handleUpstreams.bind.calledOnce, 'handleUpstreams.bind called once').to.be.true;
			expect(handleUpstreams.bind.args[0][0], 'handleUpstreams.bind 1st arg').to.be.a('null');
			expect(handleUpstreams.bind.args[0][1], 'handleUpstreams.bind 2nd arg').to.be.equal(upstreamsKey);
			expect(handleUpstreams.bind.args[0][2], 'handleUpstreams.bind 3rd arg').to.be.deep.equal(STATS);
			expect(handleUpstreams.bind.args[0][3], 'handleUpstreams.bind 4th arg').to.be.equal(previousState);
			expect(handleUpstreams.bind.args[0][4], 'handleUpstreams.bind 5th arg').to.be.equal(STORE.slabs);
			expect(utils.createMapFromObject.calledOnce, 'createMapFromObject called once').to.be.true;
			expect(utils.createMapFromObject.args[0][0], 'createMapFromObject 1st arg').to.be.deep.equal(upstreams);
			expect(utils.createMapFromObject.args[0][1], 'createMapFromObject 2nd arg').to.be.equal(handleUpstreamsBound);
			expect(STORE.__STATUSES[upstreamsKey].ready, '__STATUSES ready').to.be.true;
			expect(STORE.__STATUSES[upstreamsKey].status, '__STATUSES status').to.be.equal('ok');
			expect(result.__STATS, 'upstreams.__STATS').to.be.deep.equal(STATS);

			upstreamsMap.__STATS = STATS;

			expect(result, 'returned upstreams').to.be.deep.equal(upstreamsMap);
		});
	});

	it('upstreamsCalculatorFactory()', () => {
		const expectedResult = 'expectedResult';
		const key = 'test_upstream';

		stub(upstreamsCalculator, 'bind').callsFake(() => expectedResult);

		expect(upstreamsCalculatorFactory(key), 'result').to.be.equal(expectedResult);
		expect(upstreamsCalculator.bind.calledOnce, 'upstreamsCalculator.bind called once').to.be.true;
		expect(upstreamsCalculator.bind.args[0][0], 'upstreamsCalculator.bind 1st arg').to.be.a('null');
		expect(upstreamsCalculator.bind.args[0][1], 'upstreamsCalculator.bind 2nd arg').to.be.equal(key);

		upstreamsCalculator.bind.restore();
	});

	it('handleZone()', () => {
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
		let result = handleZone(memo, historyLimit, ts_1, zone_1, zoneName);

		expect(memo.history[zoneName], 'history type').to.be.an.instanceof(Array);
		expect(memo.history[zoneName], 'history length').to.have.lengthOf(1);
		expect(memo.history[zoneName][0], 'history 1st item').to.be.deep.equal(
			{ zone: zone_1, _ts: ts_1 }
		);
		expect(result.zone, 'result.zone').to.be.deep.equal(zone_1);
		expect(result.history.ts, 'result.history.ts').to.be.equal(ts_1);
		expect(result.history.data, 'result.history.data').to.be.an.instanceof(Array);
		expect(result.history.data, 'result.history.data').to.have.lengthOf(1);
		expect(result.history.data[0], 'result.history.data 1st item').to.be.deep.equal({
			zone: {
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
		const sortSpy = spy(memo.history[zoneName], 'sort');

		result = handleZone(memo, historyLimit, ts_0, zone_0, zoneName);

		expect(memo.history[zoneName], 'history type').to.be.an.instanceof(Array);
		expect(memo.history[zoneName], 'history length').to.have.lengthOf(2);
		expect(memo.history[zoneName][0], 'history 1st item').to.be.deep.equal(
			{ zone: zone_0, _ts: ts_0 }
		);
		expect(memo.history[zoneName][1], 'history 2nd item').to.be.deep.equal(
			{ zone: zone_1, _ts: ts_1 }
		);
		expect(sortSpy.calledOnce, 'history.sort called once').to.be.true;
		expect(sortSpy.args[0][0]({ _ts: 1 }, { _ts: 2 }), 'history.sort fn').to.be.equal(-1);
		expect(sortSpy.args[0][0]({ _ts: 2 }, { _ts: 1 }), 'history.sort fn').to.be.equal(1);
		expect(result.zone, 'result.zone').to.be.deep.equal(zone_0);
		expect(result.history.ts, 'result.history.ts').to.be.equal(ts_0);
		expect(result.history.data, 'result.history.data').to.be.an.instanceof(Array);
		expect(result.history.data, 'result.history.data').to.have.lengthOf(2);
		expect(result.history.data[0], 'result.history.data 1st item').to.be.deep.equal({
			zone: {
				prop_1: 0,
				prop_2: 0,
				prop_3: 0
			},
			_ts: ts_0
		});
		expect(result.history.data[1], 'result.history.data 2nd item').to.be.deep.equal({
			zone: {
				prop_1: 5,
				prop_2: 0,
				prop_3: 6
			},
			_ts: ts_1
		});

		sortSpy.restore();

		const ts_2 = ts_1 + 1;
		const zone_2 = {
			prop_1: zone_1.prop_1 - 2,
			prop_2: zone_1.prop_2 + 10,
			prop_3: zone_1.prop_3
		};

		result = handleZone(memo, historyLimit, ts_2, zone_2, zoneName);

		expect(memo.history[zoneName], 'history type').to.be.an.instanceof(Array);
		expect(memo.history[zoneName], 'history length').to.have.lengthOf(3);
		expect(memo.history[zoneName][0], 'history 1st item').to.be.deep.equal(
			{ zone: zone_0, _ts: ts_0 }
		);
		expect(memo.history[zoneName][1], 'history 2nd item').to.be.deep.equal(
			{ zone: zone_1, _ts: ts_1 }
		);
		expect(memo.history[zoneName][2], 'history 3rd item').to.be.deep.equal(
			{ zone: zone_2, _ts: ts_2 }
		);
		expect(result.zone, 'result.zone').to.be.deep.equal(zone_2);
		expect(result.history.ts, 'result.history.ts').to.be.equal(ts_2);
		expect(result.history.data, 'result.history.data').to.be.an.instanceof(Array);
		expect(result.history.data, 'result.history.data').to.have.lengthOf(3);
		expect(result.history.data[0], 'result.history.data 1st item').to.be.deep.equal({
			zone: {
				prop_1: 0,
				prop_2: 0,
				prop_3: 0
			},
			_ts: ts_0
		});
		expect(result.history.data[1], 'result.history.data 2nd item').to.be.deep.equal({
			zone: {
				prop_1: 5,
				prop_2: 0,
				prop_3: 6
			},
			_ts: ts_1
		});
		expect(result.history.data[2], 'result.history.data 3rd item').to.be.deep.equal({
			zone: {
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

		result = handleZone(memo, historyLimit, ts_3, zone_3, zoneName);

		expect(memo.history[zoneName], 'history type').to.be.an.instanceof(Array);
		expect(memo.history[zoneName], 'history length').to.have.lengthOf(3);
		expect(memo.history[zoneName][0], 'history 1st item').to.be.deep.equal(
			{ zone: zone_1, _ts: ts_1 }
		);
		expect(memo.history[zoneName][1], 'history 2nd item').to.be.deep.equal(
			{ zone: zone_2, _ts: ts_2 }
		);
		expect(memo.history[zoneName][2], 'history 3rd item').to.be.deep.equal(
			{ zone: zone_3, _ts: ts_3 }
		);
		expect(result.zone, 'result.zone').to.be.deep.equal(zone_3);
		expect(result.history.ts, 'result.history.ts').to.be.equal(ts_3);
		expect(result.history.data, 'result.history.data').to.be.an.instanceof(Array);
		expect(result.history.data, 'result.history.data').to.have.lengthOf(3);
		expect(result.history.data[0], 'result.history.data 1st item').to.be.deep.equal({
			zone: {
				prop_1: 0,
				prop_2: 0,
				prop_3: 0
			},
			_ts: ts_1
		});
		expect(result.history.data[1], 'result.history.data 2nd item').to.be.deep.equal({
			zone: {
				prop_1: 0,
				prop_2: 10,
				prop_3: 0
			},
			_ts: ts_2
		});
		expect(result.history.data[2], 'result.history.data 3rd item').to.be.deep.equal({
			zone: {
				prop_1: 1,
				prop_2: 2,
				prop_3: 3
			},
			_ts: ts_3
		});
	});

	describe('limitConnReqCalculator()', () => {
		let updatingPeriod = 1000;
		const expectedResult = 'expected_result';
		const handleZoneBound = 'bound handleZone';
		let memo;
		const timeStart = 1597739942000;
		const data = {
			zone_1: {},
			zone_2: {}
		};

		before(() => {
			stub(appsettings, 'getSetting').callsFake(() => updatingPeriod);
			stub(utils, 'createMapFromObject').callsFake(() => expectedResult);
			stub(handleZone, 'bind').callsFake(() => handleZoneBound);
		});

		beforeEach(() => {
			appsettings.getSetting.resetHistory();
			utils.createMapFromObject.resetHistory();
			handleZone.bind.resetHistory();

			memo = {
				prevUpdatingPeriod: 5000
			};
		});

		after(() => {
			appsettings.getSetting.restore();
			utils.createMapFromObject.restore();
			handleZone.bind.restore();
		});

		it('no data', () => {
			const result = limitConnReqCalculator(memo, null, null, null, timeStart);

			expect(appsettings.getSetting.notCalled, 'getSetting not called').to.be.true;
			expect(utils.createMapFromObject.notCalled, 'createMapFromObject not called').to.be.true;
			expect(handleZone.bind.notCalled, 'handleZone.bind not called').to.be.true;
			expect(memo, 'memo').to.be.deep.equal({
				prevUpdatingPeriod: 5000
			});
			expect(result, 'returned data').to.be.a('null');
		});

		it('empty data', () => {
			const result = limitConnReqCalculator(memo, {}, null, null, timeStart);

			expect(appsettings.getSetting.notCalled, 'getSetting not called').to.be.true;
			expect(utils.createMapFromObject.notCalled, 'createMapFromObject not called').to.be.true;
			expect(handleZone.bind.notCalled, 'handleZone.bind not called').to.be.true;
			expect(memo, 'memo').to.be.deep.equal({
				prevUpdatingPeriod: 5000
			});
			expect(result, 'returned data').to.be.a('null');
		});

		it('updatingPeriod changed', () => {
			const result = limitConnReqCalculator(memo, data, null, null, timeStart);

			expect(appsettings.getSetting.calledOnce, 'getSetting called once').to.be.true;
			expect(appsettings.getSetting.args[0][0], 'getSetting 1st arg').to.be.equal('updatingPeriod');
			expect(memo, 'memo').to.be.deep.equal({
				prevUpdatingPeriod: updatingPeriod,
				history: {}
			});
			expect(handleZone.bind.calledOnce, 'handleZone.bind called once').to.be.true;
			expect(handleZone.bind.args[0][0], 'handleZone.bind 1st arg').to.be.a('null');
			expect(handleZone.bind.args[0][1], 'handleZone.bind 2nd arg').to.be.deep.equal(memo);
			expect(handleZone.bind.args[0][2], 'handleZone.bind 3rd arg').to.be.equal(limitConnReqHistoryLimit);
			expect(handleZone.bind.args[0][3], 'handleZone.bind 4th arg').to.be.equal(1597739942);
			expect(utils.createMapFromObject.calledOnce, 'createMapFromObject called once').to.be.true;
			expect(utils.createMapFromObject.args[0][0], 'createMapFromObject 1st arg').to.be.deep.equal(data);
			expect(utils.createMapFromObject.args[0][1], 'createMapFromObject 2nd arg').to.be.equal(handleZoneBound);
			expect(result, 'returned data').to.be.equal(expectedResult);
		});

		it('updatingPeriod not changed', () => {
			memo.prevUpdatingPeriod = updatingPeriod;
			const result = limitConnReqCalculator(memo, data, null, null, timeStart);

			expect(appsettings.getSetting.calledOnce, 'getSetting called once').to.be.true;
			expect(appsettings.getSetting.args[0][0], 'getSetting 1st arg').to.be.equal('updatingPeriod');
			expect(memo, 'memo').to.be.deep.equal({
				prevUpdatingPeriod: updatingPeriod
			});
			expect(handleZone.bind.calledOnce, 'handleZone.bind called once').to.be.true;
			expect(handleZone.bind.args[0][0], 'handleZone.bind 1st arg').to.be.a('null');
			expect(handleZone.bind.args[0][1], 'handleZone.bind 2nd arg').to.be.deep.equal(memo);
			expect(handleZone.bind.args[0][2], 'handleZone.bind 3rd arg').to.be.equal(limitConnReqHistoryLimit);
			expect(handleZone.bind.args[0][3], 'handleZone.bind 4th arg').to.be.equal(1597739942);
			expect(utils.createMapFromObject.calledOnce, 'createMapFromObject called once').to.be.true;
			expect(utils.createMapFromObject.args[0][0], 'createMapFromObject 1st arg').to.be.deep.equal(data);
			expect(utils.createMapFromObject.args[0][1], 'createMapFromObject 2nd arg').to.be.equal(handleZoneBound);
			expect(result, 'returned data').to.be.equal(expectedResult);
		});
	});

	it('limitConnReqFactory()', () => {
		const expectedResult = 'expectedResult';
		const memo = 'mocked_memo';

		stub(limitConnReqCalculator, 'bind').callsFake(() => expectedResult);

		expect(limitConnReqFactory(memo), 'result').to.be.equal(expectedResult);
		expect(limitConnReqCalculator.bind.calledOnce, 'limitConnReqCalculator.bind called once').to.be.true;
		expect(limitConnReqCalculator.bind.args[0][0], 'limitConnReqCalculator.bind 1st arg').to.be.a('null');
		expect(limitConnReqCalculator.bind.args[0][1], 'limitConnReqCalculator.bind 2nd arg').to.be.equal(memo);

		limitConnReqCalculator.bind.restore();
	});
});
