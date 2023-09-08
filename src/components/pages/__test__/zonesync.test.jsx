/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ZoneSync } from '../zonesync.jsx';
import SortableTable from '../../table/sortabletable.jsx';
import TableSortControl from '../../table/tablesortcontrol.jsx';
import styles from '../../table/style.css';

describe('<ZoneSync Page />', () => {
	it('extends SortableTable', () => {
		expect(ZoneSync.prototype instanceof SortableTable).toBe(true);
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(
			<ZoneSync data={{ zone_sync: {
				status: {},
				zones: []
			} }}
			/>
		);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).toBe('zoneSyncSortOrder');

		wrapper.unmount();
	});

	describe('render()', () => {
		it('sort zones', () => {
			const zone_sync = {
				status: {},
				zones: new Map([
					['test', {
						alert: false,
						warning: false
					}], ['test_2', {
						alert: true,
						warning: false
					}], ['test_3', {
						alert: false,
						warning: true
					}], ['test_4', {
						alert: false,
						warning: false
					}]
				])
			};
			const wrapper = shallow(
				<ZoneSync data={{ zone_sync }} />
			);
			let rows = wrapper.find('table').at(1).find('tbody tr');

			// row 1, title
			expect(rows.at(0).find('td').at(1).text()).toBe('test');
			// row 2, title
			expect(rows.at(1).find('td').at(1).text()).toBe('test_2');
			// row 3, title
			expect(rows.at(2).find('td').at(1).text()).toBe('test_3');
			// row 4, title
			expect(rows.at(3).find('td').at(1).text()).toBe('test_4');

			wrapper.setState({ sortOrder: 'desc' });
			rows = wrapper.find('table').at(1).find('tbody tr');

			expect(['test_2', 'test_3'].includes(rows.at(0).find('td').at(1).text())).toBeTruthy();
			expect(['test_2', 'test_3'].includes(rows.at(1).find('td').at(1).text())).toBeTruthy();
			expect(['test', 'test_4'].includes(rows.at(2).find('td').at(1).text())).toBeTruthy();
			expect(['test', 'test_4'].includes(rows.at(3).find('td').at(1).text())).toBeTruthy();

			wrapper.unmount();
		});

		it('return value', () => {
			const wrapper = shallow(
				<ZoneSync data={{ zone_sync: {
					status: {
						msgs_in: 100,
						bytes_in: 100000,
						msgs_out: 99,
						bytes_out: 99000,
						nodes_online: 10
					},
					zones: []
				} }}
				/>
			);

			// wrapper html tag
			expect(wrapper.getElement().type).toBe('div');

			const tables = wrapper.find(`.${ styles.table }`);

			// tables length
			expect(tables).toHaveLength(2);
			tables.forEach((table, i) => {
				// table ${ i } has class "thin"
				expect(table.hasClass(styles.thin)).toBe(true);
			});

			const statusCells = tables.at(0).find('tbody td');

			// status cells
			expect(statusCells).toHaveLength(5);
			// status cell 1, text
			expect(statusCells.at(0).text()).toBe('100');
			// status cell 2, text
			expect(statusCells.at(1).text()).toBe('100000');
			// status cell 2, className
			expect(statusCells.at(1).prop('className')).toBe(styles.bdr)
			;// status cell 3, text
			expect(statusCells.at(2).text()).toBe('99');
			// status cell 4, text
			expect(statusCells.at(3).text()).toBe('99000');
			// status cell 4, className
			expect(statusCells.at(3).prop('className')).toBe(styles.bdr);
			// status cell 5, text
			expect(statusCells.at(4).text()).toBe('10');

			const sortControl = tables.at(1).find('TableSortControl');

			// TableSortControl length
			expect(sortControl.length).toBe(1);
			// TableSortControl "order" prop
			expect(sortControl.prop('order')).toBe(wrapper.state('sortOrder'));
			// TableSortControl "onChange" prop
			expect(sortControl.prop('onChange').name).toBe('bound changeSorting');

			wrapper.unmount();
		});

		it('zones row', () => {
			const zone_sync = {
				status: {},
				zones: new Map([
					['test', {
						alert: false,
						warning: false,
						records_total: 1000000,
						records_pending: 2
					}], ['test_2', {
						alert: false,
						warning: true,
						records_total: 5000,
						records_pending: 100
					}], ['test_3', {
						alert: true,
						warning: false,
						records_total: 100,
						records_pending: 80
					}]
				])
			};
			const wrapper = shallow(
				<ZoneSync data={{ zone_sync }} />
			);
			const rows = wrapper.find('table').at(1).find('tbody tr');
			let cells;

			// rows length
			expect(rows).toHaveLength(3);

			cells = rows.at(0).find('td');
			// cells length
			expect(cells).toHaveLength(4);
			// row 1, status cell className
			expect(cells.at(0).prop('className')).toBe(styles.ok);
			// row 1, name cell, className
			expect(cells.at(1).prop('className')).toBe(`${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }`);
			// row 1, name cell, text
			expect(cells.at(1).text()).toBe('test');
			// row 1, total cell, text
			expect(cells.at(2).text()).toBe('1000000');
			// row 1, pending cell, text
			expect(cells.at(3).text()).toBe('2');

			cells = rows.at(1).find('td');
			// cells length
			expect(cells).toHaveLength(4);
			// row 2, status cell className
			expect(cells.at(0).prop('className')).toBe(styles.warning);
			// row 2, name cell, className
			expect(cells.at(1).prop('className')).toBe(`${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }`);
			// row 2, name cell, text
			expect(cells.at(1).text()).toBe('test_2');
			// row 2, total cell, text
			expect(cells.at(2).text()).toBe('5000');
			// row 2, pending cell, text
			expect(cells.at(3).text()).toBe('100');

			cells = rows.at(2).find('td');
			// cells length
			expect(cells).toHaveLength(4);
			// row 3, status cell className
			expect(cells.at(0).prop('className')).toBe(styles.alert);
			// row 3, name cell, className
			expect(cells.at(1).prop('className')).toBe(`${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }`);
			// row 3, name cell, text
			expect(cells.at(1).text()).toBe('test_3');
			// row 3, total cell, text
			expect(cells.at(2).text()).toBe('100');
			// row 3, pending cell, text
			expect(cells.at(3).text()).toBe('80');

			wrapper.unmount();
		});
	});
});
