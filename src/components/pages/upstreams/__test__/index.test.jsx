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

		// UpstreamsContainer title
		expect(upstreamsContainer.prop('title')).toBe('HTTP Upstreams');
		// UpstreamsContainer component
		expect(upstreamsContainer.prop('component').name).toBe('Upstream');
		// UpstreamsContainer upstreams
		expect(upstreamsContainer.prop('upstreams')).toBe('test_upstreams');
		// UpstreamsContainer upstreamsApi
		expect(upstreamsContainer.prop('upstreamsApi')).toEqual(httpUpstreamsApi);
		// UpstreamsContainer isStream
		expect(upstreamsContainer.prop('isStream')).toBe(false);

		wrapper.unmount();
	});
});
