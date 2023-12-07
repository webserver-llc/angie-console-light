/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import { formData } from '../formData';

describe('formData()', () => {
	it('with strings values', () => {
		const data = formData();
		data.weight = '1';
		data.max_conns = '2';
		data.max_fails = '3';
		data.fail_timeout = '4';
		data.test = 'name';
		data.server = 'name';
		expect(JSON.stringify(data)).toBe('{"weight":1,"max_conns":2,"max_fails":3,"fail_timeout":4,"test":"name"}');
	});

	it('with null values', () => {
		const data = formData();
		data.weight = null;
		data.max_conns = '2';
		data.max_fails = '3';
		data.fail_timeout = '4';
		data.test = 'name';
		data.server = 'name';
		expect(JSON.stringify(data)).toBe(
			'{"weight":null,"max_conns":2,"max_fails":3,"fail_timeout":4,"test":"name"}'
		);
	});
});
