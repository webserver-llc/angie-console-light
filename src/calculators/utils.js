/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import appsettings from '../appsettings';

export const is4xxThresholdReached = obj =>
	obj.responses['4xx'] / obj.requests * 100 > appsettings.getSetting('warnings4xxThresholdPercent');

export const calculateSpeed = (previous, now, period) => {
	if (
		typeof previous !== 'number' ||
		typeof now !== 'number'
	) {
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

export const handleErrors = (previousData, data, key = 'responses') => {
	// Flashing cell of 4xx
	if (previousData && data[key]['4xx'] > previousData[key]['4xx']) {
		data['4xxChanged'] = true;
	}

	// Error and flashing cell of 5xx
	if (previousData && data[key]['5xx'] > previousData[key]['5xx']) {
		data['5xxChanged'] = true;
	}
};

export const pickZoneSize = (obj, slabs, zoneName) => {
	obj.zoneSize = null;

	if (slabs) {
		const zone = slabs.get(zoneName);

		if (zone) {
			obj.slab = zone;
			obj.zoneSize = zone.percentSize;
		}
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

		pickZoneSize(upstream, slabs, upstream.zone);

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

export const countResolverResponses = (responses) => {
	let allResponses = 0;
	let errResponses = 0;

	Object.keys(responses).forEach(key => {
		if (typeof responses[key] === 'number') {
			if (key !== 'timedout') {
				allResponses += responses[key];
			}

			if (key !== 'noerror') {
				errResponses += responses[key];
			}
		}
	});

	return {
		allResponses,
		errResponses
	};
};

export const limitConnReqHistoryLimit = 1800;

export const limitConnReqFactory = (historyObject, previousUpdatingPeriod) =>
	(data, previousState, _, timeStart) => {
		if (data === null || Object.keys(data).length === 0) {
			return null;
		}

		const ts = timeStart / 1000;
		const updatingPeriod = appsettings.getSetting('updatingPeriod');

		if (previousUpdatingPeriod !== updatingPeriod) {
			previousUpdatingPeriod = updatingPeriod;

			historyObject = {};
		}

		data = createMapFromObject(data, (zone, zoneName) => {
			if (!historyObject[zoneName]) {
				historyObject[zoneName] = [];
			}

			let history = historyObject[zoneName];
			const lastItem = history[history.length - 1];
			const needSort = lastItem && lastItem._ts > ts;

			history.push({
				zone,
				_ts: ts
			});

			if (history.length > limitConnReqHistoryLimit) {
				history.shift();
			}

			if (needSort) {
				historyObject[zoneName] = history.sort(
					(a, b) => a._ts < b._ts ? -1 : 1
				);
			}

			return {
				zone,
				history: {
					ts,
					data: history.reduce((memo, { zone, _ts }, i) => {
						const prevItem = history[i - 1];

						memo.push(
							Object.keys(zone).reduce((memo, key) => {
								if (prevItem) {
									memo.zone[key] = zone[key] - prevItem.zone[key];

									if (memo.zone[key] < 0) memo.zone[key] = 0;
								} else {
									memo.zone[key] = 0;
								}

								return memo;
							}, {
								zone: {},
								_ts
							})
						);

						return memo;
					}, [])
				}
			};
		});

		return data;
	};
