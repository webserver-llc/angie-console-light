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

export default (locations, previousState, { __STATUSES }) => {
	if (locations === null || Object.keys(locations).length === 0) {
		__STATUSES.location_zones.ready = false;
		return null;
	}

	let newStatus = 'ok';

	const STATS = {
		warnings: 0,
		alerts: 0
	};

	let period;

	if (previousState) {
		period = Date.now() - previousState.lastUpdate;
	}

	locations = createMapFromObject(locations, (location, locationName) => {
		const previousLocation = previousState && previousState.get(locationName);

		if (previousLocation) {
			location.sent_s = calculateSpeed(previousLocation.sent, location.sent, period);
			location.rcvd_s = calculateSpeed(previousLocation.received, location.received, period);
			location.zone_req_s = calculateSpeed(previousLocation.requests, location.requests, period);
		}

		// Warning
		if (is4xxThresholdReached(location)) {
			location.warning = true;
			newStatus = 'warning';
			STATS.warnings++;
		}

		handleErrors(previousLocation, location);

		if (location['5xxChanged'] === true) {
			newStatus = 'danger';
			STATS.alerts++;
		}

		return location;
	}, false);

	locations.__STATS = STATS;
	__STATUSES.location_zones.ready = true;
	__STATUSES.location_zones.status = newStatus;

	return locations;
};
