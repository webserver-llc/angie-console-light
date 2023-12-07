/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import mapperResolvers from '../resolvers';

describe('Mapper - Resolvers', () => {
	it('mapperResolvers()', () => {
		const angieResolvers = {
			'resolver-http': {
				queries: {
					name: 442,
					srv: 2,
					addr: 3,
				},
				responses: {
					success: 440,
					timedout: 1,
					format_error: 2,
					server_failure: 3,
					not_found: 4,
					unimplemented: 5,
					refused: 6,
					other: 7,
				},
			},
		};
		const nginxResolvers = {
			'resolver-http': {
				requests: {
					name: 442,
					srv: 2,
					addr: 3,
				},
				responses: {
					noerror: 440,
					timedout: 1,
					formerr: 2,
					servfail: 3,
					nxdomain: 4,
					notimp: 5,
					refused: 6,
					unknown: 7,
				},
			},
		};
		expect(mapperResolvers({})).toBeEmptyObject();
		// should be correct format
		expect(mapperResolvers(angieResolvers)).toEqual(nginxResolvers);
	});
});
