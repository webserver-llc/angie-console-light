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

export default (ssl, previous) => {
	const _previous = previous || {
		handshakes: null,
		handshakes_failed: null,
		session_reuses: null,
		lastUpdate: 0
	};
	const date = Date.now() - _previous.lastUpdate;

	ssl.handshakes_s = utils.calculateSpeed(
		_previous.handshakes,
		ssl.handshakes,
		date
	);
	ssl.handshakes_failed_s = utils.calculateSpeed(
		_previous.handshakes_failed,
		ssl.handshakes_failed,
		date
	);

	ssl.session_reuses_s = utils.calculateSpeed(
		_previous.session_reuses,
		ssl.session_reuses,
		date
	);

	return ssl;
};
