/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import utils from './utils.js';

export default (connections, previous) => {
	if (connections === null) return null;
	connections.current = connections.active + connections.idle;

	connections.accepted_s = utils.calculateSpeed(
		previous ? previous.accepted : null,
		connections.accepted,
		Date.now() - (previous ? previous.lastUpdate : 0)
	);

	return connections;
};
