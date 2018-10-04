/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import {
	calculateSpeed,
	calculateTraffic,
	createMapFromObject,
	upstreamsCalculatorFactory,
	handleErrors
} from './utils.js';

export const zones = (zones, previous, { __STATUSES }) => {
	if (zones === null || Object.keys(zones).length === 0) {
		__STATUSES.tcp_zones.ready = false;
		return null;
	}

	const STATS = {
		conn_total: 0,
		conn_current: 0,
		conn_s: 0,
		traffic: {
			in: 0,
			out: 0
		}
	};

	let newStatus = 'ok';

	zones = createMapFromObject(zones, (zone, name) => {
		const previousZone = previous ? previous.get(name) : null;

		if (previousZone) {
			const period = Date.now() - previous.lastUpdate;

			zone.sent_s = calculateSpeed(previousZone.sent, zone.sent, period);
			zone.rcvd_s = calculateSpeed(previousZone.received, zone.received, period);
			zone.zone_conn_s = calculateSpeed(previousZone.connections, zone.connections, period);

			STATS.conn_s += zone.zone_conn_s;

			calculateTraffic(STATS, zone);
		}

		handleErrors(previousZone, zone, 'sessions');

		if (zone['5xxChanged'] || zone['4xxChanged']) {
			newStatus = 'danger';
		}

		STATS.conn_total += zone.connections;
		STATS.conn_current += zone.processing;

		return zone;
	});

	zones.__STATS = STATS;

	__STATUSES.tcp_zones.ready = true;
	__STATUSES.tcp_zones.status = newStatus;

	return zones;
};

export const upstreams = upstreamsCalculatorFactory('tcp_upstreams');
