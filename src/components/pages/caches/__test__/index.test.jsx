/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import { Caches } from '../index.jsx';
import utils from '../../../../utils.js';
import tooltips from '../../../../tooltips/index.jsx';
import styles from '../../../table/style.css';

describe('<Caches Page />', () => {
	it('formatReadableBytes()', () => {
		stub(utils, 'formatReadableBytes').callsFake(() => 'test_result');

		expect(Caches.formatReadableBytes(12, 'MB'), 'result').to.be.equal('test_result');
		expect(utils.formatReadableBytes.calledOnce, 'formatReadableBytes called once').to.be.true;
		expect(utils.formatReadableBytes.args[0][0], 'formatReadableBytes arg 1').to.be.equal(12);
		expect(utils.formatReadableBytes.args[0][1], 'formatReadableBytes arg 2').to.be.equal('MB');
		expect(utils.formatReadableBytes.args[0][2], 'formatReadableBytes arg 3').to.be.deep.equal(
			{ 0: 'B', 1: 'KB', 2: 'MB', 3: 'GB', 4: 'TB' }
		);

		utils.formatReadableBytes.restore();
	});

	describe('render()', () => {
		it('tooltips', () => {
			stub(tooltips, 'useTooltip').callsFake(() => ({
				passed_by_useTooltip: true
			}));

			const wrapper = shallow(
				<Caches data={{ caches: new Map() }} />
			);
			let hintedEl;

			expect(tooltips.useTooltip.callCount, 'useTooltip call count').to.be.equal(3);
			expect(tooltips.useTooltip.args[0][0].type.displayName, 'useTooltip call 1, arg 1')
				.to.be.equal('CacheStateTooltip');
			expect(tooltips.useTooltip.args[0][1], 'useTooltip call 1, arg 2').to.be.equal('hint');

			hintedEl = wrapper.find(`thead span.${ styles['hinted'] }`).at(0);

			expect(hintedEl.text(), 'first hinted el prop').to.be.equal('State');
			expect(hintedEl.prop('passed_by_useTooltip'), 'first hinted el prop').to.be.true;

			expect(tooltips.useTooltip.args[1][0], 'useTooltip call 2, arg 1').to.be.equal(
				'Memory usage = Used memory pages / Total memory pages'
			);
			expect(tooltips.useTooltip.args[1][1], 'useTooltip call 2, arg 2').to.be.equal('hint');

			hintedEl = wrapper.find(`thead span.${ styles['hinted'] }`).at(1);

			expect(hintedEl.text(), 'first hinted el prop').to.be.equal('Memory usage');
			expect(hintedEl.prop('passed_by_useTooltip'), 'first hinted el prop').to.be.true;

			expect(tooltips.useTooltip.args[2][0], 'useTooltip call 3, arg 1').to.be.equal(
				'Disk usage = Used / Max size'
			);
			expect(tooltips.useTooltip.args[2][1], 'useTooltip call 3, arg 2').to.be.equal('hint');

			hintedEl = wrapper.find(`thead span.${ styles['hinted'] }`).at(2);

			expect(hintedEl.text(), 'first hinted el prop').to.be.equal('Disk usage');
			expect(hintedEl.prop('passed_by_useTooltip'), 'first hinted el prop').to.be.true;

			expect(wrapper.find('tbody tr'), 'caches rows').to.have.lengthOf(0);

			tooltips.useTooltip.restore();
			wrapper.unmount();
		});

		it('caches rows', () => {
			stub(tooltips, 'useTooltip').callsFake((prop_1, prop_2) => ({
				useTooltip_prop_1: prop_1,
				useTooltip_prop_2: prop_2
			}));
			stub(Caches, 'formatReadableBytes').callsFake(a => a);

			const wrapper = shallow(
				<Caches data={{ caches: new Map([
					['test_1', {
						cold: false,
						slab: 'test_slab_1',
						zoneSize: 30,
						max_size: 500,
						size: 430,
						warning: false,
						danger: false,
						used: 100,
						traffic: {
							s_served: 3,
							s_written: 2,
							s_bypassed: 1
						},
						hit_percents_generic: 10
					}], ['test_2', {
						cold: true,
						slab: 'test_slab_2',
						zoneSize: undefined,
						max_size: '501',
						size: 431,
						warning: true,
						danger: true,
						used: 101,
						traffic: {
							s_served: 4,
							s_written: 3,
							s_bypassed: 2
						},
						hit_percents_generic: 11
					}]
				]) }} />
			);
			const rows = wrapper.find('tbody tr');
			let cells = rows.at(0).find('td');
			let hintedEl;

			expect(cells.at(0).prop('className'), 'row 1, cell 1, className').to.be.equal(
				`${ styles['bold'] } ${ styles['bdr'] }`
			);
			expect(cells.at(0).text(), 'row 1, cell 1, text').to.be.equal('test_1');
			expect(cells.at(1).prop('className'), 'row 1, cell 2, className').to.be.equal(
				`${ styles['bdr'] } ${ styles['center-align'] }`
			);
			hintedEl = cells.at(1).find('span');
			expect(hintedEl.prop('useTooltip_prop_1'), 'row 1, cell 2, useTooltip arg 1').to.be.equal('Warm');
			expect(hintedEl.prop('useTooltip_prop_2'), 'row 1, cell 2, useTooltip arg 2').to.be.equal('hint');
			expect(hintedEl.childAt(0).name(), 'row 1, cell 2, Icon').to.be.equal('Icon');
			expect(hintedEl.childAt(0).prop('type'), 'row 1, cell 2, Icon prop').to.be.equal('sun');
			expect(cells.at(2).prop('className'), 'row 1, cell 3, className').to.be.equal(styles['bdr']);
			hintedEl = cells.at(2).childAt(0);
			expect(
				hintedEl.prop('useTooltip_prop_1').type.displayName,
				'row 1, cell 3, useTooltip arg 1'
			).to.be.equal('SharedZoneTooltip');
			expect(
				hintedEl.prop('useTooltip_prop_1').props.zone,
				'row 1, cell 3, useTooltip arg 1, attr'
			).to.be.equal('test_slab_1');
			expect(hintedEl.prop('useTooltip_prop_2'), 'row 1, cell 3, useTooltip arg 2').to.be.equal('hint');
			expect(hintedEl.childAt(0).name(), 'row 1, cell 3, ProgressBar').to.be.equal('ProgressBar');
			expect(hintedEl.childAt(0).prop('percentage'), 'row 1, cell 3, ProgressBar prop').to.be.equal(30);
			expect(cells.at(3).prop('className'), 'row 1, cell 4, className').to.be.equal(styles['bdr']);
			expect(cells.at(3).text(), 'row 1, cell 4, text').to.be.equal('500');
			expect(cells.at(4).prop('className'), 'row 1, cell 5, className').to.be.equal(styles['bdr']);
			expect(cells.at(4).text(), 'row 1, cell 5, text').to.be.equal('430');
			expect(cells.at(5).prop('className'), 'row 1, cell 6, className').to.be.equal(styles['bdr']);
			expect(cells.at(5).childAt(0).name(), 'row 1, cell 6, ProgressBar').to.be.equal('ProgressBar');
			expect(cells.at(5).childAt(0).prop('warning'), 'row 1, cell 6, ProgressBar warning').to.be.false;
			expect(cells.at(5).childAt(0).prop('danger'), 'row 1, cell 6, ProgressBar danger').to.be.false;
			expect(cells.at(5).childAt(0).prop('percentage'), 'row 1, cell 6, ProgressBar percentage').to.be.equal(100);
			expect(cells.at(6).prop('className'), 'row 1, cell 7, className').to.be.equal(styles['right-align']);
			expect(cells.at(6).text(), 'row 1, cell 7, text').to.be.equal('3');
			expect(cells.at(7).prop('className'), 'row 1, cell 8, className').to.be.equal(styles['right-align']);
			expect(cells.at(7).text(), 'row 1, cell 8, text').to.be.equal('2');
			expect(cells.at(8).prop('className'), 'row 1, cell 9, className').to.be.equal(
				`${ styles['bdr'] } ${ styles['right-align'] }`
			);
			expect(cells.at(8).text(), 'row 1, cell 9, text').to.be.equal('1');
			expect(cells.at(9).childAt(0).name(), 'row 1, cell 10, GaugeIndicator').to.be.equal('GaugeIndicator');
			expect(cells.at(9).childAt(0).prop('percentage'), 'row 1, cell 10, GaugeIndicator prop')
				.to.be.equal(10);

			cells = rows.at(1).find('td');

			expect(cells.at(0).prop('className'), 'row 2, cell 1, className').to.be.equal(
				`${ styles['bold'] } ${ styles['bdr'] }`
			);
			expect(cells.at(0).text(), 'row 2, cell 1, text').to.be.equal('test_2');
			expect(cells.at(1).prop('className'), 'row 2, cell 2, className').to.be.equal(
				`${ styles['bdr'] } ${ styles['center-align'] }`
			);
			hintedEl = cells.at(1).find('span');
			expect(hintedEl.prop('useTooltip_prop_1'), 'row 2, cell 2, useTooltip arg 1').to.be.equal('Cold');
			expect(hintedEl.prop('useTooltip_prop_2'), 'row 2, cell 2, useTooltip arg 2').to.be.equal('hint');
			expect(hintedEl.childAt(0).name(), 'row 2, cell 2, Icon').to.be.equal('Icon');
			expect(hintedEl.childAt(0).prop('type'), 'row 2, cell 2, Icon prop').to.be.equal('snowflake');
			expect(cells.at(2).prop('className'), 'row 2, cell 3, className').to.be.equal(styles['bdr']);
			hintedEl = cells.at(2).childAt(0);
			expect(
				hintedEl.prop('useTooltip_prop_1').type.displayName,
				'row 2, cell 3, useTooltip arg 1'
			).to.be.equal('SharedZoneTooltip');
			expect(
				hintedEl.prop('useTooltip_prop_1').props.zone,
				'row 2, cell 3, useTooltip arg 1, attr'
			).to.be.equal('test_slab_2');
			expect(hintedEl.prop('useTooltip_prop_2'), 'row 2, cell 3, useTooltip arg 2').to.be.equal('hint');
			expect(hintedEl.childAt(0).name(), 'row 2, cell 3, ProgressBar').to.be.equal('ProgressBar');
			expect(hintedEl.childAt(0).prop('percentage'), 'row 2, cell 3, ProgressBar prop').to.be.equal(0);
			expect(cells.at(3).prop('className'), 'row 2, cell 4, className').to.be.equal(styles['bdr']);
			expect(cells.at(3).text(), 'row 2, cell 4, text').to.be.equal('∞');
			expect(cells.at(4).prop('className'), 'row 2, cell 5, className').to.be.equal(styles['bdr']);
			expect(cells.at(4).text(), 'row 2, cell 5, text').to.be.equal('431');
			expect(cells.at(5).prop('className'), 'row 2, cell 6, className').to.be.equal(styles['bdr']);
			expect(cells.at(5).childAt(0).name(), 'row 2, cell 6, ProgressBar').to.be.equal('ProgressBar');
			expect(cells.at(5).childAt(0).prop('warning'), 'row 2, cell 6, ProgressBar warning').to.be.true;
			expect(cells.at(5).childAt(0).prop('danger'), 'row 2, cell 6, ProgressBar danger').to.be.true;
			expect(cells.at(5).childAt(0).prop('percentage'), 'row 2, cell 6, ProgressBar percentage').to.be.equal(-1);
			expect(cells.at(6).prop('className'), 'row 2, cell 7, className').to.be.equal(styles['right-align']);
			expect(cells.at(6).text(), 'row 2, cell 7, text').to.be.equal('4');
			expect(cells.at(7).prop('className'), 'row 2, cell 8, className').to.be.equal(styles['right-align']);
			expect(cells.at(7).text(), 'row 2, cell 8, text').to.be.equal('3');
			expect(cells.at(8).prop('className'), 'row 2, cell 9, className').to.be.equal(
				`${ styles['bdr'] } ${ styles['right-align'] }`
			);
			expect(cells.at(8).text(), 'row 2, cell 9, text').to.be.equal('2');
			expect(cells.at(9).childAt(0).name(), 'row 2, cell 10, GaugeIndicator').to.be.equal('GaugeIndicator');
			expect(cells.at(9).childAt(0).prop('percentage'), 'row 2, cell 10, GaugeIndicator prop')
				.to.be.equal(11);

			expect(Caches.formatReadableBytes.callCount, 'row 1, Caches.formatReadableBytes call count').to.be.equal(9);
			expect(Caches.formatReadableBytes.args[0][0], 'row 1, Caches.formatReadableBytes call 1, arg 1')
				.to.be.equal(500);
			expect(Caches.formatReadableBytes.args[0][1], 'row 1, Caches.formatReadableBytes call 1, arg 2')
				.to.be.equal('GB');
			expect(Caches.formatReadableBytes.args[1][0], 'row 1, Caches.formatReadableBytes call 2, arg 1')
				.to.be.equal(430);
			expect(Caches.formatReadableBytes.args[1][1], 'row 1, Caches.formatReadableBytes call 2, arg 2')
				.to.be.equal('GB');
			expect(Caches.formatReadableBytes.args[2][0], 'row 1, Caches.formatReadableBytes call 3, arg 1')
				.to.be.equal(3);
			expect(Caches.formatReadableBytes.args[3][0], 'row 1, Caches.formatReadableBytes call 4, arg 1')
				.to.be.equal(2);
			expect(Caches.formatReadableBytes.args[4][0], 'row 1, Caches.formatReadableBytes call 5, arg 1')
				.to.be.equal(1);
			expect(Caches.formatReadableBytes.args[5][0], 'row 2, Caches.formatReadableBytes call 1, arg 1')
				.to.be.equal(431);
			expect(Caches.formatReadableBytes.args[5][1], 'row 2, Caches.formatReadableBytes call 1, arg 2')
				.to.be.equal('GB');
			expect(Caches.formatReadableBytes.args[6][0], 'row 2, Caches.formatReadableBytes call 2, arg 1')
				.to.be.equal(4);
			expect(Caches.formatReadableBytes.args[7][0], 'row 2, Caches.formatReadableBytes call 3, arg 1')
				.to.be.equal(3);
			expect(Caches.formatReadableBytes.args[8][0], 'row 2, Caches.formatReadableBytes call 4, arg 1')
				.to.be.equal(2);

			tooltips.useTooltip.restore();
			Caches.formatReadableBytes.restore();
			wrapper.unmount();
		});

		it('caches rows with shards', () => {
			stub(tooltips, 'useTooltip').callsFake((prop_1, prop_2) => ({
				useTooltip_prop_1: prop_1,
				useTooltip_prop_2: prop_2
			}));
			stub(Caches, 'formatReadableBytes').callsFake(a => a);
			
			const wrapper = shallow(
				<Caches data={{ caches: new Map([
					['test_1', {
						cold: false,
						slab: 'test_slab_1',
						zoneSize: 30,
						max_size: 500,
						size: 430,
						warning: false,
						danger: false,
						used: 100,
						shards: {
							'/var/cache/angie/proxy_cache/test_slab_1_1': {
								size: 1064960,
								max_size: 16777216,
								cold: false
							},
							'/var/cache/angie/proxy_cache/test_slab_1_2': {
								size: 28672,
								max_size: 16777216,
								cold: false
							}
						},
						traffic: {
							s_served: 3,
							s_written: 2,
							s_bypassed: 1
						},
						hit_percents_generic: 10
					}], ['test_2', {
						cold: true,
						slab: 'test_slab_2',
						zoneSize: undefined,
						max_size: '501',
						size: 431,
						warning: true,
						danger: true,
						used: 101,
						shards: {
							'/var/cache/angie/proxy_cache/test_slab_2_1': {
								size: 1024960,
								max_size: 16777216,
								cold: false
							},
							'/var/cache/angie/proxy_cache/test_slab_2_2': {
								size: 38672,
								max_size: 16777216,
								cold: true
							}
						},
						traffic: {
							s_served: 4,
							s_written: 3,
							s_bypassed: 2
						},
						hit_percents_generic: 11
					}]
				]) }} />
			);
			let expandableAllControl = wrapper.find('table thead tr').at(0).find('th').at(0);
			expect(expandableAllControl.prop('className'))
				.to.be.equal(`${styles.sorter} ${styles.sorterActive} ${styles['hovered-expander']}`);
			expect(expandableAllControl.text(), 'all expandable control, icon').to.be.equal('▾');
			expect(expandableAllControl.prop('rowSpan'), 'all expandable control, rowSpan').to.be.equal(2);
			expect(expandableAllControl.type(), 'all expandable control, type').to.be.equal('th');
			expect(expandableAllControl.prop('useTooltip_prop_1')).to.be.equal('Show all exsists shards');
			expect(expandableAllControl.prop('useTooltip_prop_2')).to.be.equal('hint-right');
			
			let rows = wrapper.find('[data-expandable="true"]');
			expect(rows.length, 'count expandable elements').to.be.equal(2);
			
			let expandableElement = wrapper.find('[data-expandable-element]');
			expect(expandableElement.length).to.be.equal(0);
			expect(rows.at(0).childAt(0).prop('className'), 'row 1, cell 1').to.be.equal(styles['expanding-item-control']);
			expect(rows.at(0).childAt(0).text(), 'row 1, cell 1').to.be.equal('▾');
			
			expect(rows.at(1).childAt(0).prop('className')).to.be.equal(styles['expanding-item-control']);
			expect(rows.at(1).childAt(0).text()).to.be.equal('▾');
			
			expandableAllControl.simulate('click');
			
			expandableAllControl = wrapper.find('table thead tr').at(0).find('th').at(0);
			expect(expandableAllControl.text(), 'open all expandable elements').to.be.equal('▴');
			
			rows = wrapper.find('[data-expandable="true"]');
			expect(rows.length, 'count expandable elements').to.be.equal(2);
			
			expandableElement = wrapper.find('[data-expandable-element]');
			expect(expandableElement.length, 'all expandable tables is show').to.be.equal(2);
			
			expect(rows.at(0).childAt(0).text(), 'row 1, cell 1').to.be.equal('▴');
			expect(rows.at(1).childAt(0).text(), 'row 2, cell 1').to.be.equal('▴');

			rows.at(0).simulate('click')	
			
			expandableAllControl = wrapper.find('table thead tr').at(0).find('th').at(0);
			expect(expandableAllControl.text(), 'all expandable control is closed').to.be.equal('▾');
			
			rows = wrapper.find('[data-expandable="true"]');
			
			expect(rows.at(0).childAt(0).text(), 'row 1, cell 1').to.be.equal('▾');
			expect(rows.at(1).childAt(0).text(), 'row 2, cell 1').to.be.equal('▴');
			
			expandableElement = wrapper.find('[data-expandable-element]');
			expect(expandableElement.length, 'only one expandable element').to.be.equal(1);
			const expandableElementCells = expandableElement.at(0).find('tbody tr');
			
			const row1 = expandableElementCells.at(0).find('td'); 
			const hintElementRow1 = row1.at(1).childAt(0);
			expect(row1.at(0).text(), 'row 1, cell 1').to.be.equal('/var/cache/angie/proxy_cache/test_slab_2_1');
			expect(hintElementRow1.name(), 'row 1, cell 2, Icon').to.be.equal('span');
			expect(hintElementRow1.prop('useTooltip_prop_1'), 'row 1, cell 2, useTooltip arg 1').to.be.equal('Warm');
			expect(hintElementRow1.prop('useTooltip_prop_2'), 'row 1, cell 2, useTooltip arg 2').to.be.equal('hint');
			expect(row1.at(2).text(), 'row 1, cell 3').to.be.equal('16777216');
			expect(row1.at(3).text(), 'row 1, cell 4').to.be.equal('1024960');
			
			const row2 = expandableElementCells.at(1).find('td'); 
			const hintElementRow2 = row2.at(1).childAt(0);
			expect(row2.at(0).text(), 'row 2, cell 1').to.be.equal('/var/cache/angie/proxy_cache/test_slab_2_2');
			expect(hintElementRow2.name(), 'row 2, cell 2, Icon').to.be.equal('span');
			expect(hintElementRow2.prop('useTooltip_prop_1'), 'row 2, cell 2, useTooltip arg 1').to.be.equal('Cold');
			expect(hintElementRow2.prop('useTooltip_prop_2'), 'row 2, cell 2, useTooltip arg 2').to.be.equal('hint');
			expect(row2.at(2).text(), 'row 2, cell 3').to.be.equal('16777216');
			expect(row2.at(3).text(), 'row 2, cell 4').to.be.equal('38672');
			
			tooltips.useTooltip.restore();
			Caches.formatReadableBytes.restore();
			wrapper.unmount();
		})
	});
});
