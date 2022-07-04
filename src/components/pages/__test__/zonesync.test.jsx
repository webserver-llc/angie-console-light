/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { spy } from 'sinon';
import { shallow } from 'enzyme';
import { ZoneSync } from '../zonesync.jsx';
import SortableTable from '../../table/sortabletable.jsx';
import TableSortControl from '../../table/tablesortcontrol.jsx';
import styles from '../../table/style.css';

describe('<ZoneSync Page />', () => {
	it('extends SortableTable', () => {
		expect(ZoneSync.prototype instanceof SortableTable).to.be.true;
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(
			<ZoneSync data={{ zone_sync: {
				status: {},
				zones: []
			} }} />
		);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).to.be.equal('zoneSyncSortOrder');

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

			expect(rows.at(0).find('td').at(1).text(), 'row 1, title').to.be.equal('test');
			expect(rows.at(1).find('td').at(1).text(), 'row 2, title').to.be.equal('test_2');
			expect(rows.at(2).find('td').at(1).text(), 'row 3, title').to.be.equal('test_3');
			expect(rows.at(3).find('td').at(1).text(), 'row 4, title').to.be.equal('test_4');

			wrapper.setState({ sortOrder: 'desc' });
			rows = wrapper.find('table').at(1).find('tbody tr');

			assert(
				['test_2', 'test_3'].includes(rows.at(0).find('td').at(1).text()),
				'row 1, title [desc]'
			);
			assert(
				['test_2', 'test_3'].includes(rows.at(1).find('td').at(1).text()),
				'row 2, title [desc]'
			);
			assert(
				['test', 'test_4'].includes(rows.at(2).find('td').at(1).text()),
				'row 3, title [desc]'
			);
			assert(
				['test', 'test_4'].includes(rows.at(3).find('td').at(1).text()),
				'row 4, title [desc]'
			);

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
				} }} />
			);

			expect(wrapper.getElement().type, 'wrapper html tag').to.be.equal('div');

			const tables = wrapper.find(`.${ styles['table'] }`);

			expect(tables, 'tables length').to.have.lengthOf(2);
			tables.forEach((table, i) => {
				expect(table.hasClass(styles['thin']), `table ${ i } has class "thin"`).to.be.true;
			});

			const statusCells = tables.at(0).find('tbody td');

			expect(statusCells, 'status cells').to.have.lengthOf(5);
			expect(statusCells.at(0).text(), 'status cell 1, text').to.be.equal('100');
			expect(statusCells.at(1).text(), 'status cell 2, text').to.be.equal('100000');
			expect(statusCells.at(1).prop('className'), 'status cell 2, className').to.be.equal(
				styles['bdr']
			)
			;expect(statusCells.at(2).text(), 'status cell 3, text').to.be.equal('99');
			expect(statusCells.at(3).text(), 'status cell 4, text').to.be.equal('99000');
			expect(statusCells.at(3).prop('className'), 'status cell 4, className').to.be.equal(
				styles['bdr']
			);
			expect(statusCells.at(4).text(), 'status cell 5, text').to.be.equal('10');

			const sortControl = tables.at(1).find('TableSortControl');

			expect(sortControl.length, 'TableSortControl length').to.be.equal(1);
			expect(sortControl.prop('order'), 'TableSortControl "order" prop').to.be.equal(
				wrapper.state('sortOrder')
			);
			expect(sortControl.prop('onChange').name, 'TableSortControl "onChange" prop').to.be.equal(
				'bound changeSorting'
			);

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

			expect(rows, 'rows length').to.have.lengthOf(3);

			cells = rows.at(0).find('td');
			expect(cells, 'cells length').to.have.lengthOf(4);
			expect(cells.at(0).prop('className'), 'row 1, status cell className').to.be.equal(styles['ok']);
			expect(cells.at(1).prop('className'), 'row 1, name cell, className').to.be.equal(
				`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
			);
			expect(cells.at(1).text(), 'row 1, name cell, text').to.be.equal('test');
			expect(cells.at(2).text(), 'row 1, total cell, text').to.be.equal('1000000');
			expect(cells.at(3).text(), 'row 1, pending cell, text').to.be.equal('2');

			cells = rows.at(1).find('td');
			expect(cells, 'cells length').to.have.lengthOf(4);
			expect(cells.at(0).prop('className'), 'row 2, status cell className').to.be.equal(styles['warning']);
			expect(cells.at(1).prop('className'), 'row 2, name cell, className').to.be.equal(
				`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
			);
			expect(cells.at(1).text(), 'row 2, name cell, text').to.be.equal('test_2');
			expect(cells.at(2).text(), 'row 2, total cell, text').to.be.equal('5000');
			expect(cells.at(3).text(), 'row 2, pending cell, text').to.be.equal('100');

			cells = rows.at(2).find('td');
			expect(cells, 'cells length').to.have.lengthOf(4);
			expect(cells.at(0).prop('className'), 'row 3, status cell className').to.be.equal(styles['alert']);
			expect(cells.at(1).prop('className'), 'row 3, name cell, className').to.be.equal(
				`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
			);
			expect(cells.at(1).text(), 'row 3, name cell, text').to.be.equal('test_3');
			expect(cells.at(2).text(), 'row 3, total cell, text').to.be.equal('100');
			expect(cells.at(3).text(), 'row 3, pending cell, text').to.be.equal('80');

			wrapper.unmount();
		});
	});
});
