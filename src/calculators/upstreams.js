/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import { is4xxThresholdReached, processPeer } from './utils';
import { calculateSpeed, createMapFromObject } from './utils.js';

export default (upstreams, previousState, { __STATUSES, slabs }) => {
	if (upstreams === null || Object.keys(upstreams).length === 0) {
		__STATUSES.upstreams.ready = false;
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

	upstreams = createMapFromObject(upstreams, (upstream, upstreamName) => {
		STATS.servers.all += upstream.peers.length;

		if (slabs) {
			const zone = slabs.get(upstream.zone);
			upstream.zoneSize = zone.percentSize;
			upstream.slab = zone;
		} else {
			upstream.zoneSize = null;
		}

		upstream.name = upstreamName;

		upstream.peers.forEach((peer) => {
			let previousPeer;

			if (previousState && previousState.has(upstreamName)) {
				previousPeer = previousState.get(upstreamName).peers.find(prevPeer => prevPeer.id === peer.id) || null;
			}

			if (previousPeer) {
				peer.server_req_s = calculateSpeed(previousPeer.requests, peer.requests, period);
			}

			processPeer(peer, previousPeer, period, STATS);

			peer.isHttp = true;

			if (is4xxThresholdReached(peer)) {
				__STATUSES.upstreams['4xx'] = true;
				newStatus = 'warning';
				STATS.warnings++;
			}

			// Flashing cell of 4xx
			if (previousPeer && peer.responses['4xx'] > 0 && peer.responses['4xx'] !== previousPeer.responses['4xx']) {
				peer['4xxChanged'] = true;
			}

			// Error and flashing cell of 5xx
			if (previousPeer && peer.responses['5xx'] > 0 && previousPeer.responses['5xx'] !== peer.responses['5xx']) {
				peer['5xxChanged'] = true;
			}

			if (peer.state === 'unavail' || peer.state === 'unhealthy') {
				upstream.hasFailedPeer = true;
			}

			if (peer.health_status === false) {
				newStatus = 'danger';
			}
		});

		return upstream;
	});

	STATS.total = upstreams.size;

	upstreams.__STATS = STATS;
	__STATUSES.upstreams.ready = true;
	__STATUSES.upstreams.status = newStatus;

	return upstreams;
};
