/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import { getSetting } from '../appsettings';

export const is4xxThresholdReached = obj =>
	obj.responses['4xx'] / obj.requests * 100 > getSetting('warnings4xxThresholdPercent');

export const calculateSpeed = (previous, now, period) => {
	if (typeof previous !== 'number') {
		return 'n/a';
	}

	if (previous > now) {
		return 0;
	}

	return Math.floor((now - previous) * 1000 / period);
};

export const processPeer = (peer, previousPeer, period, STATS) => {
	// Both TCP and HTTP Upstreams
	peer.max_conns = peer.max_conns || Infinity;
	peer.health_status = ('last_passed' in peer.health_checks) ? !!peer.health_checks.last_passed : null;

	if (previousPeer) {
		peer.server_sent_s = calculateSpeed(previousPeer.sent, peer.sent, period);
		peer.server_rcvd_s = calculateSpeed(previousPeer.received, peer.received, period);
	}

	switch (peer.state) {
		case 'up':
			STATS.servers.up++;
			break;
		case 'unavail':
		case 'unhealthy':
			STATS.servers.failed++;
			STATS.failures++;
	}

	if (peer.health_status === false) {
		STATS.alerts++;
	}
};

export const calculateTraffic = ({ traffic }, zone) => {
	traffic.in += typeof zone.rcvd_s === 'number' ? zone.rcvd_s : 0;
	traffic.out += typeof zone.sent_s === 'number' ? zone.sent_s : 0;
};

export const createMapFromObject = (obj, fn, sort=true) => {
	const keys = Object.keys(obj);

	if (sort) {
		keys.sort();
	}

	return new Map(keys.map((key, i) => [
		key, fn(obj[key], key, i)
	]));
};
