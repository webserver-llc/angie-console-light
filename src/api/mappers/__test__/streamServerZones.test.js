import mapperStreamServerZones from '../streamServerZones';

describe('Mapper - Stream Server Zones', () => {
	it('mapperStreamServerZones()', () => {
		const angieStreamServerZones = {
			'stream-ins': {
				ssl: {
					handshaked: 24,
					reuses: 0,
					timedout: 0,
					failed: 0,
				},
				connections: {
					total: 24,
					processing: 1,
					discarded: 0,
				},
				sessions: {
					success: 24,
					invalid: 1,
					forbidden: 2,
					internal_error: 3,
					bad_gateway: 4,
					service_unavailable: 5,
				},
				data: {
					received: 2762947,
					sent: 53495723,
				},
			},
		};
		const nginxStreamServerZones = {
			'stream-ins': {
				ssl: {
					handshakes: 24,
					session_reuses: 0,
					handshakes_timedout: 0,
					handshakes_failed: 0,
				},
				connections: 24,
				processing: 1,
				discarded: 0,
				sessions: {
					total: 39,
					'2xx': 24,
					'4xx': 3,
					'5xx': 12
				},
				received: 2762947,
				sent: 53495723,
			},
		};

		expect(mapperStreamServerZones({})).toBeEmptyObject();
		// should be correct format
		expect(mapperStreamServerZones(angieStreamServerZones)).toEqual(nginxStreamServerZones);
	});
});
