/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import { is4xxThresholdReached, calculateSpeed, calculateTraffic, createMapFromObject } from './utils.js';

export default (zones, previousState, { __STATUSES }) => {
	if (zones === null || Object.keys(zones).length === 0) {
		__STATUSES.server_zones.ready = false;
		return null;
	}

	let newStatus = 'ok';

	const STATS = {
		total: 0,
		traffic: {
			in: 0,
			out: 0
		},
		warnings: 0,
		alerts: 0
	};

	let period;

	if (previousState) {
		period = Date.now() - previousState.lastUpdate;
	}

	zones = createMapFromObject(zones, (zone, zoneName) => {
		const previousZone = previousState && previousState.get(zoneName);

		if (previousZone) {
			zone.sent_s = calculateSpeed(previousZone.sent, zone.sent, period);
			zone.rcvd_s = calculateSpeed(previousZone.received, zone.received, period);
			zone.zone_req_s = calculateSpeed(previousZone.requests, zone.requests, period);

			calculateTraffic(STATS, zone);
		}

		// Warning
		if (is4xxThresholdReached(zone)) {
			zone.warning = true;
			__STATUSES.server_zones['4xx'] = true;
			newStatus = 'warning';
			STATS.warnings++;
		}

		// TODO: combine with upstreams calculator
		// Flashing cell of 4xx
		if (previousZone && zone.responses['4xx'] > 0 && zone.responses['4xx'] !== previousZone.responses['4xx']) {
			zone['4xxChanged'] = true;
		}

		// Error and flashing cell of 5xx
		if (previousZone && zone.responses['5xx'] > 0 && previousZone.responses['5xx'] !== zone.responses['5xx']) {
			zone.alert = true;
			__STATUSES.server_zones['5xx'] = true;
			newStatus = 'danger';
			STATS.alerts++;
		}

		return zone;
	}, false);

	STATS.total = zones.size;

	zones.__STATS = STATS;
	__STATUSES.server_zones.ready = true;
	__STATUSES.server_zones.status = newStatus;

	return zones;
};
