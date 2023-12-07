/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import utils from './utils.js';

export function handleZones(STATS, previousState, location, locationName) {
	const previousLocation = previousState && previousState.get(locationName);

	if (previousLocation) {
		const period = Date.now() - previousState.lastUpdate;

		location.sent_s = utils.calculateSpeed(previousLocation.data.sent, location.data.sent, period);
		location.rcvd_s = utils.calculateSpeed(previousLocation.data.received, location.data.received, period);
		location.zone_req_s = utils.calculateSpeed(previousLocation.requests, location.requests, period);
	}

	// Warning
	if (utils.is4xxThresholdReached(location)) {
		location.warning = true;
		STATS.status = 'warning';
		STATS.warnings++;
	}

	utils.handleErrors(previousLocation, location);

	if (location['5xxChanged'] === true) {
		STATS.status = 'danger';
		STATS.alerts++;
	}

	return location;
}

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

	locations = utils.createMapFromObject(
		locations,
		handleZones.bind(null, STATS, previousState),
		false
	);

	STATS.total = locations.size;

	locations.__STATS = STATS;
	__STATUSES.location_zones.ready = true;
	__STATUSES.location_zones.status = STATS.status;

	return locations;
};
