/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
/* eslint-disable no-useless-escape */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-len */
export const tokenProvider = {
	defaultToken: 'source',
	tokenizer: {
		root: [
			{ include: '@whitespaces' },
			{ include: '@delimeters' },
			{ include: '@server' },
			{ include: '@paths' },
			{ include: '@numbers' },
			{ include: '@strings' },
			{ include: '@comment' },
			{ include: '@variables' },
			{ include: '@operators' },
			{ include: '@url' },
			// core
			[ /(daemon|env|debug_points|error_log|log_not_found|include|lock_file|master_process|pid|ssl_engine|timer_resolution|types_hash_max_size|user|worker_cpu_affinity|worker_priority|worker_processes|worker_rlimit_core|worker_rlimit_nofile|worker_rlimit_sigpending|working_directory|try_files|access_log)/, { token: 'attribute.name', next: '@values' } ],
			// events
			[ /(accept_mutex|accept_mutex_delay|debug_connection|devpoll_changes|devpoll_events|epoll_events|kqueue_changes|kqueue_events|multi_accept|rtsig_signo|rtsig_overflow_events|rtsig_overflow_test|rtsig_overflow_threshold|use|worker_connections)/, { token: 'attribute.name', next: '@values' } ],
			// http module - proxy
			[ /(proxy_buffer_size|proxy_buffering|proxy_buffers|proxy_busy_buffers_size|proxy_cache_background_update|proxy_cache_bypass|proxy_cache_convert_head|proxy_cache_key|proxy_cache_lock|proxy_cache_lock_age|proxy_cache_lock_timeout|proxy_cache_max_range_offset|proxy_cache_methods|proxy_cache_min_uses|proxy_cache_path|proxy_cache_purge|proxy_cache_revalidate|proxy_cache_use_stale|proxy_cache_valid|proxy_connect_timeout|proxy_headers_hash_bucket_size|proxy_headers_hash_max_size|proxy_hide_header|proxy_http_version|proxy_ignore_client_abort|proxy_intercept_errors|proxy_max_temp_file_size|proxy_method|proxy_next_upstream|proxy_next_upstream_tries|proxy_next_upstream_timeout|proxy_pass|proxy_pass_header|proxy_pass_request_body|proxy_pass_request_headers|proxy_read_timeout|proxy_redirect|proxy_redirect_errors|proxy_send_lowat|proxy_send_timeout|proxy_set_body|proxy_set_header|proxy_store|proxy_store_access|proxy_temp_file_write_size|proxy_t|emp_pathproxy_upstream_fail_timeout|proxy_upstream_max_fails|proxy_cache)/, { token: 'attribute.name', next: '@values' } ],
			// http module - ssl
			[ /(ssl_buffer_size|ssl_certificate_key|ssl_ciphers|ssl_client_certificate|ssl_crl|ssl_dhparam|ssl_ecdh_curve|ssl_password_file|ssl_prefer_server_ciphers|ssl_protocols|ssl_session_cache|ssl_session_ticket_key|ssl_session_tickets|ssl_session_timeout|ssl_stapling|ssl_stapling_file|ssl_stapling_responder|ssl_stapling_verify|ssl_trusted_certificate|ssl_verify_client|ssl_verify_depth|ssl_certificate)/, { token: 'attribute.name', next: '@values' } ],
			// http module - http
			[/(index|alias|chunked_transfer_encoding|client_body_in_file_only|client_body_buffer_size|client_body_temp_path|client_body_timeout|client_header_buffer_size|client_header_timeout|client_max_body_size|default_type|error_page|index |internal|keepalive_timeout|keepalive_requests|large_client_header_buffers|limit_except|limit_rate|listen|msie_padding|msie_refresh|optimize_server_names|port_in_redirect|recursive_error_pages|reset_timedout_connection|resolver|resolver_timeout|root|satisfy_any|send_timeout|sendfile|server_name|server_names_hash_max_size|server_names_hash_bucket_size|tcp_nodelay|tcp_nopush|types)/, { token: 'attribute.name', next: '@values' } ],
			// http module - fastcgi
			[/(fastcgi_index|fastcgi_hide_header|fastcgi_ignore_client_abort|fastcgi_intercept_errors|fastcgi_param|fastcgi_pass|fastcgi_pass_header|fastcgi_read_timeout|fastcgi_redirect_errors|stcgi_storefastcgi_store_access|fastcgi_buffers|fastcgi_buffers_size|fastcgi_temp_path|fastcgi_buffer_size|fastcgi_connect_timeout|fastcgi_send_timeout|fastcgi_split_path_info)/, { token: 'attribute.name', next: '@values' } ],
			// http module - upstream
			[ /(upstream_probe|zone)/, 'attribute.name', '@values' ],
			[ /(http|mail|server|split_clients|events|stream|upstream|location)(\s+)({)/,
				{ cases: { $3: ['keyword', '@whitespace', { token: '@delimeters', next: '@names' }] } }],
			[ /[A-Za-z_-]+/, 'attribute.name', '@values' ],
		],
		whitespaces: [
			[/[ \t\r\n]+/, ''],
		],
		delimeters: [
			[';', 'delimiter'],
			[/[{}]/, 'delimiter.curly'],
		],
		operators: [
			[/(@|:|=|~|\*)/, 'operators'],
		],
		variables: [
			[/\${?[\w]+}?/, 'variable'],
		],
		names: [
			{ include: '@comment' },
			{ include: '@server' },
			{ include: '@paths' },
			{ include: '@locations' },
			{ include: '@numbers' },
			{ include: '@variables' },
			{ include: '@operators' },
			[ /[A-Za-z-_.]+/, 'attribute.name', '@values'],
			[ '[{}]', 'delimeter.bracket', '@popall' ],
		],
		values: [
			{ include: '@whitespaces' },
			{ include: '@url' },
			{ include: '@numbers' },
			{ include: '@strings' },
			{ include: '@comment' },
			{ include: '@operators' },
			{ include: '@variables' },
			{ include: '@server' },
			{ include: '@mime-types' },
			{ include: '@paths' },
			// { include: '@files' },
			{ include: '@locations' },
			[ /(\w+)(=)/, { cases: { $2: ['attribute.name', '@operators'], '@default': '' } }],
			[ /[A-Za-z-=_:.]+/, 'attribute.value' ],
			[ ';', 'delimiter', '@popall' ],
			[ '[{}]', 'delimeter.bracket', '@popall' ],
		],
		url: [
			[ /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\#?(?:[.\!\/\\w]*))?)/, 'attribute.value' ],
		],
		locations: [
			[/(\/)\w+((\/)?(\w+(-)?)?)+/, 'attribute.value'],
			['/', 'attribute.value'],
		],
		server: [
			[/((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}(:\d{1,5})?/, 'number' ],
		],
		comment: [
			[/(^#.*$)/, 'comment', '@popall'],
		],
		'mime-types': [
			[/(text|application|audio|video|image|font)\/[A-Za-z-+.]+/, 'attribute.value']
		],
		paths: [
			// eslint-disable-next-line no-useless-escape
			[ /\/([A-z0-9-_+]+\/)*([A-z0-9-\.*]+\.(\w+))/, 'attribute.value' ],
		],
		files: [
			[/\w+\.\w+/, 'attribute.value', '@pop']
		],
		units: [
			['(m|%|s)?', 'attribute.value.unit', '@pop']
		],
		numbers: [
			[/\d+/, 'number', '@units'],
		],
		strings: [
			[/\\'$/, '', '@pop'], // \' leaves @arguments at eol
			[/\\'/, ''], // \' is not a string
			[/'$/, 'string', '@pop'],
			[/'/, 'string', '@stringBody'],
			[/"$/, 'string', '@pop'],
			[/"/, 'string', '@dblStringBody']
		],
		stringBody: [
			[
				// eslint-disable-next-line no-useless-escape
				/[^\\\$']/,
				{
					cases: {
						'@eos': { token: 'string', next: '@popall' },
						'@default': 'string'
					}
				}
			],

			[/\\./, 'string.escape'],
			[/'$/, 'string', '@pop'],
			[/'/, 'string', '@pop'],
			{ include: '@variables' },
			[/\\$/, 'string'],
			[/$/, 'string', '@pop']
		],
		dblStringBody: [
			[
				// eslint-disable-next-line no-useless-escape
				/[^\\\$"]/,
				{
					cases: {
						'@eos': { token: 'string', next: '@popall' },
						'@default': 'string'
					}
				}
			],

			[/\\./, 'string.escape'],
			[/"$/, 'string', '@popall'],
			[/"/, 'string', '@pop'],
			{ include: '@variables' },
			[/\\$/, 'string'],
			[/$/, 'string', '@popall']
		]
	}
};
