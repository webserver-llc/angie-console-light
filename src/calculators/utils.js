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

export const calculateTraffic = ({ traffic }, zone) => {
	traffic.in += typeof zone.rcvd_s === 'number' ? zone.rcvd_s : 0;
	traffic.out += typeof zone.sent_s === 'number' ? zone.sent_s : 0;
};

export const createMapFromObject = (obj, fn, sort = true) => {
	const keys = Object.keys(obj);

	if (sort) {
		keys.sort();
	}

	return new Map(keys.map((key, i) => [
		key, fn(obj[key], key, i)
	]));
};

export const handleErrors = (previousData, data) => {
	// Flashing cell of 4xx
	if (previousData && data.responses['4xx'] > 0 &&
		data.responses['4xx'] !== previousData.responses['4xx']) {
		data['4xxChanged'] = true;
	}

	// Error and flashing cell of 5xx
	if (previousData && data.responses['5xx'] > 0 &&
		previousData.responses['5xx'] !== data.responses['5xx']) {
		data['5xxChanged'] = true;
	}
};

export const upstreamsCalculatorFactory = upstreamsKey => (upstreams, previousState, { slabs, __STATUSES }) => {
	if (upstreams === null || Object.keys(upstreams).length === 0) {
		__STATUSES[upstreamsKey].ready = false;
		return null;
	}

	const STATS = {
		total: 0,
		servers: {
			all: 0,
			up: 0,
			down: 0,
			failed: 0,
			draining: 0
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
		let previousUpstreamState = null;

		if (previousState) {
			previousUpstreamState = previousState.get(name);
		}

		upstream.name = name;

		if (slabs) {
			const zone = slabs.get(upstream.zone);
			upstream.zoneSize = zone.percentSize;
			upstream.slab = zone;
		} else {
			upstream.zoneSize = null;
		}

		upstream.stats = {
			all: 0,
			up: 0,
			down: 0,
			failed: 0,
			draining: 0,
			checking: 0
		};

		let isUpstreamInDanger = false;

		// Both TCP and HTTP Upstreams
		upstream.peers.forEach((peer) => {
			let previousPeer = null;

			if (previousUpstreamState) {
				previousPeer = previousUpstreamState.peers.find(prevPeer => prevPeer.id === peer.id);

				if (previousPeer) {
					if (upstreamsKey === 'upstreams') {
						peer.server_req_s = calculateSpeed(previousPeer.requests, peer.requests, period);
					} else if (upstreamsKey === 'tcp_upstreams') {
						peer.server_conn_s = calculateSpeed(previousPeer.connections, peer.connections, period);
					}
				}
			}

			peer.max_conns = peer.max_conns || Infinity;
			peer.health_status = 'last_passed' in peer.health_checks ? !!peer.health_checks.last_passed : null;

			if (previousPeer) {
				peer.server_sent_s = calculateSpeed(previousPeer.sent, peer.sent, period);
				peer.server_rcvd_s = calculateSpeed(previousPeer.received, peer.received, period);
			}

			switch (peer.state) {
				case 'up':
					STATS.servers.up++;
					upstream.stats.up++;
					break;
				case 'down':
					STATS.servers.down++;
					upstream.stats.down++;
					break;
				case 'unavail':
				case 'unhealthy':
					STATS.servers.failed++;
					upstream.stats.failed++;
					break;
				case 'draining':
					STATS.servers.draining++;
					upstream.stats.draining++;
					break;
					break;
				case 'checking':
					upstream.stats.checking++;
					break;
			}

			STATS.servers.all++;
			upstream.stats.all++;

			if (peer.health_status === false) {
				STATS.alerts++;
			}

			if (upstreamsKey === 'upstreams') {
				peer.isHttp = true;

				if (is4xxThresholdReached(peer)) {
					__STATUSES.upstreams['4xx'] = true;
					isUpstreamInDanger = true;
					newStatus = 'warning';
				}

				handleErrors(previousPeer, peer);
			}

			if (peer.state === 'unavail' || peer.state === 'unhealthy') {
				upstream.hasFailedPeer = true;
			}

			if (peer.health_status === false) {
				newStatus = 'danger';
			}
		});

		if (upstream.hasFailedPeer) {
			STATS.failures++;
		}

		if (isUpstreamInDanger) {
			STATS.warnings++;
		}

		return upstream;
	});

	STATS.total = upstreams.size;

	upstreams.__STATS = STATS;

	__STATUSES[upstreamsKey].ready = true;
	__STATUSES[upstreamsKey].status = newStatus;

	return upstreams;
};
