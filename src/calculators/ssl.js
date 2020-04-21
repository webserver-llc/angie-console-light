/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { calculateSpeed } from './utils.js';

export default (ssl, previous) => {
	const _previous = previous || {
		handshakes: null,
		handshakes_failed: null,
		session_reuses: null,
		lastUpdate: 0
	};
	const date = Date.now() - _previous.lastUpdate;

	ssl.handshakes_s = calculateSpeed(
		_previous.handshakes,
		ssl.handshakes,
		date
	);
	ssl.handshakes_failed_s = calculateSpeed(
		_previous.handshakes_failed,
		ssl.handshakes_failed,
		date
	);

	ssl.session_reuses_s = calculateSpeed(
		_previous.session_reuses,
		ssl.session_reuses,
		date
	);

	return ssl;
};
