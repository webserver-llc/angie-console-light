/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import {
	is4xxThresholdReached,
	calculateSpeed,
	createMapFromObject,
	handleErrors
} from './utils.js';

export function handleZones(STATS, previousState, location, locationName){
	const previousLocation = previousState && previousState.get(locationName);

	if (previousLocation) {
		let period = Date.now() - previousState.lastUpdate;

		location.sent_s = calculateSpeed(previousLocation.sent, location.sent, period);
		location.rcvd_s = calculateSpeed(previousLocation.received, location.received, period);
		location.zone_req_s = calculateSpeed(previousLocation.requests, location.requests, period);
	}

	// Warning
	if (is4xxThresholdReached(location)) {
		location.warning = true;
		STATS.status = 'warning';
		STATS.warnings++;
	}

	handleErrors(previousLocation, location);

	if (location['5xxChanged'] === true) {
		STATS.status = 'danger';
		STATS.alerts++;
	}

	return location;
};

export default (locations, previousState, { __STATUSES }) => {
	if (locations === null || Object.keys(locations).length === 0) {
		__STATUSES.location_zones.ready = false;
		return null;
	}

	const STATS = {
		total: 0,
		warnings: 0,
		alerts: 0,
		status: 'ok'
	};

	locations = createMapFromObject(locations, handleZones.bind(null, STATS, previousState), false);

	STATS.total = locations.size;

	locations.__STATS = STATS;
	__STATUSES.location_zones.ready = true;
	__STATUSES.location_zones.status = STATS.status;

	return locations;
};
