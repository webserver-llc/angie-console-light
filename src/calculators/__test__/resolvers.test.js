/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
import calculate, { handleResolver } from '../resolvers.js';
import { DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT } from '../../constants.js';
import utils from '../utils.js';
import appsettings from '../../appsettings';

describe('Calculators – Resolvers', () => {
	describe('handleResolver()', () => {
		const ts = 1596792686803;
		const period = 1000;
		const resolverName = 'test_resolver';
		const responses = {
			allResponses: 71,
			errResponses: 5
		};
		const prevResponses = {
			allResponses: 53,
			errResponses: 0
		};
		let STATS, resolver, previousState;

		beforeEach(() => {
			STATS = {
				total: 0,
				traffic: {
					in: 0,
					out: 0
				},
				alerts: 0,
				status: 'ok'
			};
			resolver = {
				requests: {
					name: 3,
					srv: 73,
					addr: 0
				},
				responses: {
					noerror: 71,
					formerr: 0,
					servfail: 0,
					nxdomain: 0,
					notimp: 0,
					refused: 0,
					timedout: 5,
					unknown: 0
				}
			};
			previousState = new Map([
				[resolverName, {
					requests: {
						name: 3,
						srv: 50,
						addr: 0
					},
					responses: {
						noerror: 53,
						formerr: 0,
						servfail: 0,
						nxdomain: 0,
						notimp: 0,
						refused: 0,
						timedout: 0,
						unknown: 0
					}
				}]
			]);
			previousState.lastUpdate = ts - period;
		});

		it('no previous state', () => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake(() => {});
			stub(utils, 'countResolverResponses').callsFake(() => {});
			stub(appsettings, 'getSetting').callsFake(() => {});

			const result = handleResolver(STATS, null, resolver);

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(utils.countResolverResponses.notCalled, 'countResolverResponses not called').to.be.true;
			expect(appsettings.getSetting.notCalled, 'getSetting not called').to.be.true;
			expect(STATS, 'STATS').to.be.deep.equal(STATS);
			expect(STATS.traffic.in, 'STATS.traffic.in').to.be.equal(0);
			expect(STATS.traffic.out, 'STATS.traffic.out').to.be.equal(0);
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result.alert, 'resolver.alert').to.be.an('undefined');
			expect(result, 'returned resolver').to.be.deep.equal(resolver);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.countResolverResponses.restore();
			appsettings.getSetting.restore();
		});

		it('no resolver in previous state', () => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake(() => {});
			stub(utils, 'countResolverResponses').callsFake(() => {});
			stub(appsettings, 'getSetting').callsFake(() => {});

			const result = handleResolver(STATS, previousState, resolver, 'unknown_resolver');

			expect(Date.now.notCalled, 'Date.now not called').to.be.true;
			expect(utils.calculateSpeed.notCalled, 'calculateSpeed not called').to.be.true;
			expect(utils.countResolverResponses.notCalled, 'countResolverResponses not called').to.be.true;
			expect(appsettings.getSetting.notCalled, 'getSetting not called').to.be.true;
			expect(STATS.traffic.in, 'STATS.traffic.in').to.be.equal(0);
			expect(STATS.traffic.out, 'STATS.traffic.out').to.be.equal(0);
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result.alert, 'resolver.alert').to.be.an('undefined');
			expect(result, 'returned resolver').to.be.deep.equal(resolver);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.countResolverResponses.restore();
			appsettings.getSetting.restore();
		});

		it('with previous state', () => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'countResolverResponses').callsFake(
				_responses => _responses.noerror === resolver.responses.noerror ? responses : prevResponses
			);
			stub(appsettings, 'getSetting').callsFake(() => 50);

			previousState.set(resolverName, {
				requests: {
					name: 3,
					srv: 50,
					addr: 0,
					test: 'not a number'
				},
				responses: {
					noerror: 53,
					formerr: 0,
					servfail: 0,
					nxdomain: 0,
					notimp: 0,
					refused: 0,
					timedout: 0,
					unknown: 0
				}
			});
			resolver.requests.test = 'not a number as well';

			const result = handleResolver(STATS, previousState, resolver, resolverName);

			expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
			expect(utils.calculateSpeed.calledTwice, 'calculateSpeed called twice').to.be.true;
			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st call 1st arg').to.be.equal(53);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 1st call 2nd arg').to.be.equal(76);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 1st call 3rd arg').to.be.equal(period);
			expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 2nd call 1st arg').to.be.equal(53);
			expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd call 2nd arg').to.be.equal(71);
			expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 2nd call 3rd arg').to.be.equal(period);
			expect(utils.countResolverResponses.calledTwice, 'countResolverResponses called twice').to.be.true;
			expect(utils.countResolverResponses.args[0][0], 'countResolverResponses 1st call 1st arg')
				.to.be.deep.equal(resolver.responses);
			expect(utils.countResolverResponses.args[1][0], 'countResolverResponses 2nd call 1st arg')
				.to.be.deep.equal(previousState.get(resolverName).responses);
			expect(appsettings.getSetting.calledOnce, 'getSettings called once').to.be.true;
			expect(appsettings.getSetting.args[0][0], 'getSettings 1st arg').to.be.equal('resolverErrorsThreshold');
			expect(appsettings.getSetting.args[0][1], 'getSettings 2nd arg')
				.to.be.equal(DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT);
			expect(STATS.traffic.in, 'STATS.traffic.in').to.be.equal(76);
			expect(STATS.traffic.out, 'STATS.traffic.out').to.be.equal(71);
			expect(STATS.status, 'STATS.status').to.be.equal('ok');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(0);
			expect(result.alert, 'resolver.alert').to.be.an('undefined');
			expect(result, 'returned resolver').to.be.deep.equal(resolver);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.countResolverResponses.restore();
			appsettings.getSetting.restore();
		});

		it('errors threshold reached', () => {
			stub(Date, 'now').callsFake(() => ts);
			stub(utils, 'calculateSpeed').callsFake((a, b) => b);
			stub(utils, 'countResolverResponses').callsFake(
				_responses => _responses.noerror === resolver.responses.noerror ? responses : prevResponses
			);
			stub(appsettings, 'getSetting').callsFake(() => 0);

			const result = handleResolver(STATS, previousState, resolver, resolverName);

			expect(Date.now.calledOnce, 'Date.now called once').to.be.true;
			expect(utils.calculateSpeed.calledTwice, 'calculateSpeed called twice').to.be.true;
			expect(utils.calculateSpeed.args[0][0], 'calculateSpeed 1st call 1st arg').to.be.equal(53);
			expect(utils.calculateSpeed.args[0][1], 'calculateSpeed 1st call 2nd arg').to.be.equal(76);
			expect(utils.calculateSpeed.args[0][2], 'calculateSpeed 1st call 3rd arg').to.be.equal(period);
			expect(utils.calculateSpeed.args[1][0], 'calculateSpeed 2nd call 1st arg').to.be.equal(53);
			expect(utils.calculateSpeed.args[1][1], 'calculateSpeed 2nd call 2nd arg').to.be.equal(71);
			expect(utils.calculateSpeed.args[1][2], 'calculateSpeed 2nd call 3rd arg').to.be.equal(period);
			expect(utils.countResolverResponses.calledTwice, 'countResolverResponses called twice').to.be.true;
			expect(utils.countResolverResponses.args[0][0], 'countResolverResponses 1st call 1st arg')
				.to.be.deep.equal(resolver.responses);
			expect(utils.countResolverResponses.args[1][0], 'countResolverResponses 2nd call 1st arg')
				.to.be.deep.equal(previousState.get(resolverName).responses);
			expect(appsettings.getSetting.calledOnce, 'getSettings called once').to.be.true;
			expect(appsettings.getSetting.args[0][0], 'getSettings 1st arg').to.be.equal('resolverErrorsThreshold');
			expect(appsettings.getSetting.args[0][1], 'getSettings 2nd arg')
				.to.be.equal(DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT);
			expect(STATS.traffic.in, 'STATS.traffic.in').to.be.equal(76);
			expect(STATS.traffic.out, 'STATS.traffic.out').to.be.equal(71);
			expect(STATS.status, 'STATS.status').to.be.equal('danger');
			expect(STATS.alerts, 'STATS.alerts').to.be.equal(1);
			expect(result.alert, 'resolver.alert').to.be.true;
			expect(result, 'returned resolver').to.be.deep.equal(resolver);

			Date.now.restore();
			utils.calculateSpeed.restore();
			utils.countResolverResponses.restore();
			appsettings.getSetting.restore();
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
			alerts: 0,
			status: 'ok'
		};
		const resolvers = { test_resolver: {} };
		const resolversMap = new Map([
			['test_resolver', {}]
		]);
		const STORE = {
			__STATUSES: {
				resolvers: {}
			}
		};

		spy(handleResolver, 'bind');
		stub(utils, 'createMapFromObject').callsFake(() => resolversMap);

		expect(calculate(null, null, STORE), 'result [resolvers = null]').to.be.a('null');
		expect(STORE.__STATUSES.resolvers.ready, '__STATUSES.resolvers.ready [resolvers = {}]').to.be.false;
		expect(utils.createMapFromObject.notCalled, 'createMapFromObject not called').to.be.true;

		delete STORE.__STATUSES.resolvers.ready;

		expect(calculate({}, null, STORE), 'result [resolvers = {}]').to.be.a('null');
		expect(STORE.__STATUSES.resolvers.ready, '__STATUSES.resolvers.ready [resolvers = {}]').to.be.false;
		expect(utils.createMapFromObject.notCalled, 'createMapFromObject not called').to.be.true;

		const result = calculate(resolvers, previousState, STORE);

		expect(utils.createMapFromObject.calledOnce, 'createMapFromObject called once').to.be.true;
		expect(utils.createMapFromObject.args[0][0], 'createMapFromObject 1st arg').to.be.deep.equal(resolvers);
		expect(utils.createMapFromObject.args[0][1].name, 'createMapFromObject 2nd arg').to.be.equal('bound handleResolver');
		expect(handleResolver.bind.calledOnce, 'handleResolver.bind called once').to.be.true;
		expect(handleResolver.bind.args[0][0], 'handleResolver.bind 1st arg').to.be.a('null');

		STATS.total = resolversMap.size;

		expect(handleResolver.bind.args[0][1], 'handleResolver.bind 2nd arg').to.be.deep.equal(STATS);
		expect(handleResolver.bind.args[0][2], 'handleResolver.bind 3rd arg').to.be.equal(previousState);
		expect(utils.createMapFromObject.args[0][2], 'createMapFromObject 3rd arg').to.be.false;
		expect(result.__STATS, 'resolvers.__STATS').to.be.deep.equal(STATS);
		expect(STORE.__STATUSES.resolvers, 'STORE.__STATUSES.resolvers').to.be.deep.equal({
			ready: true,
			status: STATS.status
		});

		handleResolver.bind.restore();
		utils.createMapFromObject.restore();
	});
});
