/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import utils from './utils.js';
import appsettings from '../appsettings';

export function handlePeer(upstreamsKey, STATS, previousState, upstream, peer) {
	let previousPeer = null;

	if (previousState) {
		const previousUpstreamState = previousState.get(upstream.name);

		if (previousUpstreamState) {
			previousPeer = previousUpstreamState.peers.find(prevPeer => prevPeer.id === peer.id);

			if (previousPeer) {
				const period = Date.now() - previousState.lastUpdate;

				if (upstreamsKey === 'upstreams') {
					peer.server_req_s = utils.calculateSpeed(previousPeer.requests, peer.requests, period);
				} else if (upstreamsKey === 'tcp_upstreams') {
					peer.server_conn_s = utils.calculateSpeed(previousPeer.connections, peer.connections, period);
				}

				peer.server_sent_s = utils.calculateSpeed(previousPeer.sent, peer.sent, period);
				peer.server_rcvd_s = utils.calculateSpeed(previousPeer.received, peer.received, period);
			}
		}
	}

	peer.max_conns = peer.max_conns || Infinity;
	peer.health_status = 'last_passed' in peer.health_checks ? !!peer.health_checks.last_passed : null;

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
			STATS.failures++;
			upstream.stats.failed++;
			upstream.hasFailedPeer = true;
			break;
		case 'draining':
			STATS.servers.draining++;
			upstream.stats.draining++;
			break;
		case 'checking':
			upstream.stats.checking++;
			break;
	}

	STATS.servers.all++;
	upstream.stats.all++;

	if (upstreamsKey === 'upstreams') {
		peer.isHttp = true;

		if (utils.is4xxThresholdReached(peer)) {
			STATS.status = 'warning';
			STATS.warnings++;
		}

		utils.handleErrors(previousPeer, peer);
	}

	if (peer.health_status === false) {
		STATS.status = 'danger';
		STATS.alerts++;
	}
}

export function handleUpstreams(upstreamsKey, STATS, previousState, slabs, upstream, name) {
	upstream.name = name;

	utils.pickZoneSize(upstream, slabs, upstream.zone);

	upstream.stats = {
		all: 0,
		up: 0,
		down: 0,
		failed: 0,
		draining: 0,
		checking: 0
	};

	// Both TCP and HTTP Upstreams
	upstream.peers.forEach(
		handlePeer.bind(null, upstreamsKey, STATS, previousState, upstream)
	);

	return upstream;
}

export function upstreamsCalculator(upstreamsKey, upstreams, previousState, { slabs, __STATUSES }) {
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
		alerts: 0,
		status: 'ok'
	};

	upstreams = utils.createMapFromObject(
		upstreams,
		handleUpstreams.bind(null, upstreamsKey, STATS, previousState, slabs)
	);

	STATS.total = upstreams.size;

	upstreams.__STATS = STATS;

	__STATUSES[upstreamsKey].ready = true;
	__STATUSES[upstreamsKey].status = STATS.status;

	return upstreams;
}

export const upstreamsCalculatorFactory = upstreamsKey => upstreamsCalculator.bind(null, upstreamsKey);

export function addHistory(memo, historyLimit, ts, obj, objName) {
	if (!memo.history[objName]) {
		memo.history[objName] = [];
	}

	const history = memo.history[objName];
	const lastItem = history[history.length - 1];
	const needSort = lastItem && lastItem._ts > ts;

	history.push({
		obj,
		_ts: ts
	});

	if (history.length > historyLimit) {
		history.shift();
	}

	if (needSort) {
		memo.history[objName] = history.sort(
			(a, b) => a._ts < b._ts ? -1 : 1
		);
	}

	return {
		obj,
		history: {
			ts,
			data: history.reduce((memo, { obj, _ts }, i) => {
				const prevItem = history[i - 1];

				memo.push(
					Object.keys(obj).reduce((memo, key) => {
						if (prevItem) {
							memo.obj[key] = obj[key] - prevItem.obj[key];

							if (memo.obj[key] < 0) memo.obj[key] = 0;
						} else {
							memo.obj[key] = 0;
						}

						return memo;
					}, {
						obj: {},
						_ts
					})
				);

				return memo;
			}, [])
		}
	};
}

export const limitConnReqHistoryLimit = 1800;

export function limitConnReqCalculator(memo, data, previousState, _, timeStart) {
	if (data === null || Object.keys(data).length === 0) {
		return null;
	}

	const updatingPeriod = appsettings.getSetting('updatingPeriod');

	if (memo.prevUpdatingPeriod !== updatingPeriod) {
		memo.prevUpdatingPeriod = updatingPeriod;

		memo.history = {};
	}

	return utils.createMapFromObject(
		data,
		addHistory.bind(null, memo, limitConnReqHistoryLimit, timeStart / 1000)
	);
}

export const limitConnReqFactory = memo => limitConnReqCalculator.bind(null, memo);

export default {
	handlePeer,
	handleUpstreams,
	upstreamsCalculator,
	upstreamsCalculatorFactory,
	addHistory,
	limitConnReqHistoryLimit,
	limitConnReqCalculator,
	limitConnReqFactory,
};
