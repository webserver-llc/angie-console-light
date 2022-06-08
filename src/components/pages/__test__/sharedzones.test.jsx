/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import { SharedZones } from '../sharedzones.jsx';
import SortableTable from '../../table/sortabletable.jsx';
import styles from '../../table/style.css';
import ProgressBar from '../../progressbar/progressbar.jsx';
import tooltips from '../../../tooltips/index.jsx';

describe('<SharedZones Page />', () => {
	it('extends SortableTable', () => {
		expect(SharedZones.prototype instanceof SortableTable).to.be.true;
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(<SharedZones data={{ slabs: [] }} />);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).to.be.equal('sharedZonesSortOrder');

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

			expect(rows.at(0).find('td').at(1).text(), 'row 1, title').to.be.equal('test');
			expect(rows.at(1).find('td').at(1).text(), 'row 2, title').to.be.equal('test_2');
			expect(rows.at(2).find('td').at(1).text(), 'row 3, title').to.be.equal('test_3');
			expect(rows.at(3).find('td').at(1).text(), 'row 4, title').to.be.equal('test_4');

			wrapper.setState({ sortOrder: 'desc' });
			rows = wrapper.find('tbody tr');

			expect(rows.at(0).find('td').at(1).text(), 'row 1, title [desc]').to.be.equal('test_4');
			expect(rows.at(1).find('td').at(1).text(), 'row 2, title [desc]').to.be.equal('test_3');
			expect(rows.at(2).find('td').at(1).text(), 'row 3, title [desc]').to.be.equal('test');
			expect(rows.at(3).find('td').at(1).text(), 'row 4, title [desc]').to.be.equal('test_2');

			wrapper.unmount();
		});

		it('return value', () => {
			stub(tooltips, 'useTooltip').callsFake(() => {});

			const wrapper = shallow(<SharedZones data={{ slabs: [] }} />);
			const table = wrapper.find(`.${ styles['table'] }`);
			const sortControl = table.find('TableSortControl');

			expect(wrapper.getElement().type, 'wrapper html tag').to.be.equal('div');
			expect(table.length, 'table container').to.be.equal(1);
			expect(sortControl.length, 'TableSortControl length').to.be.equal(1);
			expect(sortControl.prop('singleRow'), 'TableSortControl "singleRow" prop').to.be.true;
			expect(sortControl.prop('secondSortLabel'), 'TableSortControl "secondSortLabel" prop')
				.to.be.equal('Sort by size - large first');
			expect(sortControl.prop('order'), 'TableSortControl "order" prop').to.be.equal(
				wrapper.state('sortOrder')
			);
			expect(sortControl.prop('onChange').name, 'TableSortControl "onChange" prop').to.be.equal(
				'bound changeSorting'
			);
			expect(wrapper.find(`.${ styles['hinted'] }`).length, 'hinted element length').to.be.equal(1);
			expect(tooltips.useTooltip.calledOnce, 'useTooltip called once').to.be.true;
			expect(tooltips.useTooltip.args[0][0], 'useTooltip 1st arg').to.be.equal(
				'Memory usage = Used memory pages / Total memory pages'
			);
			expect(tooltips.useTooltip.args[0][1], 'useTooltip 2nd arg').to.be.equal('hint');

			wrapper.unmount();
			tooltips.useTooltip.restore();
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

			expect(rows.length, 'rows length').to.be.equal(1);

			const cells = rows.at(0).find('td');

			expect(cells.length, 'row 1, cells length').to.be.equal(5);
			expect(cells.at(0).prop('className'), 'row 1, cell 1, className').to.be.equal(
				styles['status']
			);

			const cell = cells.at(1);

			expect(cell.prop('className'), 'row 1, cell 2, className').to.be.equal(
				styles['bold']
			);
			expect(cell.text(), 'row 1, cell 2, text').to.be.equal('test');
			expect(cells.at(2).text(), 'row 1, cell 3, text').to.be.equal('1000');
			expect(cells.at(3).text(), 'row 1, cell 4, text').to.be.equal('200');

			const progressBar = cells.at(4).find('ProgressBar');

			expect(progressBar.length, 'ProgressBar length').to.be.equal(1);
			expect(progressBar.prop('percentage'), 'ProgressBar "percentage" prop').to.be.equal(20);

			wrapper.unmount();
		});
	});
});
