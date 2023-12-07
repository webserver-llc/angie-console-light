/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import utils from './utils.js';

export function handleWorker(previousState, worker, updPeriod) {
	const prevWorkerState = previousState.find(({ pid }) => worker.pid === pid);

	if ('connections' in worker) {
		let acceptedPerSec = '-';

		if (
			prevWorkerState &&
			'connections' in prevWorkerState
		) {
			acceptedPerSec = utils.calculateSpeed(
				prevWorkerState.connections.accepted,
				worker.connections.accepted,
				updPeriod
			);
		}

		worker.connections.acceptedPerSec = acceptedPerSec;
	}

	if (
		'http' in worker &&
		'requests' in worker.http
	) {
		let reqsPerSec = '-';

		if (
			prevWorkerState &&
			'http' in prevWorkerState &&
			'requests' in prevWorkerState.http
		) {
			reqsPerSec = utils.calculateSpeed(
				prevWorkerState.http.requests.total,
				worker.http.requests.total,
				updPeriod
			);
		}

		worker.http.requests.reqsPerSec = reqsPerSec;
	}

	return worker;
}

export default (workers, previousState, { __STATUSES }) => {
	if (workers === null || workers.length === 0) {
		__STATUSES.workers.ready = false;
		return null;
	}

	const STATS = {
		total: 0,
		status: 'ok'
	};

	if (previousState) {
		const updPeriod = Date.now() - previousState.lastUpdate;

		workers = workers.map(worker => handleWorker(previousState, worker, updPeriod));
	}

	STATS.total = workers.length;

	workers.__STATS = STATS;
	__STATUSES.workers.ready = true;
	__STATUSES.workers.status = STATS.status;

	return workers;
};
