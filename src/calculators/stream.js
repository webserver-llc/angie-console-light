/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import { calculateSpeed, calculateTraffic, processPeer, createMapFromObject } from './utils.js';

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

		STATS.conn_total += zone.connections;
		STATS.conn_current += zone.processing;

		return zone;
	});

	zones.__STATS = STATS;

	__STATUSES.tcp_zones.ready = true;

	return zones;
};

export const upstreams = (upstreams, previousState, { slabs, __STATUSES }) => {
	if (upstreams === null || Object.keys(upstreams).length === 0) {
		__STATUSES.tcp_upstreams.ready = false;
		return null;
	}

	const STATS = {
		total: 0,
		servers: {
			all: 0,
			up: 0,
			failed: 0
		},
		failures: 0,
		warnings: 0,
		alerts: 0
	};

	let period;

	if (previousState) {
		period = Date.now() - previousState.lastUpdate;
	}

	let newStatus = 'ok';

	upstreams = createMapFromObject(upstreams, (upstream, name) => {
		let previousUpstream;

		if (previousState) {
			previousUpstream = previousState.get(name);
		}

		upstream.name = name;

		if (slabs) {
			const zone = slabs.get(upstream.zone);
			upstream.zoneSize = zone.percentSize;
			upstream.slab = zone;
		} else {
			upstream.zoneSize = null;
		}

		upstream.peers.forEach((peer) => {
			let previousPeer = null;

			if (previousUpstream) {
				previousPeer = previousUpstream.peers.find(prevPeer => prevPeer.id === peer.id);

				if (previousPeer) {
					peer.server_conn_s = calculateSpeed(previousPeer.connections, peer.connections, period);
				}
			}

			processPeer(peer, previousPeer, period, STATS);

			if (peer.state === 'unavail' || peer.state === 'unhealthy') {
				upstream.hasFailedPeer = true;
			}

			if (peer.health_status === false) {
				newStatus = 'danger';
			}
		});

		STATS.servers.all += upstream.peers.length;

		return upstream;
	});

	STATS.total = upstreams.size;
	upstreams.__STATS = STATS;
	__STATUSES.tcp_upstreams.ready = true;
	__STATUSES.tcp_upstreams.status = newStatus;

	return upstreams;
};
