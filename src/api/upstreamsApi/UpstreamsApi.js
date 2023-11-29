/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import api from '../index.js';

export default class UpstreamsApi {
	constructor(apiPrefix) {
		this.apiPrefix = apiPrefix;
	}

	getServers(upstreamName) {
		const getServersByUpstream = (sendCredentials = false) =>
			api.config[this.apiPrefix].upstreams[upstreamName].servers.get({
				credentials: sendCredentials ? 'same-origin' : 'omit',
				searchParams: { defaults: 'on' }
			}).catch(({ status }) => {
				if (status === 405 || status === 404) {
					return null;
				} if (status === 401 && sendCredentials === false){
					return getServersByUpstream(true);
				}
				return null;
			});

		return getServersByUpstream(upstreamName);
	}

	getServer(upstreamName, serverName) {
		return api.config[this.apiPrefix].upstreams[upstreamName].servers[serverName]
			.get({ searchParams: { defaults: 'on' } });
	}

	createServer(upstreamName, peerData) {
		return api.config[this.apiPrefix].upstreams[upstreamName].servers[
			peerData.server
		].put(peerData);
	}

	deleteServer(upstreamName, serverName) {
		return api.config[this.apiPrefix].upstreams[upstreamName].servers[
			serverName
		].del();
	}

	updateServer(upstreamName, serverName, peerData) {
		return api.config[this.apiPrefix].upstreams[upstreamName].servers[
			serverName
		].patch(peerData);
	}
}
