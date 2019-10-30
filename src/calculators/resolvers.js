/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import { getSetting } from '../appsettings';
import { DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT } from '../constants.js';
import {
	createMapFromObject,
	calculateSpeed,
	countResolverResponses
} from './utils.js';

export default (resolvers, previousState, { __STATUSES }) => {
	if (resolvers === null || Object.keys(resolvers).length === 0) {
		__STATUSES.resolvers.ready = false;
		return null;
	}

	let newStatus = 'ok';

	const STATS = {
		total: 0,
		traffic: {
			in: 0,
			out: 0
		},
		alerts: 0
	};

	let period;

	if (previousState) {
		period = Date.now() - previousState.lastUpdate;
	}

	resolvers = createMapFromObject(resolvers, (resolver, name) => {
		const { requests, responses } = resolver;
		const totalReqs = Object.keys(requests).reduce((memo, key) => {
			if (typeof requests[key] === 'number') {
				memo += requests[key];
			}

			return memo;
		}, 0);
		let previousResolver = previousState && previousState.get(name);

		if (previousResolver) {
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

			STATS.traffic.in += calculateSpeed(
				prevTotalReqs,
				totalReqs,
				period
			);

			const {
				allResponses,
				errResponses
			} = countResolverResponses(responses);
			const {
				allResponses: prevAllResponses,
				errResponses: prevErrResponses
			} = countResolverResponses(prevResponses);

			STATS.traffic.out += calculateSpeed(
				prevAllResponses,
				allResponses,
				period
			);

			const threshold = parseInt(
				getSetting('resolverErrorsThreshold', DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT),
				10
			);

			if ((errResponses - prevErrResponses) * 100 / (totalReqs - prevTotalReqs) > threshold) {
				resolver.alert = true;
				newStatus = 'danger';
				STATS.alerts++;
			}
		}

		return resolver;
	}, false);

	STATS.total = resolvers.size;

	resolvers.__STATS = STATS;
	__STATUSES.resolvers.ready = true;
	__STATUSES.resolvers.status = newStatus;

	return resolvers;
};
