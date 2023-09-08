import { getServerName } from '../utils';

describe('UpstreamsApi - Utils', () => {
	it('getServerName()', () => {
		expect(() => getServerName()).toThrow(/required/);
		expect(() => getServerName({})).toThrow(/required/);
		expect(() => getServerName({ server: null })).toThrow(/required/);
		expect(() => getServerName({ server: undefined })).toThrow(/required/);
		expect(() => getServerName({ server: '', service: '' })).toThrow(/required/);
		expect(getServerName({ server: 'backend.server.com' })).toContain('backend.server.com');
		expect(getServerName({ server: '10.0.0.0' })).toContain('10.0.0.0:80');
		expect(getServerName({ server: '10.0.0.0:8080' })).toContain('10.0.0.0:8080');
		expect(getServerName({ server: '10.0.0.0:80' })).toContain('10.0.0.0:80');
		expect(
			getServerName({ server: '10.0.0.0:80', service: undefined }),
		).toContain('10.0.0.0:80');
		expect(
			getServerName({ server: '10.0.0.0:80', service: null }),
		).toContain('10.0.0.0:80');
		expect(getServerName({ server: '10.0.0.0:80', service: '' })).toContain('10.0.0.0:80');
		expect(
			getServerName({ server: '10.0.0.0:80', service: '_http._tcp' }),
		).toContain('_http._tcp@10.0.0.0:80');
		expect(
			getServerName({ server: '10.0.0.0', service: '_http._tcp' }),
		).toContain('_http._tcp@10.0.0.0:80');
		expect(
			getServerName({ server: 'backend.server.com', service: '_http._tcp' }),
		).toContain('_http._tcp@backend.server.com');
	});
});
