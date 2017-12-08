export default {
	server_zones: {
		'4xx': false,
		'5xx': false,
		status: 'ok',
		ready: false
	},
	upstreams: {
		health_check_problems: false,
		'4xx': false,
		status: 'ok',
		ready: false
	},
	caches: {
		size_warning: false,
		size_alert: false,
		hit_ratio_warning: false,
		status: 'ok',
		ready: false
	},
	tcp_upstreams: {
		health_check_problems: false,
		status: 'ok',
		ready: false
	},
	tcp_zones: {
		ready: false
	},
	shared_zones: {
		ready: false
	}
};
