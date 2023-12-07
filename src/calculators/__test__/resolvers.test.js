/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
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
		let STATS; let resolver; let
			previousState;

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
			const spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			const spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation(() => {});
			const spyUtilsCountResolverResponse = jest.spyOn(utils, 'countResolverResponses').mockClear().mockImplementation(() => {});
			const spyAppSettingsGetSetting = jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => {});

			const result = handleResolver(STATS, null, resolver);

			// Date.now not called
			expect(spyDateNow).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(spyUtilsCalculateSpeed).not.toHaveBeenCalled();
			// countResolverResponses not called
			expect(spyUtilsCountResolverResponse).not.toHaveBeenCalled();
			// getSetting not called
			expect(spyAppSettingsGetSetting).not.toHaveBeenCalled();
			// STATS
			expect(STATS).toEqual(STATS);
			// STATS.traffic.in
			expect(STATS.traffic.in).toBe(0);
			// STATS.traffic.out
			expect(STATS.traffic.out).toBe(0);
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			expect(result.alert).toBeUndefined();
			// returned resolver
			expect(result).toEqual(resolver);
		});

		it('no resolver in previous state', () => {
			const spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			const spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation(() => {});
			const spyUtilsCountResolverResponse = jest.spyOn(utils, 'countResolverResponses').mockClear().mockImplementation(() => {});
			const spyAppSettingsGetSetting = jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => {});

			const result = handleResolver(STATS, previousState, resolver, 'unknown_resolver');

			// Date.now not called
			expect(spyDateNow).not.toHaveBeenCalled();
			// calculateSpeed not called
			expect(spyUtilsCalculateSpeed).not.toHaveBeenCalled();
			// countResolverResponses not called
			expect(spyUtilsCountResolverResponse).not.toHaveBeenCalled();
			// getSetting not called
			expect(spyAppSettingsGetSetting).not.toHaveBeenCalled();
			// STATS.traffic.in
			expect(STATS.traffic.in).toBe(0);
			// STATS.traffic.out
			expect(STATS.traffic.out).toBe(0);
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			expect(result.alert).toBeUndefined();
			// returned resolver
			expect(result).toEqual(resolver);
		});

		it('with previous state', () => {
			const spyDateNow = jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			const spyUtilsCalculateSpeed = jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			const spyUtilsCountResolverResponse = jest.spyOn(utils, 'countResolverResponses').mockClear().mockImplementation(
				_responses => _responses.noerror === resolver.responses.noerror ? responses : prevResponses
			);
			const spyAppSettingsGetSetting = jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => 50);

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

			// Date.now called once
			expect(spyDateNow).toHaveBeenCalled();
			// calculateSpeed called twice
			expect(spyUtilsCalculateSpeed).toHaveBeenCalledTimes(2);
			// calculateSpeed 1st call 1st arg
			expect(utils.calculateSpeed.mock.calls[0][0]).toBe(53);
			// calculateSpeed 1st call 2nd arg
			expect(utils.calculateSpeed.mock.calls[0][1]).toBe(76);
			// calculateSpeed 1st call 3rd arg
			expect(utils.calculateSpeed.mock.calls[0][2]).toBe(period);
			// calculateSpeed 2nd call 1st arg
			expect(utils.calculateSpeed.mock.calls[1][0]).toBe(53);
			// calculateSpeed 2nd call 2nd arg
			expect(utils.calculateSpeed.mock.calls[1][1]).toBe(71);
			// calculateSpeed 2nd call 3rd arg
			expect(utils.calculateSpeed.mock.calls[1][2]).toBe(period);
			// countResolverResponses called twice
			expect(utils.countResolverResponses).toHaveBeenCalledTimes(2);
			// countResolverResponses 1st call 1st arg
			expect(utils.countResolverResponses.mock.calls[0][0]).toEqual(resolver.responses);
			// countResolverResponses 2nd call 1st arg
			expect(utils.countResolverResponses.mock.calls[1][0]).toEqual(previousState.get(resolverName).responses);
			// getSettings called once
			expect(appsettings.getSetting).toHaveBeenCalled();
			// getSettings 1st arg
			expect(appsettings.getSetting.mock.calls[0][0]).toBe('resolverErrorsThreshold');
			// getSettings 2nd arg
			expect(appsettings.getSetting.mock.calls[0][1]).toBe(DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT);
			// STATS.traffic.in
			expect(STATS.traffic.in).toBe(76);
			// STATS.traffic.out
			expect(STATS.traffic.out).toBe(71);
			// STATS.status
			expect(STATS.status).toBe('ok');
			// STATS.alerts
			expect(STATS.alerts).toBe(0);
			expect(result.alert).toBeUndefined();
			// returned resolver
			expect(result).toEqual(resolver);
		});

		it('errors threshold reached', () => {
			jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
			jest.spyOn(utils, 'countResolverResponses').mockClear().mockImplementation(
				_responses => _responses.noerror === resolver.responses.noerror ? responses : prevResponses
			);
			jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => 0);

			const result = handleResolver(STATS, previousState, resolver, resolverName);

			// Date.now called once
			expect(Date.now).toHaveBeenCalled();
			// calculateSpeed called twice
			expect(utils.calculateSpeed).toHaveBeenCalledTimes(2);
			// calculateSpeed 1st call 1st arg
			expect(utils.calculateSpeed.mock.calls[0][0]).toBe(53);
			// calculateSpeed 1st call 2nd arg
			expect(utils.calculateSpeed.mock.calls[0][1]).toBe(76);
			// calculateSpeed 1st call 3rd arg
			expect(utils.calculateSpeed.mock.calls[0][2]).toBe(period);
			// calculateSpeed 2nd call 1st arg
			expect(utils.calculateSpeed.mock.calls[1][0]).toBe(53);
			// calculateSpeed 2nd call 2nd arg
			expect(utils.calculateSpeed.mock.calls[1][1]).toBe(71);
			// calculateSpeed 2nd call 3rd arg
			expect(utils.calculateSpeed.mock.calls[1][2]).toBe(period);
			// countResolverResponses called twice
			expect(utils.countResolverResponses).toHaveBeenCalledTimes(2);
			// countResolverResponses 1st call 1st arg
			expect(utils.countResolverResponses.mock.calls[0][0]).toEqual(resolver.responses);
			// countResolverResponses 2nd call 1st arg
			expect(utils.countResolverResponses.mock.calls[1][0]).toEqual(previousState.get(resolverName).responses);
			// getSettings called once
			expect(appsettings.getSetting).toHaveBeenCalled();
			// getSettings 1st arg
			expect(appsettings.getSetting.mock.calls[0][0]).toBe('resolverErrorsThreshold');
			// getSettings 2nd arg
			expect(appsettings.getSetting.mock.calls[0][1]).toBe(DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT);
			// STATS.traffic.in
			expect(STATS.traffic.in).toBe(76);
			// STATS.traffic.out
			expect(STATS.traffic.out).toBe(71);
			// STATS.status
			expect(STATS.status).toBe('danger');
			// STATS.alerts
			expect(STATS.alerts).toBe(1);
			// resolver.alert
			expect(result.alert).toBe(true);
			// returned resolver
			expect(result).toEqual(resolver);
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

		jest.spyOn(handleResolver, 'bind').mockClear();
		jest.spyOn(utils, 'createMapFromObject').mockClear().mockImplementation(() => resolversMap);

		expect(calculate(null, null, STORE)).toBeNull();
		// __STATUSES.resolvers.ready [resolvers = {}]
		expect(STORE.__STATUSES.resolvers.ready).toBe(false);
		// createMapFromObject not called
		expect(utils.createMapFromObject).not.toHaveBeenCalled();

		delete STORE.__STATUSES.resolvers.ready;

		expect(calculate({}, null, STORE)).toBeNull();
		// __STATUSES.resolvers.ready [resolvers = {}]
		expect(STORE.__STATUSES.resolvers.ready).toBe(false);
		// createMapFromObject not called
		expect(utils.createMapFromObject).not.toHaveBeenCalled();

		const result = calculate(resolvers, previousState, STORE);

		// createMapFromObject called once
		expect(utils.createMapFromObject).toHaveBeenCalled();
		// createMapFromObject 1st arg
		expect(utils.createMapFromObject.mock.calls[0][0]).toEqual(resolvers);
		// createMapFromObject 2nd arg
		expect(utils.createMapFromObject.mock.calls[0][1].name).toBe('bound handleResolver');
		// handleResolver.bind called once
		expect(handleResolver.bind).toHaveBeenCalled();
		expect(handleResolver.bind.mock.calls[0][0]).toBeNull();

		STATS.total = resolversMap.size;

		// handleResolver.bind 2nd arg
		expect(handleResolver.bind.mock.calls[0][1]).toEqual(STATS);
		// handleResolver.bind 3rd arg
		expect(handleResolver.bind.mock.calls[0][2]).toBe(previousState);
		// createMapFromObject 3rd arg
		expect(utils.createMapFromObject.mock.calls[0][2]).toBe(false);
		// resolvers.__STATS
		expect(result.__STATS).toEqual(STATS);
		// STORE.__STATUSES.resolvers
		expect(STORE.__STATUSES.resolvers).toEqual({
			ready: true,
			status: STATS.status
		});
	});
});
