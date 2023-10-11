import { getServerName } from '../utils';

describe('UpstreamsApi - Utils', () => {
	it('getServerName()', () => {
		expect(() => getServerName()).toThrow(/required/);
		expect(() => getServerName({})).toThrow(/required/);
		expect(() => getServerName({ name: null })).toThrow(/required/);
		expect(() => getServerName({ name: undefined })).toThrow(/required/);
		expect(() => getServerName({ name: '' })).toThrow(/required/);
		expect(getServerName({ name: 'backend.server.com' })).toContain('backend.server.com');
		expect(getServerName({ name: '10.0.0.0' })).toContain('10.0.0.0:80');
		expect(getServerName({ name: '10.0.0.0:8080' })).toContain('10.0.0.0:8080');
		expect(getServerName({ name: '10.0.0.0:80' })).toContain('10.0.0.0:80');
	});
});
