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
	it('mapperHttpUpstreams()', () => {
		const angieHttpUpstreams = {
			'upsteam-red': {
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
		const nginxHttpUpsreams = {
			'upsteam-red': {
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
						sid: '8c7de8e7900b468ba646cb8a9e8a588b',
						refs: 0,
					},
				],
				keepalive: 0,
				zombies: 0,
				zone: 'upstream-red',
			},
		};
		expect(mapperHttpUpstreams({})).toBeEmptyObject();
		// should be correct format
		expect(mapperHttpUpstreams(angieHttpUpstreams)).toEqual(nginxHttpUpsreams);
	});
});
