/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import { isEmptyObj } from '../../utils';

export default (response) => {
	if (isEmptyObj(response)) {
		return response;
	}

	Object.keys(response).forEach((key) => {
		const { ssl = {}, sessions, data, connections } = response[key];

		delete response[key].ssl;
		delete response[key].sessions;
		delete response[key].data;
		delete response[key].connections;

		response[key].sent = data.sent;
		response[key].received = data.received;
		response[key].connections = connections.total;
		response[key].processing = connections.processing;
		response[key].discarded = connections.discarded;

		response[key].ssl = {};
		response[key].ssl.handshakes = ssl.handshaked || 0;
		response[key].ssl.handshakes_failed = ssl.failed || 0;
		response[key].ssl.handshake_timeout = ssl.timedout || 0;
		response[key].ssl.session_reuses = ssl.reuses || 0;

		response[key].sessions = {};
		response[key].sessions['2xx'] = sessions.success;
		response[key].sessions['4xx'] = sessions.invalid;
		response[key].sessions['4xx'] += sessions.forbidden;
		response[key].sessions['5xx'] = sessions.internal_error;
		response[key].sessions['5xx'] += sessions.bad_gateway;
		response[key].sessions['5xx'] += sessions.service_unavailable;
		response[key].sessions.total =
      response[key].sessions['2xx'] +
      response[key].sessions['4xx'] +
      response[key].sessions['5xx'];
	});

	return response;
};
