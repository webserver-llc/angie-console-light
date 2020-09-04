/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { spy } from 'sinon';
import { shallow } from 'enzyme';
import { Resolvers } from '../resolvers.jsx';
import SortableTable from '../../table/sortabletable.jsx';
import styles from '../../table/style.css';

describe('<Resolvers Page />', () => {
	it('extends SortableTable', () => {
		expect(Resolvers.prototype instanceof SortableTable).to.be.true;
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(<Resolvers data={{ resolvers: [] }} />);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).to.be.equal('resolversSortOrder');

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
				}]
			]);
			const wrapper = shallow(
				<Resolvers data={{ resolvers }} />
			);
			let rows = wrapper.find('tbody tr');

			expect(rows.at(0).find('td').at(1).text(), 'row 1, title').to.be.equal('test');
			expect(rows.at(1).find('td').at(1).text(), 'row 2, title').to.be.equal('test_2');

			let sortSpy = spy(Array.prototype, 'sort');

			wrapper.setState({ sortOrder: 'desc' });
			rows = wrapper.find('tbody tr');

			expect(rows.at(0).find('td').at(1).text(), 'row 1, title [desc]').to.be.equal('test_2');
			expect(rows.at(1).find('td').at(1).text(), 'row 2, title [desc]').to.be.equal('test');
			expect(sortSpy.calledOnce, 'Array sort called once').to.be.true;
			expect(sortSpy.args[0][0](['', { alert: true }], []), 'Array sort fn').to.be.equal(-1);
			expect(sortSpy.args[0][0](['', { alert: false }], []), 'Array sort fn').to.be.equal(1);

			sortSpy.restore();
			wrapper.unmount();
		});

		it('return value', () => {
			const wrapper = shallow(<Resolvers data={{ resolvers: [] }} />);
			const table = wrapper.find(`.${ styles['table'] }`);
			const sortControl = table.find('TableSortControl');

			expect(wrapper.getElement().nodeName, 'wrapper html tag').to.be.equal('div');
			expect(table.length, 'table container').to.be.equal(1);
			expect(table.hasClass(styles['wide']), 'table has class "wide"').to.be.true;
			expect(sortControl.length, 'TableSortControl length').to.be.equal(1);
			expect(sortControl.prop('order'), 'TableSortControl "order" prop').to.be.equal(
				wrapper.state('sortOrder')
			);
			expect(sortControl.prop('onChange').name, 'TableSortControl "onChange" prop').to.be.equal(
				'bound changeSorting'
			);

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
			let cells, cell;

			expect(rows.length, 'rows length').to.be.equal(2);
			cells = rows.at(0).find('td');
			expect(cells.length, 'row 1, cells length').to.be.equal(13);
			expect(cells.at(0).prop('className'), 'row 1, cell 1, className').to.be.equal(
				styles['ok']
			);
			cell = cells.at(1);
			expect(cell.prop('className'), 'row 1, cell 2, className').to.be.equal(
				`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
			);
			expect(cell.text(), 'row 1, cell 2, text').to.be.equal('test');
			expect(cells.at(2).text(), 'row 1, cell 3, text').to.be.equal('10');
			expect(cells.at(3).text(), 'row 1, cell 4, text').to.be.equal('9');
			cell = cells.at(4);
			expect(cell.prop('className'), 'row 1, cell 5, className').to.be.equal(
				styles['bdr']
			);
			expect(cell.text(), 'row 1, cell 5, text').to.be.equal('8');
			expect(cells.at(5).text(), 'row 1, cell 6, text').to.be.equal('7');
			expect(cells.at(6).text(), 'row 1, cell 7, text').to.be.equal('6');
			expect(cells.at(7).text(), 'row 1, cell 8, text').to.be.equal('5');
			expect(cells.at(8).text(), 'row 1, cell 9, text').to.be.equal('4');
			expect(cells.at(9).text(), 'row 1, cell 10, text').to.be.equal('3');
			expect(cells.at(10).text(), 'row 1, cell 11, text').to.be.equal('2');
			expect(cells.at(11).text(), 'row 1, cell 12, text').to.be.equal('1');
			expect(cells.at(12).text(), 'row 1, cell 13, text').to.be.equal('0');

			cells = rows.at(1).find('td');
			expect(cells.length, 'row 1, cells length').to.be.equal(13);
			expect(cells.at(0).prop('className'), 'row 2, cell 1, className').to.be.equal(
				styles['alert']
			);

			wrapper.unmount();
		});
	});
});
