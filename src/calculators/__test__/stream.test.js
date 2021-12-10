/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
import {
	handleZones,
	zones as zonesCalculate,
	upstreams as upstreamsCalculate
} from '../stream.js';
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
		let STATS, zone;
		let handleErrors = () => {};

		previous.lastUpdate = ts - 1000;

		before(() => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'calculateTraffic').callsFake(() => {});
			stub(utils, 'handleErrors').callsFake((_, zone) => { handleErrors(zone) });
		});

		beforeEach(() => {
			Date.now.resetHistory();
			utils.calculateSpeed.resetHistory();
			utils.calculateTraffic.resetHistory();
			utils.handleErrors.resetHistory();

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

		after(() => {
			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.calculateTraffic.restore();
			utils.handleErrors.restore();
		});

		it('no previous state', () => {
			const result = handleZones(STATS, null, zone);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'zone.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'zone.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'zone.zone_conn_s').to.be.an('undefined');
			expect(STATS.conn_s, 'STATS.conn_s').to.be.equal(0);
			expect(utils.calculateTraffic.notCalled, 'calculateTraffic not called').to.be.true;
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.a('null');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(zone);
			expect(utils.handleErrors.args[0][2], 'handleErrors 3rd arg').to.be.equal('sessions');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.conn_total, 'STATS.conn_total').to.be.equal(24);
			expect(STATS.conn_current, 'STATS.conn_current').to.be.equal(27);
			expect(STATS.traffic.in, 'STATS.traffic.in').to.be.equal(0);
			expect(STATS.traffic.out, 'STATS.traffic.out').to.be.equal(0);
			expect(result, 'returned zone').to.be.deep.equal(zone);
		});

		it('no zone in previous state', () => {
			const result = handleZones(STATS, previous, zone, 'unknown_zone');

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'zone.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'zone.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'zone.zone_conn_s').to.be.an('undefined');
			expect(STATS.conn_s, 'STATS.conn_s').to.be.equal(0);
			expect(utils.calculateTraffic.notCalled, 'calculateTraffic not called').to.be.true;
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.an('undefined');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(zone);
			expect(utils.handleErrors.args[0][2], 'handleErrors 3rd arg').to.be.equal('sessions');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.conn_total, 'STATS.conn_total').to.be.equal(24);
			expect(STATS.conn_current, 'STATS.conn_current').to.be.equal(27);
			expect(STATS.traffic.in, 'STATS.traffic.in').to.be.equal(0);
			expect(STATS.traffic.out, 'STATS.traffic.out').to.be.equal(0);
			expect(result, 'returned zone').to.be.deep.equal(zone);
		});

		it('with previous state', () => {
			const previousZone = previous.get(name);
			const period = ts - previous.lastUpdate;
			const result = handleZones(STATS, previous, zone, name);

			expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
			expect(utils.calculateSpeed.callCount, 'calculateSpeed').to.be.equal(3);
			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st call 1st arg').to.be.equal(previousZone.sent);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 1st call 2nd arg').to.be.equal(zone.sent);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 1st call 3rd arg').to.be.equal(period);
			expect(result.sent_s, 'zone.sent_s').to.be.equal(zone.sent);
			expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 2nd call 1st arg').to.be.equal(previousZone.received);
			expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd call 2nd arg').to.be.equal(zone.received);
			expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 2nd call 3rd arg').to.be.equal(period);
			expect(result.rcvd_s, 'zone.rcvd_s').to.be.equal(zone.received);
			expect(utils.calculateSpeed.args[2][0], 'calculateSpeed 3rd call 1st arg').to.be.equal(previousZone.connections);
			expect(utils.calculateSpeed.args[2][1], 'calculateSpeed 3rd call 2nd arg').to.be.equal(zone.connections);
			expect(utils.calculateSpeed.args[2][2], 'calculateSpeed 3rd call 3rd arg').to.be.equal(period);
			expect(result.zone_conn_s, 'zone.zone_conn_s').to.be.equal(zone.connections);
			expect(STATS.conn_s, 'STATS.conn_s').to.be.equal(zone.connections);
			expect(utils.calculateTraffic.calledOnce, 'calculateTraffic called once').to.be.true;
			expect(utils.calculateTraffic.args[0][0].STATS_TEST, 'calculateTraffic 1st arg').to.be.true;
			expect(utils.calculateTraffic.args[0][1], 'calculateTraffic 2nd arg').to.be.deep.equal(zone);
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.deep.equal(previousZone);
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(zone);
			expect(utils.handleErrors.args[0][2], 'handleErrors 3rd arg').to.be.equal('sessions');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.conn_total, 'STATS.conn_total').to.be.equal(24);
			expect(STATS.conn_current, 'STATS.conn_current').to.be.equal(27);
			expect(STATS.traffic.in, 'STATS.traffic.in').to.be.equal(0);
			expect(STATS.traffic.out, 'STATS.traffic.out').to.be.equal(0);
			expect(result, 'returned zone').to.be.deep.equal(zone);
		});

		it('STATS collecting', () => {
			handleZones(STATS, null, zone);
			handleZones(STATS, previous, zone, 'unknown_zone');
			handleZones(STATS, previous, zone, name);
			handleZones(STATS, previous, zone, name);

			expect(STATS.conn_s, 'STATS.conn_s').to.be.equal(48);
			expect(STATS.conn_total, 'STATS.conn_total').to.be.equal(96);
			expect(STATS.conn_current, 'STATS.conn_current').to.be.equal(108);
		});

		it('handles 5xx changing', () => {
			const _handleErrors = handleErrors;

			handleErrors = zone => {
				zone['5xxChanged'] = true;
			};

			handleZones(STATS, null, zone);

			expect(STATS.status, 'STATS.status').to.be.equal('danger');

			handleErrors = _handleErrors;
		});

		it('handles 4xx changing', () => {
			const _handleErrors = handleErrors;

			handleErrors = zone => {
				zone['4xxChanged'] = true;
			};

			handleZones(STATS, null, zone);

			expect(STATS.status, 'STATS.status').to.be.equal('danger');

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

		spy(handleZones, 'bind');
		stub(utils, 'createMapFromObject').callsFake(() => zonesMap);

		expect(zonesCalculate(null, null, STORE), 'result [zones = null]').to.be.a('null');
		expect(STORE.__STATUSES.tcp_zones.ready, '__STATUSES.tcp_zones.ready [zones = {}]').to.be.false;

		delete STORE.__STATUSES.tcp_zones.ready;

		expect(zonesCalculate({}, null, STORE), 'result [zones = {}]').to.be.a('null');
		expect(STORE.__STATUSES.tcp_zones.ready, '__STATUSES.tcp_zones.ready [zones = {}]').to.be.false;

		const result = zonesCalculate(zones, previousState, STORE);

		expect(utils.createMapFromObject.calledOnce, 'createMapFromObject called once').to.be.true;
		expect(utils.createMapFromObject.args[0][0], 'createMapFromObject 1st arg').to.be.deep.equal(zones);
		expect(utils.createMapFromObject.args[0][1].name, 'createMapFromObject 2nd arg').to.be.equal('bound handleZones');
		expect(handleZones.bind.calledOnce, 'handleZones.bind called once').to.be.true;
		expect(handleZones.bind.args[0][0], 'handleZones.bind 1st arg').to.be.a('null');
		expect(handleZones.bind.args[0][1], 'handleZones.bind 2nd arg').to.be.deep.equal(STATS);
		expect(handleZones.bind.args[0][2], 'handleZones.bind 3rd arg').to.be.equal(previousState);
		expect(result.__STATS, 'zones.__STATS').to.be.deep.equal(STATS);
		expect(STORE.__STATUSES.tcp_zones, 'STORE.__STATUSES.tcp_zones').to.be.deep.equal({
			ready: true,
			status: STATS.status
		});

		handleZones.bind.restore();
		utils.createMapFromObject.restore();
	});

	it('upstreams()', () => {
		expect(upstreamsCalculate.name, 'upstreamsCalculate.name').to.be.equal('bound upstreamsCalculator');
	});
});
