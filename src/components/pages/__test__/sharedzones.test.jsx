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
import { SharedZones } from '../sharedzones.jsx';
import SortableTable from '../../table/sortabletable.jsx';
import styles from '../../table/style.css';
import ProgressBar from '../../progressbar/progressbar.jsx';
import tooltips from '../../../tooltips/index.jsx';

describe('<SharedZones Page />', () => {
	it('extends SortableTable', () => {
		expect(SharedZones.prototype instanceof SortableTable).toBe(true);
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(<SharedZones data={{ slabs: [] }} />);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).toBe('sharedZonesSortOrder');

		wrapper.unmount();
	});

	describe('render()', () => {
		it('sort zones', () => {
			const slabs = new Map([
				['test', {
					pages: {
						total: 1000,
						used: 200
					},
					percentSize: 20
				}], ['test_2', {
					pages: {
						total: 100,
						used: 90
					},
					percentSize: 90
				}], ['test_3', {
					pages: {
						total: 20000,
						used: 0
					},
					percentSize: 0
				}], ['test_4', {
					pages: {
						total: 100000,
						used: 50000
					},
					percentSize: 50
				}]
			]);
			const wrapper = shallow(
				<SharedZones data={{ slabs }} />
			);
			let rows = wrapper.find('tbody tr');

			// row 1, title
			expect(rows.at(0).find('td').at(1).text()).toBe('test');
			// row 2, title
			expect(rows.at(1).find('td').at(1).text()).toBe('test_2');
			// row 3, title
			expect(rows.at(2).find('td').at(1).text()).toBe('test_3');
			// row 4, title
			expect(rows.at(3).find('td').at(1).text()).toBe('test_4');

			wrapper.setState({ sortOrder: 'desc' });
			rows = wrapper.find('tbody tr');

			// row 1, title [desc]
			expect(rows.at(0).find('td').at(1).text()).toBe('test_4');
			// row 2, title [desc]
			expect(rows.at(1).find('td').at(1).text()).toBe('test_3');
			// row 3, title [desc]
			expect(rows.at(2).find('td').at(1).text()).toBe('test');
			// row 4, title [desc]
			expect(rows.at(3).find('td').at(1).text()).toBe('test_2');

			wrapper.unmount();
		});

		it('return value', () => {
			jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => { });

			const wrapper = shallow(<SharedZones data={{ slabs: [] }} />);
			const table = wrapper.find(`.${styles.table}`);
			const sortControl = table.find('TableSortControl');

			// wrapper html tag
			expect(wrapper.getElement().type).toBe('div');
			// table container
			expect(table.length).toBe(1);
			// TableSortControl length
			expect(sortControl.length).toBe(1);
			// TableSortControl "singleRow" prop
			expect(sortControl.prop('singleRow')).toBe(true);
			// TableSortControl "secondSortLabel" prop
			expect(sortControl.prop('secondSortLabel')).toBe('Отсортировать по размеру — сначала большие');
			// TableSortControl "order" prop
			expect(sortControl.prop('order')).toBe(wrapper.state('sortOrder'));
			// TableSortControl "onChange" prop
			expect(sortControl.prop('onChange').name).toBe('bound changeSorting');
			// hinted element length
			expect(wrapper.find(`.${styles.hinted}`).length).toBe(1);
			// useTooltip called once
			expect(tooltips.useTooltip).toHaveBeenCalledTimes(1);
			// useTooltip 1st arg
			expect(tooltips.useTooltip.mock.calls[0][0]).toBe('Загрузка памяти = использовано страниц / всего страниц');
			// useTooltip 2nd arg
			expect(tooltips.useTooltip.mock.calls[0][1]).toBe('hint');

			wrapper.unmount();
			tooltips.useTooltip.mockRestore();
		});

		it('zones row', () => {
			const slabs = new Map([
				['test', {
					pages: {
						total: 1000,
						used: 200
					},
					percentSize: 20
				}]
			]);
			const wrapper = shallow(
				<SharedZones data={{ slabs }} />
			);
			const rows = wrapper.find('tbody tr');

			// rows length
			expect(rows.length).toBe(1);

			const cells = rows.at(0).find('td');

			// row 1, cells length
			expect(cells.length).toBe(5);
			// row 1, cell 1, className
			expect(cells.at(0).prop('className')).toBe(styles.status);

			const cell = cells.at(1);

			// row 1, cell 2, className
			expect(cell.prop('className')).toBe(styles.bold);
			// row 1, cell 2, text
			expect(cell.text()).toBe('test');
			// row 1, cell 3, text
			expect(cells.at(2).text()).toBe('1000');
			// row 1, cell 4, text
			expect(cells.at(3).text()).toBe('200');

			const progressBar = cells.at(4).find('ProgressBar');

			// ProgressBar length
			expect(progressBar.length).toBe(1);
			// ProgressBar "percentage" prop
			expect(progressBar.prop('percentage')).toBe(20);

			wrapper.unmount();
		});
	});
});
