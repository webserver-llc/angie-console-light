/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import { calculateSpeed } from './utils.js';

export default (requests, previous) => {
	requests.reqs = calculateSpeed(previous ? previous.total : 0,
		requests.total,
		Date.now() - (previous ? previous.lastUpdate : 0)
	);

	return requests;
};
