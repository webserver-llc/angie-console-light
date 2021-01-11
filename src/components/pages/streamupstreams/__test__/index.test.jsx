/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { StreamUpstreams } from '../index.jsx';
import { streamUpstreamsApi } from '../../../../api';

describe('<StreamUpstreams Page />', () => {
	it('render()', () => {
		const wrapper = shallow(
			<StreamUpstreams
				data={{
					upstreams: 'test_upstreams'
				}}
			/>
		);
		const upstreamsContainer = wrapper.find('UpstreamsContainer');

		expect(upstreamsContainer.prop('title'), 'UpstreamsContainer title').to.be.equal('TCP/UDP Upstreams');
		expect(
			upstreamsContainer.prop('component').name,
			'UpstreamsContainer component'
		).to.be.equal('StreamUpstream');
		expect(upstreamsContainer.prop('upstreams'), 'UpstreamsContainer upstreams').to.be.equal('test_upstreams');
		expect(
			upstreamsContainer.prop('upstreamsApi'),
			'UpstreamsContainer upstreamsApi'
		).to.be.deep.equal(streamUpstreamsApi);
		expect(upstreamsContainer.prop('isStream'), 'UpstreamsContainer isStream').to.be.true;

		wrapper.unmount();
	});
});
