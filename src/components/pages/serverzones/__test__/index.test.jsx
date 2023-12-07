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
import { HTTPZones } from '../index.jsx';

describe('<HTTPZones Page />', () => {
	it('render()', () => {
		const wrapper = shallow(
			<HTTPZones data={{
				server_zones: 'test__server_zones',
				location_zones: 'test__location_zones',
				limit_conns: 'test__limit_conns',
				limit_reqs: 'test__limit_reqs'
			}}
			/>
		);

		// StreamZones props
		expect(wrapper.find('StreamZones').prop('data')).toBe('test__server_zones');
		// Locations props
		expect(wrapper.find('Locations').prop('data')).toBe('test__location_zones');
		// LimitConn props
		expect(wrapper.find('LimitConn').prop('data')).toBe('test__limit_conns');
		// LimitReq props
		expect(wrapper.find('LimitReq').prop('data')).toBe('test__limit_reqs');

		wrapper.unmount();
	});
});
