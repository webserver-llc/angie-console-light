/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
import calculate, { handleZones } from '../locationzones.js';
import utils from '../utils.js';

describe('Calculators – LocationZones', () => {
	describe('handleZones()', () => {
		const ts = 1596792686803;
		const locationName = 'test_location';
		let STATS, location, previousState, STORE;

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
			stub(Date, 'now').callsFake(() => {});
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'is4xxThresholdReached').callsFake(() => false);
			stub(utils, 'handleErrors').callsFake(() => {});

			const result = handleZones(STATS, null, location);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'location.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'location.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'location.zone_req_s').to.be.an('undefined');
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'location.warning').to.be.an('undefined');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.a('null');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(location);
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result, 'returned location').to.be.deep.equal(location);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		it('no location in previous state', () => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'is4xxThresholdReached').callsFake(() => false);
			stub(utils, 'handleErrors').callsFake(() => {});

			const result = handleZones(STATS, previousState, location, 'unknown_location');

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'location.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'location.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'location.zone_req_s').to.be.an('undefined');
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'location.warning').to.be.an('undefined');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.an('undefined');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(location);
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result, 'returned location').to.be.deep.equal(location);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		it('with previous state', () => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'is4xxThresholdReached').callsFake(() => false);
			stub(utils, 'handleErrors').callsFake(() => {});

			const previousLocation = previousState.get(locationName);
			const period = ts - previousState.lastUpdate;
			const result = handleZones(STATS, previousState, location, locationName);

			expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
			expect(utils.calculateSpeed.callCount, 'calculateSpeed').to.be.equal(3);
			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st call 1st arg').to.be.equal(previousLocation.data.sent);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 1st call 2nd arg').to.be.equal(location.data.sent);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 1st call 3rd arg').to.be.equal(period);
			expect(result.sent_s, 'location.sent_s').to.be.equal(location.data.sent);
			expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 2nd call 1st arg').to.be.equal(previousLocation.data.received);
			expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd call 2nd arg').to.be.equal(location.data.received);
			expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 2nd call 3rd arg').to.be.equal(period);
			expect(result.rcvd_s, 'location.rcvd_s').to.be.equal(location.data.received);
			expect(utils.calculateSpeed.args[2][0], 'calculateSpeed 3rd call 1st arg').to.be.equal(previousLocation.requests);
			expect(utils.calculateSpeed.args[2][1], 'calculateSpeed 3rd call 2nd arg').to.be.equal(location.requests);
			expect(utils.calculateSpeed.args[2][2], 'calculateSpeed 3rd call 3rd arg').to.be.equal(period);
			expect(result.zone_req_s, 'location.zone_req_s').to.be.equal(location.requests);
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'location.warning').to.be.an('undefined');
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.deep.equal(previousLocation);
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(location);
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result, 'returned location').to.be.deep.equal(location);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		it('4xx threshold reached', () => {
			stub(Date, 'now').callsFake(() => {});
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'is4xxThresholdReached').callsFake(() => true);
			stub(utils, 'handleErrors').callsFake(() => {});

			const result = handleZones(STATS, null, location);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'location.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'location.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'location.zone_req_s').to.be.an('undefined');
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'location.warning').to.be.true;
			expect(STATS.status, 'STATS.status').to.be.equal('warning');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(1);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.a('null');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(location);
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result, 'returned location').to.be.deep.equal(location);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		it('handles 5xx changing', () => {
			stub(Date, 'now').callsFake(() => {});
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'is4xxThresholdReached').callsFake(() => false);
			stub(utils, 'handleErrors').callsFake((_, location) => {
				location['5xxChanged'] = true;
			});

			const result = handleZones(STATS, null, location);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'location.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'location.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'location.zone_req_s').to.be.an('undefined');
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'location.warning').to.be.an('undefined');
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(0);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.a('null');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(location);
			expect(STATS.status, 'STATS.status').to.be.equal('danger');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(1);
			expect(result, 'returned location').to.be.deep.equal(location);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
		});

		it('handles 5xx changing (with 4xx threshold reached)', () => {
			stub(Date, 'now').callsFake(() => {});
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'is4xxThresholdReached').callsFake(() => true);
			stub(utils, 'handleErrors').callsFake((_, location) => {
				location['5xxChanged'] = true;
			});

			const result = handleZones(STATS, null, location);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(result.sent_s, 'location.sent_s').to.be.an('undefined');
			expect(result.rcvd_s, 'location.rcvd_s').to.be.an('undefined');
			expect(result.zone_req_s, 'location.zone_req_s').to.be.an('undefined');
			expect(utils.is4xxThresholdReached.calledOnce, 'is4xxThresholdReached called once').to.be.true;
			expect(utils.is4xxThresholdReached.args[0][0].passedToIs4xx, 'is4xxThresholdReached 1st arg').to.be.true;
			expect(result.warning, 'location.warning').to.be.true;
			expect(STATS.warnings, 'STATS.warnings').to.be.equal(1);
			expect(utils.handleErrors.calledOnce, 'handleErrors called once').to.be.true;
			expect(utils.handleErrors.args[0][0], 'handleErrors 1st arg').to.be.a('null');
			expect(utils.handleErrors.args[0][1], 'handleErrors 2nd arg').to.be.deep.equal(location);
			expect(STATS.status, 'STATS.status').to.be.equal('danger');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(1);
			expect(result, 'returned location').to.be.deep.equal(location);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.is4xxThresholdReached.restore();
			utils.handleErrors.restore();
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

		spy(handleZones, 'bind');
		stub(utils, 'createMapFromObject').callsFake(() => locationsMap);

		expect(calculate(null, null, STORE), 'result [locations = null]').to.be.a('null');
		expect(STORE.__STATUSES.location_zones.ready, '__STATUSES.location_zones.ready [locations = {}]').to.be.false;

		delete STORE.__STATUSES.location_zones.ready;

		expect(calculate({}, null, STORE), 'result [locations = {}]').to.be.a('null');
		expect(STORE.__STATUSES.location_zones.ready, '__STATUSES.location_zones.ready [locations = {}]').to.be.false;

		const result = calculate(locations, previousState, STORE);

		expect(utils.createMapFromObject.calledOnce, 'createMapFromObject called once').to.be.true;
		expect(utils.createMapFromObject.args[0][0], 'createMapFromObject 1st arg').to.be.deep.equal(locations);
		expect(utils.createMapFromObject.args[0][1].name, 'createMapFromObject 2nd arg').to.be.equal('bound handleZones');
		expect(handleZones.bind.calledOnce, 'handleZones.bind called once').to.be.true;
		expect(handleZones.bind.args[0][0], 'handleZones.bind 1st arg').to.be.a('null');

		STATS.total = locationsMap.size;

		expect(handleZones.bind.args[0][1], 'handleZones.bind 2nd arg').to.be.deep.equal(STATS);
		expect(handleZones.bind.args[0][2], 'handleZones.bind 3rd arg').to.be.equal(previousState);
		expect(utils.createMapFromObject.args[0][2], 'createMapFromObject 3rd arg').to.be.false;
		expect(result.__STATS, 'locations.__STATS').to.be.deep.equal(STATS);
		expect(STORE.__STATUSES.location_zones, 'STORE.__STATUSES.location_zones').to.be.deep.equal({
			ready: true,
			status: STATS.status
		});

		handleZones.bind.restore();
		utils.createMapFromObject.restore();
	});
});
