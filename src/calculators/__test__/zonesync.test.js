/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
import calculate, { handleZones } from '../zonesync.js';
import { DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT } from '../../constants.js';
import * as utils from '../utils.js';
import appsettings from '../../appsettings';


describe('Calculators – ZoneSync', () => {
	describe('handleZones()', () => {
		let alertThreshold = 100;
		let STATS, zone;

		before(() => {
			stub(appsettings, 'getSetting').callsFake(() => alertThreshold);
		});

		beforeEach(() => {
			appsettings.getSetting.resetHistory();

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

		after(() => {
			appsettings.getSetting.restore();
		});

		it('total records > 0', () => {
			const result = handleZones(STATS, zone);

			expect(appsettings.getSetting.calledOnce, 'getSetting called once').to.be.true;
			expect(appsettings.getSetting.args[0][0], 'getSetting 1st arg').to.be.equal('zonesyncPendingThreshold');
			expect(appsettings.getSetting.args[0][1], 'getSetting 2nd arg').to.be.equal(
				DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT
			);
			expect(result.alert, 'zone.alert').to.be.an('undefined');
			expect(result.warning, 'zone.warning').to.be.an('undefined');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(result, 'returned zone').to.be.deep.equal(zone);
		});

		it('total records > 0 && alert threshold reached', () => {
			alertThreshold = 0;

			const result = handleZones(STATS, zone);

			expect(appsettings.getSetting.calledOnce, 'getSetting called once').to.be.true;
			expect(appsettings.getSetting.args[0][0], 'getSetting 1st arg').to.be.equal('zonesyncPendingThreshold');
			expect(appsettings.getSetting.args[0][1], 'getSetting 2nd arg').to.be.equal(
				DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT
			);
			expect(result.alert, 'zone.alert').to.be.true;
			expect(STATS.status, 'STATS.status').to.be.equal('danger');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(1);
			expect(result.warning, 'zone.warning').to.be.an('undefined');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(result, 'returned zone').to.be.deep.equal(zone);
		});

		it('total records > 0 && warning threshold reached', () => {
			alertThreshold = 3;

			const result = handleZones(STATS, zone);

			expect(appsettings.getSetting.calledOnce, 'getSetting called once').to.be.true;
			expect(appsettings.getSetting.args[0][0], 'getSetting 1st arg').to.be.equal('zonesyncPendingThreshold');
			expect(appsettings.getSetting.args[0][1], 'getSetting 2nd arg').to.be.equal(
				DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT
			);
			expect(result.alert, 'zone.alert').to.be.an('undefined');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result.warning, 'zone.warning').to.be.true;
			expect(STATS.status, 'STATS.status').to.be.equal('warning');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(1);
			expect(result, 'returned zone').to.be.deep.equal(zone);
		});

		it('total records == 0 && pending > 0', () => {
			zone.records_total = 0;

			const result = handleZones(STATS, zone);

			expect(appsettings.getSetting.notCalled, 'getSetting not called').to.be.true;
			expect(result.alert, 'zone.alert').to.be.true;
			expect(STATS.status, 'STATS.status').to.be.equal('danger');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(1);
			expect(result.warning, 'zone.warning').to.be.an('undefined');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(result, 'returned zone').to.be.deep.equal(zone);
		});

		it('total records = 0 && pending == 0', () => {
			zone.records_total = 0;
			zone.records_pending = 0;

			const result = handleZones(STATS, zone);

			expect(appsettings.getSetting.notCalled, 'getSetting not called').to.be.true;
			expect(result.alert, 'zone.alert').to.be.an('undefined');
			expect(result.warning, 'zone.warning').to.be.an('undefined');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(result, 'returned zone').to.be.deep.equal(zone);
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

			expect(STATS.alerts, 'STATS.alerts').to.be.equal(2);
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(3);
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
				msgs_out: 5
			},
			lastUpdate: ts - period
		};
		let STATS, zone_sync, STORE;

		before(() => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'createMapFromObject').callsFake(() => zonesMap);
			spy(handleZones, 'bind');
		});

		beforeEach(() => {
			Date.now.resetHistory();
			utils.calculateSpeed.resetHistory();
			utils.createMapFromObject.resetHistory();
			handleZones.bind.resetHistory();

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

		after(() => {
			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.createMapFromObject.restore();
			handleZones.bind.restore();
		});

		it('zone_sync is null', () => {
			const result = calculate(null, null, STORE);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(STATS.traffic.in, 'STATS.traffic.in').to.be.equal(0);
			expect(STATS.traffic.out, 'STATS.traffic.out').to.be.equal(0);
			expect(utils.createMapFromObject.notCalled, 'createMapFromObject not called').to.be.true;
			expect(handleZones.bind.notCalled, 'handleZones.bind not called').to.be.true;
			expect(STATS.total, 'STATS.total').to.be.equal(0);
			expect(STORE.__STATUSES.zone_sync.ready, '__STATUSES.zone_sync.ready').to.be.false;
			expect(STORE.__STATUSES.zone_sync.status, '__STATUSES.zone_sync.status').to.be.an('undefined');
			expect(result, 'returned zone_sync').to.be.a('null');
		});

		it('zone_sync is empty', () => {
			const result = calculate({}, null, STORE);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(STATS.traffic.in, 'STATS.traffic.in').to.be.equal(0);
			expect(STATS.traffic.out, 'STATS.traffic.out').to.be.equal(0);
			expect(utils.createMapFromObject.notCalled, 'createMapFromObject not called').to.be.true;
			expect(handleZones.bind.notCalled, 'handleZones.bind not called').to.be.true;
			expect(STATS.total, 'STATS.total').to.be.equal(0);
			expect(STORE.__STATUSES.zone_sync.ready, '__STATUSES.zone_sync.ready').to.be.false;
			expect(STORE.__STATUSES.zone_sync.status, '__STATUSES.zone_sync.status').to.be.an('undefined');
			expect(result, 'returned zone_sync').to.be.a('null');
		});

		it('no previous state', () => {
			const result = calculate(zone_sync, null, STORE);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(STATS.traffic.in, 'STATS.traffic.in').to.be.equal(0);
			expect(STATS.traffic.out, 'STATS.traffic.out').to.be.equal(0);
			expect(utils.createMapFromObject.calledOnce, 'createMapFromObject called once').to.be.true;
			expect(utils.createMapFromObject.args[0][0], 'createMapFromObject 1st arg').to.be.deep.equal({
				test: { a: 123 },
				test_1: { a: 321 }
			});
			expect(handleZones.bind.calledOnce, 'handleZones.bind called once').to.be.true;
			expect(handleZones.bind.args[0][0], 'handleZones.bind 1st arg').to.be.a('null');

			STATS.total = zonesMap.size;

			expect(handleZones.bind.args[0][1], 'handleZones.bind 2nd arg').to.be.deep.equal(STATS);
			expect(utils.createMapFromObject.args[0][1].name, 'createMapFromObject 2nd arg').to.be.equal(
				'bound handleZones'
			);
			expect(utils.createMapFromObject.args[0][2], 'createMapFromObject 3rd arg').to.be.false;
			expect(result.zones, 'zone_sync.zones').to.be.deep.equal(zonesMap);
			expect(STATS.total, 'STATS.total').to.be.equal(result.zones.size);
			expect(zone_sync.__STATS, 'zone_sync.__STATS').to.be.deep.equal(STATS);
			expect(STORE.__STATUSES.zone_sync.ready, '__STATUSES.zone_sync.ready').to.be.true;
			expect(STORE.__STATUSES.zone_sync.status, '__STATUSES.zone_sync.status').to.be.equal('ok');
			expect(result, 'returned zone_sync').to.be.deep.equal(zone_sync);
		});

		it('with previous state', () => {

		});
	});
});
