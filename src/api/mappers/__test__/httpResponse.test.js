import mapperHttpResponse from '../httpResponse.js';

describe('Mappers - HTTP Response', () => {
	it('mapperHttpResponse()', () => {
		const angieHttpResponse = {
			russia: {
				requests: {
					total: 200,
					processing: 5,
					discarded: 10,
				},
				responses: {
					200: 100660,
					405: 5,
					406: 1,
				},
			},
		};
		const nginxHttpResponse = {
			russia: {
				requests: 200,
				processing: 5,
				discarded: 10,
				responses: {
					'1xx': 0,
					'2xx': 100660,
					'3xx': 0,
					'4xx': 6,
					'5xx': 0,
					codes: {
						200: 100660,
						405: 5,
						406: 1,
					},
					total: 100666,
				},
			},
		};
		expect(mapperHttpResponse({})).toBeEmptyObject();
		// should be correct format
		expect(mapperHttpResponse(angieHttpResponse)).toEqual(nginxHttpResponse);
	});
});
