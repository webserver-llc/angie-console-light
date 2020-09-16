/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { Upstreams } from '../index.jsx';
import { httpUpstreamsApi } from '../../../../api';

describe('<Upstreams Page />', () => {
	it('render()', () => {
		const wrapper = shallow(
			<Upstreams
				data={{
					upstreams: 'test_upstreams'
				}}
			/>
		);
		const upstreamsContainer = wrapper.find('UpstreamsContainer');

		expect(upstreamsContainer.prop('title'), 'UpstreamsContainer title').to.be.equal('HTTP Upstreams');
		expect(
			upstreamsContainer.prop('component').name,
			'UpstreamsContainer component'
		).to.be.equal('Upstream');
		expect(upstreamsContainer.prop('upstreams'), 'UpstreamsContainer upstreams').to.be.equal('test_upstreams');
		expect(
			upstreamsContainer.prop('upstreamsApi'),
			'UpstreamsContainer upstreamsApi'
		).to.be.deep.equal(httpUpstreamsApi);
		expect(upstreamsContainer.prop('isStream'), 'UpstreamsContainer isStream').to.be.false;

		wrapper.unmount();
	});
});
