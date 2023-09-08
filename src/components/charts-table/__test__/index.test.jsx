/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ChartsTable } from '../index.jsx';
import styles from '../../table/style.css';

describe('ChartsTable Constructor', () => {
	describe('<ChartsTable />', () => {
		it('constructor()', () => {
			const wrapper = shallow(<ChartsTable data={{}} />);
			const instance = wrapper.instance();
			const bindSpy = jest.spyOn(ChartsTable.prototype.toggleChart, 'bind').mockClear();

			instance.constructor();

			// this.state
			expect(wrapper.state()).toEqual({
				activeCharts: []
			});
			// this.toggleChart.bind called once
			expect(bindSpy).toHaveBeenCalled();
			// this.toggleChart.bind arg
			expect(bindSpy.mock.calls[0][0] instanceof ChartsTable).toBe(true);

			bindSpy.mockRestore();
			wrapper.unmount();
		});

		it('shouldComponentUpdate()', () => {
			const wrapper = shallow(<ChartsTable />);
			const instance = wrapper.instance();

			// empty props, no active charts
			expect(instance.shouldComponentUpdate({}, { activeCharts: [] })).toBe(false);
			// with props
			expect(instance.shouldComponentUpdate({ data: {} }, { activeCharts: [] })).toBe(true);
			// active charts changed
			expect(instance.shouldComponentUpdate({}, { activeCharts: ['test'] })).toBe(true);

			wrapper.unmount();
		});

		it('toggleChart()', () => {
			const wrapper = shallow(<ChartsTable data={{}} />);
			const instance = wrapper.instance();

			instance.toggleChart('limit_req');
			// [1] state
			expect(wrapper.state()).toEqual({
				activeCharts: ['limit_req']
			});

			instance.toggleChart('limit_conn');
			// [2] state
			expect(wrapper.state()).toEqual({
				activeCharts: ['limit_req', 'limit_conn']
			});

			instance.toggleChart('limit_req');
			// [3] state
			expect(wrapper.state()).toEqual({
				activeCharts: ['limit_conn']
			});

			wrapper.unmount();
		});

		it('getTitle()', () => {
			const wrapper = shallow(<ChartsTable />);
			const instance = wrapper.instance();

			expect(instance.getTitle()).toBeNull();

			wrapper.unmount();
		});

		it('getHeadRow()', () => {
			const wrapper = shallow(<ChartsTable />);
			const instance = wrapper.instance();

			expect(instance.getHeadRow()).toBeNull();

			wrapper.unmount();
		});

		it('getBody()', () => {
			const wrapper = shallow(<ChartsTable />);
			const instance = wrapper.instance();

			expect(instance.getBody()).toBeNull();

			wrapper.unmount();
		});

		describe('render()', () => {
			it('no data', () => {
				const wrapper = shallow(<ChartsTable />);
				const instance = wrapper.instance();

				// no data
				expect(wrapper).toHaveLength(0);

				wrapper.unmount();
			});

			it('with data', () => {
				const wrapper = shallow(<ChartsTable data={{}} />);
				const instance = wrapper.instance();

				jest.spyOn(instance, 'getTitle').mockClear().mockImplementation(() => 'test__title');
				jest.spyOn(instance, 'getHeadRow').mockClear().mockImplementation(() => 'test__headRow');
				jest.spyOn(instance, 'getBody').mockClear().mockImplementation(() => 'test__body');

				wrapper.setProps({ data: {} });

				// this.getTitle called once
				expect(instance.getTitle).toHaveBeenCalled();
				// title
				expect(wrapper.find('h1').text()).toBe('test__title');

				const table = wrapper.find('table');

				// table className
				expect(table.prop('className')).toBe(`${ styles.table } ${ styles.wide }`);
				// this.getHeadRow called once
				expect(instance.getHeadRow).toHaveBeenCalled();

				// table head row
				expect(table.find('thead').text()).toBe('test__headRow');

				const tbody = table.find('tbody');

				// this.getBody called once
				expect(instance.getBody).toHaveBeenCalled();
				// table body
				expect(tbody.text()).toBe('test__body');
				// table body className
				expect(tbody.prop('className')).toBe(styles['right-align']);

				instance.getTitle.mockRestore();
				instance.getHeadRow.mockRestore();
				instance.getBody.mockRestore();
				wrapper.unmount();
			});
		});
	});
});
