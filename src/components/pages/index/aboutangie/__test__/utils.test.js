/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import { apiUtils } from '../../../../../api';
import { docs, getHrefDocs } from '../utils';

describe('getHrefDocs()', () => {
	it('return link to oss docs', () => {
		expect(getHrefDocs()).toBe(docs.default);
	});

	it('return link to pro docs', () => {
		jest.spyOn(apiUtils, 'isAngiePro').mockClear().mockImplementation(() => true);
		expect(getHrefDocs()).toBe(docs.pro);
		apiUtils.isAngiePro.mockRestore();
	});
});
