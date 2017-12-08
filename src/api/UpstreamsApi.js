/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import api from './index.js';


export default class UpstreamsApi {
	constructor(apiPrefix) {
		this.apiPrefix = apiPrefix;
		this.canWrite = null;
	}

	checkWritePermission() {
		// Check api for writing

		return api[this.apiPrefix].upstreams['DASHBOARD_INIT'].servers['__TEST_FOR_WRITE__'].del().then((data) => {
			this.canWrite = data.error.status !== 405;
		});
	}

	getPeer(upstreamName, peerId) {
		return api[this.apiPrefix].upstreams[upstreamName].servers[peerId].get();
	}

	createPeer(upstreamName, peerData) {
		return api[this.apiPrefix].upstreams[upstreamName].servers.post(peerData);
	}

	deletePeer(upstreamName, peerId) {
		return api[this.apiPrefix].upstreams[upstreamName].servers[peerId].del();
	}

	updatePeer(upstreamName, peerId, peerData) {
		return api[this.apiPrefix].upstreams[upstreamName].servers[peerId].patch(peerData);
	}
}