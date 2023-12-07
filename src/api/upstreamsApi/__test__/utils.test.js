/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
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
