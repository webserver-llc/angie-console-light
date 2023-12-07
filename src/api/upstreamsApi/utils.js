/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import { isIP } from '../../utils';

const defaultPort = 80;

// remove?
export const getServerName = (peer) => {
	if (!peer || !('name' in peer) || !peer.name) {
		throw new Error('Peer is required argument and should be an object');
	}

	// add default port, if isn't set
	// should fix next version Angie Pro
	function getServer(server) {
		if (isIP(server) && server.indexOf(':') === -1) return `${server}:${defaultPort}`;
		return server;
	}

	return getServer(peer.name);
};

export default {
	getServerName,
};
