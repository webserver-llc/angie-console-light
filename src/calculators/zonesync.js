/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import appsettings from '../appsettings';
import { DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT } from '../constants.js';
import {
	createMapFromObject,
	calculateSpeed
} from './utils.js';

export function handleZones(STATS, zone){
	let isAlert = false;
	let isWarning = false;

	if (zone.records_total > 0) {
		const alertThreshold = parseInt(
			appsettings.getSetting(
				'zonesyncPendingThreshold',
				DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT
			), 10
		);
		const pendingPercent = zone.records_pending * 100 / zone.records_total;

		if (pendingPercent > alertThreshold) {
			isAlert = true;
		} else if (pendingPercent > 0.75 * alertThreshold) {
			isWarning = true;
		}
	} else {
		isAlert = zone.records_pending > 0;
	}

	if (isAlert) {
		zone.alert = true;
		STATS.status = 'danger';
		STATS.alerts++;
	} else if (isWarning) {
		zone.warning = true;
		STATS.status = 'warning';
		STATS.warnings++;
	}

	return zone;
};

export default (zone_sync, previousState, { __STATUSES }) => {
	if (zone_sync === null || Object.keys(zone_sync).length === 0) {
		__STATUSES.zone_sync.ready = false;
		return null;
	}

	const STATS = {
		total: 0,
		traffic: {
			in: 0,
			out: 0
		},
		alerts: 0,
		warnings: 0,
		status: 'ok'
	};

	if (previousState) {
		const period = Date.now() - previousState.lastUpdate;

		STATS.traffic.in = calculateSpeed(
			previousState.status.msgs_in,
			zone_sync.status.msgs_in,
			period
		);
		STATS.traffic.out = calculateSpeed(
			previousState.status.msgs_out,
			zone_sync.status.msgs_out,
			period
		);
	}

	zone_sync.zones = createMapFromObject(zone_sync.zones, handleZones.bind(null, STATS), false);

	STATS.total = zone_sync.zones.size;

	zone_sync.__STATS = STATS;
	__STATUSES.zone_sync.ready = true;
	__STATUSES.zone_sync.status = STATS.status;

	return zone_sync;
};
