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
import { StreamUpstreams } from '../streamupstreams.jsx';

describe('<StreamUpstreams IndexPage />', () => {
	it('render()', () => {
		const wrapper = shallow(
			<StreamUpstreams
				data={{
					upstreams: {
						__STATS: 'test_stats'
					}
				}}
				store={{
					__STATUSES: {
						tcp_upstreams: {
							status: 'ok'
						}
					}
				}}
			/>
		);
		const box = wrapper.find('UpstreamsBox');

		// UpstreamsBox title
		expect(box.prop('title')).toBe('TCP/UDP-апстримы');
		// UpstreamsBox stats
		expect(box.prop('stats')).toBe('test_stats');
		// UpstreamsBox status
		expect(box.prop('status')).toBe('ok');
		// UpstreamsBox href
		expect(box.prop('href')).toBe('#tcp_upstreams');

		wrapper.unmount();
	});
});
