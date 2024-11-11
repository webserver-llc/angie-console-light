/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import React from 'react';
import { shallow } from 'enzyme';
import { ConfigFiles } from '../configfiles.jsx';

describe('ConfigFiles', () => {
	const data = {
		angie: {
			build: 'PRO',
			version: '0.0.1',
			address: 'localhost',
			load_time: 1599571720025,
			config_files: {
				'/etc/angie.conf': 'foo',
				'/etc/mime.types': 'bar'
			}
		}
	};

	it('render()', async () => {
		const wrapper = shallow(<ConfigFiles data={data} />);
		expect(wrapper.find('h1').text()).toBe('Конфиг-файлы');
		expect(wrapper.find('CollapsibleList').length).toBe(2);

		const collapsibleList = wrapper.find('CollapsibleList');
		expect(collapsibleList.at(0).find('Editor').prop('code')).toBe('foo');
		expect(collapsibleList.at(0).find('Editor').prop('extension')).toBe('conf');
		expect(collapsibleList.at(1).find('Editor').prop('code')).toBe('bar');
		expect(collapsibleList.at(1).find('Editor').prop('extension')).toBe('types');

		wrapper.unmount();
	});
});
