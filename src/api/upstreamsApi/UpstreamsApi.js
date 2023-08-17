/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import api from '../index.js';
import { getServerName } from './utils.js';

export default class UpstreamsApi {
	constructor(apiPrefix) {
		this.apiPrefix = apiPrefix;
	}

	getPeer(upstreamName, peer) {
		const peerId = getServerName(peer);
		return api[this.apiPrefix].upstreams[upstreamName].servers[peerId].get();
	}

	createPeer(upstreamName, peerData) {
		return api[this.apiPrefix].upstreams[upstreamName].servers.post(peerData);
	}

	deletePeer(upstreamName, peer) {
		const peerId = getServerName(peer);
		return api[this.apiPrefix].upstreams[upstreamName].servers[peerId].del();
	}

	updatePeer(upstreamName, peer, peerData) {
		const peerId = getServerName(peer);
		return api[this.apiPrefix].upstreams[upstreamName].servers[peerId].patch(peerData);
	}
}
