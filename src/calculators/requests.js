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

export default (requests, previous) => {
	requests.reqs = utils.calculateSpeed(
		previous ? previous.total : 0,
		requests.total,
		Date.now() - (previous ? previous.lastUpdate : 0)
	);

	return requests;
};
