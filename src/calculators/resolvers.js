/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import appsettings from '../appsettings';
import { DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT } from '../constants.js';
import utils from './utils.js';

export function handleResolver(STATS, previousState, resolver, name){
	const { requests, responses } = resolver;
	const totalReqs = Object.keys(requests).reduce((memo, key) => {
		if (typeof requests[key] === 'number') {
			memo += requests[key];
		}

		return memo;
	}, 0);
	let previousResolver = previousState && previousState.get(name);

	if (previousResolver) {
		const period = Date.now() - previousState.lastUpdate;
		const {
			requests: prevRequests,
			responses: prevResponses
		} = previousResolver;
		const prevTotalReqs = Object.keys(prevRequests).reduce((memo, key) => {
			if (typeof prevRequests[key] === 'number') {
				memo += prevRequests[key];
			}

			return memo;
		}, 0);

		STATS.traffic.in += utils.calculateSpeed(
			prevTotalReqs,
			totalReqs,
			period
		);

		const {
			allResponses,
			errResponses
		} = utils.countResolverResponses(responses);
		const {
			allResponses: prevAllResponses,
			errResponses: prevErrResponses
		} = utils.countResolverResponses(prevResponses);

		STATS.traffic.out += utils.calculateSpeed(
			prevAllResponses,
			allResponses,
			period
		);

		const threshold = parseInt(
			appsettings.getSetting('resolverErrorsThreshold', DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT),
			10
		);

		if ((errResponses - prevErrResponses) * 100 / (totalReqs - prevTotalReqs) > threshold) {
			resolver.alert = true;
			STATS.status = 'danger';
			STATS.alerts++;
		}
	}

	return resolver;
};

export default (resolvers, previousState, { __STATUSES }) => {
	if (resolvers === null || Object.keys(resolvers).length === 0) {
		__STATUSES.resolvers.ready = false;
		return null;
	}

	const STATS = {
		total: 0,
		traffic: {
			in: 0,
			out: 0
		},
		alerts: 0,
		status: 'ok'
	};

	resolvers = utils.createMapFromObject(resolvers, handleResolver.bind(null, STATS, previousState), false);

	STATS.total = resolvers.size;

	resolvers.__STATS = STATS;
	__STATUSES.resolvers.ready = true;
	__STATUSES.resolvers.status = STATS.status;

	return resolvers;
};
