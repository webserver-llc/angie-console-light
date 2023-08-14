/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
import calculate, { handleZones } from '../serverzones.js';
import utils from '../utils.js';
import appsettings from '../../appsettings';


describe('Calculators – ServerZones', () => {
	describe('handleZones()', () => {
		const ts = 1596792686803;
		const serverName = 'test_server';
		let STATS, server, previousState, STORE;

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
				requests: {
					total: 24
				},
				passedToIs4xx: true
			};
			previousState = new Map([
				[serverName, {
					data: {
						sent: 125,
						received: 122,
					},
					requests: {
						total: 14
					}
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
			stub(Date, 'now').callsFake(() => {});
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'calculateTraffic').callsFake(() => {});
			stub(utils, 'is4xxThresholdReached').callsFake(() => false);
			stub(utils, 'handleErrors').callsFake(() => {});

			const result = handleZones(STATS, null, server);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'server.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'server.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'server.zone_req_s').to.be.an('undefined');
			expect(utils.calculateTraffic.notCalled, 'calculateTraffic not called').to.be.true;
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'server.warning').to.be.an('undefined');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.a('null');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(server);
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result, 'returned server').to.be.deep.equal(server);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.calculateTraffic.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		it('no location in previous state', () => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'calculateTraffic').callsFake(() => {});
			stub(utils, 'is4xxThresholdReached').callsFake(() => false);
			stub(utils, 'handleErrors').callsFake(() => {});

			const result = handleZones(STATS, previousState, server, 'unknown_server');

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'server.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'server.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'server.zone_req_s').to.be.an('undefined');
			expect(utils.calculateTraffic.notCalled, 'calculateTraffic not called').to.be.true;
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'server.warning').to.be.an('undefined');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.an('undefined');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(server);
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result, 'returned server').to.be.deep.equal(server);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.calculateTraffic.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		it('with previous state', () => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'calculateTraffic').callsFake(() => {});
			stub(utils, 'is4xxThresholdReached').callsFake(() => false);
			stub(utils, 'handleErrors').callsFake(() => {});

			const previousServer = previousState.get(serverName);
			const period = ts - previousState.lastUpdate;
			const result = handleZones(STATS, previousState, server, serverName);

			expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
			expect(utils.calculateSpeed.callCount, 'calculateSpeed').to.be.equal(3);
			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st call 1st arg').to.be.equal(previousServer.data.sent);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 1st call 2nd arg').to.be.equal(server.data.sent);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 1st call 3rd arg').to.be.equal(period);
			expect(result.sent_s, 'server.sent_s').to.be.equal(server.data.sent);
			expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 2nd call 1st arg').to.be.equal(previousServer.data.received);
			expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd call 2nd arg').to.be.equal(server.data.received);
			expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 2nd call 3rd arg').to.be.equal(period);
			expect(result.rcvd_s, 'server.rcvd_s').to.be.equal(server.data.received);
			expect(utils.calculateSpeed.args[2][0], 'calculateSpeed 3rd call 1st arg').to.be.equal(previousServer.requests.total);
			expect(utils.calculateSpeed.args[2][1], 'calculateSpeed 3rd call 2nd arg').to.be.equal(server.requests.total);
			expect(utils.calculateSpeed.args[2][2], 'calculateSpeed 3rd call 3rd arg').to.be.equal(period);
			expect(result.zone_req_s, 'server.zone_req_s').to.be.equal(server.requests.total);
			expect(utils.calculateTraffic.calledOnce, 'calculateTraffic called once').to.be.true;
			expect(utils.calculateTraffic.args[0][0], 'calculateTraffic 1st arg').to.be.deep.equal(STATS);
			expect(utils.calculateTraffic.args[0][1], 'calculateTraffic 2nd arg').to.be.deep.equal(server);
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'server.warning').to.be.an('undefined');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.deep.equal(previousServer);
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(server);
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result, 'returned server').to.be.deep.equal(server);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.calculateTraffic.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		it('4xx threshold reached', () => {
			stub(Date, 'now').callsFake(() => {});
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'calculateTraffic').callsFake(() => {});
			stub(utils, 'is4xxThresholdReached').callsFake(() => true);
			stub(utils, 'handleErrors').callsFake(() => {});

			const result = handleZones(STATS, null, server);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'server.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'server.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'server.zone_req_s').to.be.an('undefined');
			expect(utils.calculateTraffic.notCalled, 'calculateTraffic not called').to.be.true;
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'server.warning').to.be.true;
			expect(STATS.status, 'STATS.status').to.be.equal('warning');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(1);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.a('null');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(server);
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result, 'returned server').to.be.deep.equal(server);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.calculateTraffic.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		it('handles 5xx changing', () => {
			stub(Date, 'now').callsFake(() => {});
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'calculateTraffic').callsFake(() => {});
			stub(utils, 'is4xxThresholdReached').callsFake(() => false);
			stub(utils, 'handleErrors').callsFake((_, server) => {
				server['5xxChanged'] = true;
			});

			const result = handleZones(STATS, null, server);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'server.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'server.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'server.zone_req_s').to.be.an('undefined');
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'server.warning').to.be.an('undefined');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.a('null');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(server);
			expect(STATS.status, 'STATS.status').to.be.equal('danger');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(1);
			expect(result, 'returned server').to.be.deep.equal(server);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.calculateTraffic.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		it('handles 5xx changing (with 4xx threshold reached)', () => {
			stub(Date, 'now').callsFake(() => {});
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'calculateTraffic').callsFake(() => {});
			stub(utils, 'is4xxThresholdReached').callsFake(() => true);
			stub(utils, 'handleErrors').callsFake((_, server) => {
				server['5xxChanged'] = true;
			});

			const result = handleZones(STATS, null, server);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'server.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'server.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'server.zone_req_s').to.be.an('undefined');
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'server.warning').to.be.true;
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(1);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.a('null');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(server);
			expect(STATS.status, 'STATS.status').to.be.equal('danger');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(1);
			expect(result, 'returned server').to.be.deep.equal(server);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.calculateTraffic.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
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

		spy(handleZones, 'bind');
		stub(utils, 'createMapFromObject').callsFake(() => zonesMap);

		expect(calculate(null, null, STORE), 'result [zones = null]').to.be.a('null');
		expect(STORE.__STATUSES.server_zones.ready, '__STATUSES.server_zones.ready [zones = {}]').to.be.false;

		delete STORE.__STATUSES.server_zones.ready;

		expect(calculate({}, null, STORE), 'result [zones = {}]').to.be.a('null');
		expect(STORE.__STATUSES.server_zones.ready, '__STATUSES.server_zones.ready [zones = {}]').to.be.false;

		const result = calculate(zones, previousState, STORE);

		expect(utils.createMapFromObject.calledOnce, 'createMapFromObject called once').to.be.true;
		expect(utils.createMapFromObject.args[0][0], 'createMapFromObject 1st arg').to.be.deep.equal(zones);
		expect(utils.createMapFromObject.args[0][1].name, 'createMapFromObject 2nd arg').to.be.equal('bound handleZones');
		expect(handleZones.bind.calledOnce, 'handleZones.bind called once').to.be.true;
		expect(handleZones.bind.args[0][0], 'handleZones.bind 1st arg').to.be.a('null');

		STATS.total = zonesMap.size;

		expect(handleZones.bind.args[0][1], 'handleZones.bind 2nd arg').to.be.deep.equal(STATS);
		expect(handleZones.bind.args[0][2], 'handleZones.bind 3rd arg').to.be.equal(previousState);
		expect(utils.createMapFromObject.args[0][2], 'createMapFromObject 3rd arg').to.be.false;
		expect(result.__STATS, 'zones.__STATS').to.be.deep.equal(STATS);
		expect(STORE.__STATUSES.server_zones, 'STORE.__STATUSES.server_zones').to.be.deep.equal({
			ready: true,
			status: STATS.status
		});

		handleZones.bind.restore();
		utils.createMapFromObject.restore();
	});
});
