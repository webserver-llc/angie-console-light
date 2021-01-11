/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import {
	is4xxThresholdReached,
	calculateSpeed,
	calculateTraffic,
	createMapFromObject,
	handleErrors
} from './utils.js';

export function handleZones(STATS, previousState, zone, zoneName){
	const previousZone = previousState && previousState.get(zoneName);

	if (previousZone) {
		const period = Date.now() - previousState.lastUpdate;

		zone.sent_s = calculateSpeed(previousZone.sent, zone.sent, period);
		zone.rcvd_s = calculateSpeed(previousZone.received, zone.received, period);
		zone.zone_req_s = calculateSpeed(previousZone.requests, zone.requests, period);

		calculateTraffic(STATS, zone);
	}

	// Warning
	if (is4xxThresholdReached(zone)) {
		zone.warning = true;
		STATS.status = 'warning';
		STATS.warnings++;
	}

	handleErrors(previousZone, zone);

	if (zone['5xxChanged'] === true) {
		STATS.status = 'danger';
		STATS.alerts++;
	}

	return zone;
};

export default (zones, previousState, { __STATUSES }) => {
	if (zones === null || Object.keys(zones).length === 0) {
		__STATUSES.server_zones.ready = false;
		return null;
	}

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

	zones = createMapFromObject(zones, handleZones.bind(null, STATS, previousState), false);

	STATS.total = zones.size;

	zones.__STATS = STATS;
	__STATUSES.server_zones.ready = true;
	__STATUSES.server_zones.status = STATS.status;

	return zones;
};
