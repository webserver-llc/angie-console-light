/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub, spy } from 'sinon';
import appsettings from '../../../../appsettings';
import Upstream from '../upstream.jsx';

describe('<Upstream />', () => {
	const props = {
		name: 'test',
		upstream: {
			peers: []
		}
	};

	it('constructor()', () => {
		const wrapper = shallow(<Upstream { ...props } />);
		const instance = wrapper.instance();
		const toggleColumnsBindSpy = spy(instance.toggleColumns, 'bind');
		const hoverColumnsBindSpy = spy(instance.hoverColumns, 'bind');

		stub(appsettings, 'getSetting').callsFake(() => 'get_settings_result');

		instance.constructor(props);

		expect(wrapper.state('hoveredColumns'), 'state hoveredColumns').to.be.false;
		expect(wrapper.state('columnsExpanded'), 'state columnsExpanded').to.be.equal('get_settings_result');
		expect(appsettings.getSetting.called, 'getSetting called').to.be.true;
		expect(
			appsettings.getSetting.calledWith('columns-expanded-http-upstreams-test', false),
			'getSetting call args'
		).to.be.true;
		expect(toggleColumnsBindSpy.calledOnce, 'this.toggleColumns.bind called once').to.be.true;
		expect(toggleColumnsBindSpy.args[0][0], 'this.toggleColumns.bind arg').to.be.deep.equal(instance);
		expect(hoverColumnsBindSpy.calledOnce, 'this.hoverColumns.bind called once').to.be.true;
		expect(hoverColumnsBindSpy.args[0][0], 'this.hoverColumns.bind arg').to.be.deep.equal(instance);

		wrapper.setState({ nested_state: '12345' });
		instance.constructor(props);

		toggleColumnsBindSpy.restore();
		hoverColumnsBindSpy.restore();
		appsettings.getSetting.restore();
		wrapper.unmount();
	});
});
