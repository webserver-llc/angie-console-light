/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
export default {
	server_zones: {
		status: 'ok',
		ready: false
	},
	upstreams: {
		status: 'ok',
		ready: false
	},
	caches: {
		status: 'ok',
		ready: false
	},
	tcp_upstreams: {
		status: 'ok',
		ready: false
	},
	tcp_zones: {
		status: 'ok',
		ready: false
	},
	shared_zones: {
		ready: false
	},
	location_zones: {
		ready: false
	},
	zone_sync: {
		ready: false
	},
	resolvers: {
		ready: false
	},
	workers: {
		ready: false
	},
};
