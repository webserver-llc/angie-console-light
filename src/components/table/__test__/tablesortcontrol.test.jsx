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
import TableSortControl from '../tablesortcontrol.jsx';
import styles from '../style.css';
import tooltips from '../../../tooltips/index.jsx';

describe('<TableSortControl />', () => {
	it('constructor()', () => {
		const toggleSpy = jest.spyOn(TableSortControl.prototype.toggle, 'bind').mockClear();
		const wrapper = shallow(<TableSortControl />);

		// this.toggle.bind called
		expect(toggleSpy).toHaveBeenCalledTimes(1);
		// this.toggle.bind call arg
		expect(toggleSpy.mock.calls[0][0] instanceof TableSortControl).toBe(true);

		toggleSpy.mockRestore();
	});

	it('toggle()', () => {
		const onChangeSpy = jest.fn();
		const wrapper = shallow(
			<TableSortControl
				order="desc"
				onChange={onChangeSpy}
			/>
		);
		const instance = wrapper.instance();

		instance.toggle();

		// [props.order = desc] props.onChange called
		expect(onChangeSpy).toHaveBeenCalledTimes(1);
		// [props.order = desc] props.onChange call args
		expect(onChangeSpy).toHaveBeenCalledWith('asc');

		onChangeSpy.mockReset();
		wrapper.setProps({ order: 'asc' });
		instance.toggle();

		// [props.order = asc] props.onChange called
		expect(onChangeSpy).toHaveBeenCalledTimes(1);
		// [props.order = asc] props.onChange call args
		expect(onChangeSpy).toHaveBeenCalledWith('desc');

		wrapper.unmount();
	});

	it('render()', () => {
		jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({
			prop_from_useTooltip: true
		}));

		const wrapper = shallow(
			<TableSortControl
				order="asc"
			/>
		);
		const instance = wrapper.instance();

		// wrapper html tag
		expect(wrapper.type()).toBe('th');
		// wrapper prop rowSpan
		expect(wrapper.prop('rowSpan')).toBe(2);
		// wrapper prop className
		expect(wrapper.prop('className')).toBe(`${styles.sorter} ${styles.sorterActive}`);
		expect(wrapper.prop('onClick')).toBeInstanceOf(Function);
		// wrapper prop onClick name
		expect(wrapper.prop('onClick').name).toBe('bound toggle');
		// wrapper prop from useTooltip
		expect(wrapper.prop('prop_from_useTooltip')).toBe(true);
		// useTooltip called
		expect(tooltips.useTooltip).toHaveBeenCalledTimes(1);
		// useTooltip call args
		expect(tooltips.useTooltip).toHaveBeenCalledWith('Отсортировать по статусу – сначала проблемные', 'hint-right');
		// wrapper text
		expect(wrapper.text()).toBe('▴');

		tooltips.useTooltip.mockReset();
		wrapper.setProps({
			singleRow: true,
			order: 'desc'
		});

		// [prop.singleRow = true] wrapper prop rowSpan
		expect(wrapper.prop('rowSpan')).toBe(1);
		// [props.order = desc] useTooltip called
		expect(tooltips.useTooltip).toHaveBeenCalledTimes(1);
		// [props.order = desc] useTooltip call args
		expect(tooltips.useTooltip).toHaveBeenCalledWith('Отсортировать по порядку в конфигурации', 'hint-right');
		// wrapper text
		expect(wrapper.text()).toBe('▾');

		tooltips.useTooltip.mockRestore();
		wrapper.unmount();
	});
});
