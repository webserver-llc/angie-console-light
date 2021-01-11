/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';
import SortableTable from '../sortabletable.jsx';
import appsettings from '../../../appsettings';

describe('<SortableTable />', () => {
	it('constructor()', () => {
		const wrapper = shallow(<SortableTable />);
		const instance = wrapper.instance();
		const changeSortingSpy = spy(instance.changeSorting, 'bind');

		stub(appsettings, 'getSetting').callsFake(() => 'getSetting_result');

		instance.SORTING_SETTINGS_KEY = 'test_sortings_settings_key';
		instance.constructor();

		expect(instance.state, 'this.state').to.be.deep.equal({
			sortOrder: 'getSetting_result'
		});
		expect(appsettings.getSetting.calledOnce, 'getSetting called').to.be.true;
		expect(
			appsettings.getSetting.calledWith('test_sortings_settings_key', 'asc'),
			'getSetting call args'
		).to.be.true;
		expect(changeSortingSpy.calledOnce, 'this.changeSorting.bind called').to.be.true;
		expect(
			changeSortingSpy.args[0][0],
			'this.changeSorting.bind call arg'
		).to.be.deep.equal(instance);

		changeSortingSpy.restore();
		appsettings.getSetting.restore();
		wrapper.unmount();
	});

	it('changeSorting()', () => {
		const wrapper = shallow(<SortableTable />);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		stub(appsettings, 'setSetting').callsFake(() => {});

		instance.SORTING_SETTINGS_KEY = 'test_sortings_settings_key';
		instance.changeSorting('test_sorting');

		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call arg').to.be.deep.equal({
			sortOrder: 'test_sorting'
		});
		expect(appsettings.setSetting.calledOnce, 'setSetting called').to.be.true;
		expect(
			appsettings.setSetting.calledWith('test_sortings_settings_key', 'test_sorting'),
			'setSetting call args'
		).to.be.true;

		setStateSpy.restore();
		appsettings.setSetting.restore();
		wrapper.unmount();
	});
});
