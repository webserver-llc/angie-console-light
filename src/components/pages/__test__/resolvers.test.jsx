/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { Resolvers } from '../resolvers.jsx';
import SortableTable from '../../table/sortabletable.jsx';
import styles from '../../table/style.css';

describe('<Resolvers Page />', () => {
	it('extends SortableTable', () => {
		expect(Resolvers.prototype instanceof SortableTable).toBe(true);
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(<Resolvers data={{ resolvers: [] }} />);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).toBe('resolversSortOrder');

		wrapper.unmount();
	});

	describe('render()', () => {
		it('sort resolvers', () => {
			const resolvers = new Map([
				['test', {
					requests: {},
					responses: {},
					alert: false
				}], ['test_2', {
					requests: {},
					responses: {},
					alert: true
				}], ['test_3', {
					requests: {},
					responses: {},
					alert: false
				}]
			]);
			const wrapper = shallow(
				<Resolvers data={{ resolvers }} />
			);
			let rows = wrapper.find('tbody tr');

			// row 1, title
			expect(rows.at(0).find('td').at(1).text()).toBe('test');
			// row 2, title
			expect(rows.at(1).find('td').at(1).text()).toBe('test_2');
			// row 3, title
			expect(rows.at(2).find('td').at(1).text()).toBe('test_3');

			wrapper.setState({ sortOrder: 'desc' });
			rows = wrapper.find('tbody tr');

			// row 1, title [desc]
			expect(rows.at(0).find('td').at(1).text()).toBe('test_2');

			wrapper.unmount();
		});

		it('return value', () => {
			const wrapper = shallow(<Resolvers data={{ resolvers: [] }} />);
			const table = wrapper.find(`.${ styles.table }`);
			const sortControl = table.find('TableSortControl');

			// wrapper html tag
			expect(wrapper.getElement().type).toBe('div');
			// table container
			expect(table.length).toBe(1);
			// table has class "wide"
			expect(table.hasClass(styles.wide)).toBe(true);
			// TableSortControl length
			expect(sortControl.length).toBe(1);
			// TableSortControl "order" prop
			expect(sortControl.prop('order')).toBe(wrapper.state('sortOrder'));
			// TableSortControl "onChange" prop
			expect(sortControl.prop('onChange').name).toBe('bound changeSorting');

			wrapper.unmount();
		});

		it('resolver row', () => {
			const resolvers = new Map([
				[
					'test',
					{
						requests: {
							name: 10,
							srv: 9,
							addr: 8
						},
						responses: {
							noerror: 7,
							formerr: 6,
							servfail: 5,
							nxdomain: 4,
							notimp: 3,
							refused: 2,
							unknown: 1,
							timedout: 0
						},
						alert: false
					}
				], [
					'test_2',
					{
						requests: {},
						responses: {},
						alert: true
					}
				]
			]);
			const wrapper = shallow(
				<Resolvers data={{ resolvers }} />
			);
			const rows = wrapper.find('tbody tr');
			let cells; let
				cell;

			// rows length
			expect(rows.length).toBe(2);
			cells = rows.at(0).find('td');
			// row 1, cells length
			expect(cells.length).toBe(13);
			// row 1, cell 1, className
			expect(cells.at(0).prop('className')).toBe(styles.ok);
			cell = cells.at(1);
			// row 1, cell 2, className
			expect(cell.prop('className')).toBe(`${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }`);
			// row 1, cell 2, text
			expect(cell.text()).toBe('test');
			// row 1, cell 3, text
			expect(cells.at(2).text()).toBe('10');
			// row 1, cell 4, text
			expect(cells.at(3).text()).toBe('9');
			cell = cells.at(4);
			// row 1, cell 5, className
			expect(cell.prop('className')).toBe(styles.bdr);
			// row 1, cell 5, text
			expect(cell.text()).toBe('8');
			// row 1, cell 6, text
			expect(cells.at(5).text()).toBe('7');
			// row 1, cell 7, text
			expect(cells.at(6).text()).toBe('6');
			// row 1, cell 8, text
			expect(cells.at(7).text()).toBe('5');
			// row 1, cell 9, text
			expect(cells.at(8).text()).toBe('4');
			// row 1, cell 10, text
			expect(cells.at(9).text()).toBe('3');
			// row 1, cell 11, text
			expect(cells.at(10).text()).toBe('2');
			// row 1, cell 12, text
			expect(cells.at(11).text()).toBe('1');
			// row 1, cell 13, text
			expect(cells.at(12).text()).toBe('0');

			cells = rows.at(1).find('td');
			// row 1, cells length
			expect(cells.length).toBe(13);
			// row 2, cell 1, className
			expect(cells.at(0).prop('className')).toBe(styles.alert);

			wrapper.unmount();
		});
	});
});
