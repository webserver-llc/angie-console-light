/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import mapperHttpUpstreams from '../httpUpstreams';

describe('Mappers - HTTP Upstreams', () => {
	let angieHttpUpstreams; let nginxHttpUpstreams;

	beforeEach(() => {
		angieHttpUpstreams = {
			'upstream-red': {
				peers: {
					'10.11.128.1:80': {
						server: '10.11.128.1',
						backup: false,
						weight: 1,
						state: 'unavailable',
						selected: {
							current: 1,
							total: 296,
							last: '2023-08-15T10:38:41Z',
						},
						responses: {
							200: 198,
							301: 6,
							302: 1,
							400: 1,
							403: 1,
							404: 2,
							501: 4,
							502: 2,
							503: 3,
							504: 4,
						},
						data: {
							sent: 128,
							received: 256,
						},
						health: {
							fails: 0,
							unavailable: 0,
							downtime: 0,
							downstart: '2023-08-15T10:38:41Z',
						},
						sid: '8c7de8e7900b468ba646cb8a9e8a588b',
						refs: 0,
					},
				},
				keepalive: 0,
				zombies: 0,
				zone: 'upstream-red',
			},
		};
		nginxHttpUpstreams = {
			'upstream-red': {
				peers: [
					{
						id: '10.11.128.1:80',
						server: '10.11.128.1',
						name: '10.11.128.1:80',
						backup: false,
						weight: 1,
						state: 'unavail',
						active: 1,
						requests: 296,
						selected: '2023-08-15T10:38:41Z',
						responses: {
							'1xx': 0,
							'2xx': 198,
							'3xx': 7,
							'4xx': 4,
							'5xx': 13,
							codes: {
								200: 198,
								301: 6,
								302: 1,
								400: 1,
								403: 1,
								404: 2,
								501: 4,
								502: 2,
								503: 3,
								504: 4,
							},
							total: 222,
						},
						sent: 128,
						received: 256,
						unavail: 0,
						fails: 0,
						downtime: 0,
						downstart: '2023-08-15T10:38:41Z',
						health_checks: {},
						response_time: {},
						sid: '8c7de8e7900b468ba646cb8a9e8a588b',
						refs: 0,
					},
				],
				keepalive: 0,
				zombies: 0,
				zone: 'upstream-red',
			},
		};
	});

	it('mapperHttpUpstreams()', () => {
		expect(mapperHttpUpstreams({})).toBeEmptyObject();
		// should be correct format
		expect(mapperHttpUpstreams(angieHttpUpstreams)).toEqual(nginxHttpUpstreams);
	});

	it('response time mapping', () => {
		angieHttpUpstreams['upstream-red'].peers['10.11.128.1:80'].health.first_byte_time = 1769;
		angieHttpUpstreams['upstream-red'].peers['10.11.128.1:80'].health.last_byte_time = 1299753;
		angieHttpUpstreams['upstream-red'].peers['10.11.128.1:80'].health.header_time = 50;
		angieHttpUpstreams['upstream-red'].peers['10.11.128.1:80'].health.response_time = 100;
		angieHttpUpstreams['upstream-red'].peers['10.11.128.1:80'].health.connect_time = 200;
		nginxHttpUpstreams['upstream-red'].peers[0].response_time = {};
		nginxHttpUpstreams['upstream-red'].peers[0].response_time.first_byte_time = 1769;
		nginxHttpUpstreams['upstream-red'].peers[0].response_time.last_byte_time = 1299753;
		nginxHttpUpstreams['upstream-red'].peers[0].response_time.header_time = 50;
		nginxHttpUpstreams['upstream-red'].peers[0].response_time.response_time = 100;
		nginxHttpUpstreams['upstream-red'].peers[0].response_time.connect_time = 200;

		expect(mapperHttpUpstreams(angieHttpUpstreams)).toEqual(nginxHttpUpstreams);
	});
});
