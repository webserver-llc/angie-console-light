/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
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

		expect(box.prop('title'), 'UpstreamsBox title').to.be.equal('TCP/UDP Upstreams');
		expect(box.prop('stats'), 'UpstreamsBox stats').to.be.equal('test_stats');
		expect(box.prop('status'), 'UpstreamsBox status').to.be.equal('ok');
		expect(box.prop('href'), 'UpstreamsBox href').to.be.equal('#tcp_upstreams');

		wrapper.unmount();
	});
});
