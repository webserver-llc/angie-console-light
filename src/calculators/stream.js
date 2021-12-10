/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import utils from './utils.js';
import { upstreamsCalculatorFactory } from './factories.js';

export function handleZones(STATS, previous, zone, name){
	const previousZone = previous ? previous.get(name) : null;

	if (previousZone) {
		const period = Date.now() - previous.lastUpdate;

		zone.sent_s = utils.calculateSpeed(previousZone.sent, zone.sent, period);
		zone.rcvd_s = utils.calculateSpeed(previousZone.received, zone.received, period);
		zone.zone_conn_s = utils.calculateSpeed(previousZone.connections, zone.connections, period);

		STATS.conn_s += zone.zone_conn_s;

		utils.calculateTraffic(STATS, zone);
	}

	utils.handleErrors(previousZone, zone, 'sessions');

	if (zone['5xxChanged'] || zone['4xxChanged']) {
		STATS.status = 'danger';
	}

	STATS.conn_total += zone.connections;
	STATS.conn_current += zone.processing;

	return zone;
};

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
		},
		status: 'ok'
	};

	zones = utils.createMapFromObject(zones, handleZones.bind(null, STATS, previous));

	zones.__STATS = STATS;

	__STATUSES.tcp_zones.ready = true;
	__STATUSES.tcp_zones.status = STATS.status;

	return zones;
};

export const upstreams = upstreamsCalculatorFactory('tcp_upstreams');
