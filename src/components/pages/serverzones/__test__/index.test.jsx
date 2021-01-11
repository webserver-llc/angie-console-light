/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { HTTPZones } from '../index.jsx';

describe('<HTTPZones Page />', () => {
	it('render()', () => {
		const wrapper = shallow(
			<HTTPZones data={ {
				server_zones: 'test__server_zones',
				location_zones: 'test__location_zones',
				limit_conns: 'test__limit_conns',
				limit_reqs: 'test__limit_reqs'
			} } />
		);

		expect(wrapper.find('StreamZones').prop('data'), 'StreamZones props').to.be.equal('test__server_zones');
		expect(wrapper.find('Locations').prop('data'), 'Locations props').to.be.equal('test__location_zones');
		expect(wrapper.find('LimitConn').prop('data'), 'LimitConn props').to.be.equal('test__limit_conns');
		expect(wrapper.find('LimitReq').prop('data'), 'LimitReq props').to.be.equal('test__limit_reqs');

		wrapper.unmount();
	});
});
