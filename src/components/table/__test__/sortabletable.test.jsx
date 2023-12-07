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
import SortableTable from '../sortabletable.jsx';
import appsettings from '../../../appsettings';

describe('<SortableTable />', () => {
	it('constructor()', () => {
		jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => 'getSetting_result');
		SortableTable.prototype.SORTING_SETTINGS_KEY = 'test_sortings_settings_key';

		const changeSortingSpy = jest.spyOn(SortableTable.prototype.changeSorting, 'bind').mockClear();
		const wrapper = shallow(<SortableTable />);

		// this.state
		expect(wrapper.instance().state).toEqual({
			sortOrder: 'getSetting_result'
		});
		// getSetting called
		expect(appsettings.getSetting).toHaveBeenCalledTimes(1);
		// getSetting call args
		expect(appsettings.getSetting).toHaveBeenCalledWith('test_sortings_settings_key', 'asc');
		// this.changeSorting.bind called
		expect(changeSortingSpy).toHaveBeenCalledTimes(1);
		// this.changeSorting.bind call arg
		expect(changeSortingSpy.mock.calls[0][0] instanceof SortableTable).toBe(true);

		changeSortingSpy.mockRestore();
		SortableTable.prototype.SORTING_SETTINGS_KEY = undefined;
		appsettings.getSetting.mockRestore();
	});

	it('changeSorting()', () => {
		const wrapper = shallow(<SortableTable />);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		jest.spyOn(appsettings, 'setSetting').mockClear().mockImplementation(() => {});

		instance.SORTING_SETTINGS_KEY = 'test_sortings_settings_key';
		instance.changeSorting('test_sorting');

		// this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// this.setState call arg
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			sortOrder: 'test_sorting'
		});
		// setSetting called
		expect(appsettings.setSetting).toHaveBeenCalledTimes(1);
		// setSetting call args
		expect(appsettings.setSetting).toHaveBeenCalledWith('test_sortings_settings_key', 'test_sorting');

		setStateSpy.mockRestore();
		appsettings.setSetting.mockRestore();
		wrapper.unmount();
	});
});
