/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import { calculateSpeed } from './utils.js';

export default (connections, previous) => {
	connections.current = connections.active + connections.idle;

	connections.accepted_s = calculateSpeed(
		previous ? previous.accepted : null,
		connections.accepted,
		Date.now() - (previous ? previous.lastUpdate : 0)
	);

	return connections;
};
