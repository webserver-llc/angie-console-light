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

		// UpstreamsContainer title
		expect(upstreamsContainer.prop('title')).toBe('TCP/UDP Upstreams');
		// UpstreamsContainer component
		expect(upstreamsContainer.prop('component').name).toBe('StreamUpstream');
		// UpstreamsContainer upstreams
		expect(upstreamsContainer.prop('upstreams')).toBe('test_upstreams');
		// UpstreamsContainer upstreamsApi
		expect(upstreamsContainer.prop('upstreamsApi')).toEqual(streamUpstreamsApi);
		// UpstreamsContainer isStream
		expect(upstreamsContainer.prop('isStream')).toBe(true);

		wrapper.unmount();
	});
});
