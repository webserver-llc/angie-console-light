/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';

import ServerZones from '../serverzones.jsx';
import { SortableTable, tableUtils, styles } from '#/components/table';
import utils from '#/utils';
import tooltips from '#/tooltips/index.jsx';

describe('<ServerZones />', () => {
	it('extends SortableTable', () => {
		expect(ServerZones.prototype instanceof SortableTable).to.be.true;
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(<ServerZones />);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).to.be.equal('streamZonesSortOrder');

		wrapper.unmount();
	});

	describe('render()', () => {
		it('no zones', () => {
			const wrapper = shallow(<ServerZones />);

			expect(wrapper, 'return value').to.have.lengthOf(0);

			wrapper.unmount();
		});

		it('sort zones', () => {
			const wrapper = shallow(
				<ServerZones data={ new Map([
					['test', {
						alert: false,
						warning: false,
						data: {},
						responses: {}
					}], ['test_2', {
						alert: true,
						warning: false,
						data: {},
						responses: {}
					}], ['test_3', {
						alert: false,
						warning: true,
						data: {},
						responses: {}
					}], ['test_4', {
						alert: false,
						warning: false,
						data: {},
						responses: {}
					}]
				]) } />
			);
			let rows = wrapper.find('tbody tr');

			expect(rows.at(0).find('td').at(1).text(), 'row 1, title').to.be.equal('test');
			expect(rows.at(1).find('td').at(1).text(), 'row 2, title').to.be.equal('test_2');
			expect(rows.at(2).find('td').at(1).text(), 'row 3, title').to.be.equal('test_3');
			expect(rows.at(3).find('td').at(1).text(), 'row 4, title').to.be.equal('test_4');

			wrapper.setState({ sortOrder: 'desc' });
			rows = wrapper.find('tbody tr');

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

		it('component', () => {
			const wrapper = shallow(
				<ServerZones data={[]} />
			);
			const table = wrapper.find(`.${ styles['table'] }`);
			const sortControl = table.find('TableSortControl');

			expect(wrapper.getElement().type, 'wrapper html tag').to.be.equal('div');
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

		it('zone row', () => {
			stub(tooltips, 'useTooltip').callsFake(() => ({
				prop_from_useTooltip: true
			}));
			stub(utils, 'formatReadableBytes').callsFake(
				a => `formatted_${ a }`
			);
			stub(tableUtils, 'responsesTextWithTooltip').callsFake(value => value);

			const items = [
				['test', {
					warning: false,
					'5xxChanged': false,
					requests: 100,
					processing: 99,
					discarded: 2,
					zone_req_s: 10,
					responses: {
						'1xx': 0,
						'2xx': 500,
						'3xx': 1,
						'4xx': 5,
						'5xx': 0,
						codes: {
							'404': 1,
							'403': 2,
						},
						total: 506
					},
					'4xxChanged': false,
					sent_s: 1,
					rcvd_s: 2,
					data: {
						sent: 3,
						received: 4,
					},
					ssl: {
						handshaked: 135,
						failed: 24,
						reuses: 19,
						timedout: 4,
					}
				}], ['test_2', {
					warning: true,
					'5xxChanged': false,
					processing: 999,
					discarded: 3,
					requests: 1000,
					zone_req_s: 100,
					responses: {
						'1xx': 1,
						'2xx': 5000,
						'3xx': 10,
						'4xx': 50,
						'5xx': 1,
						total: 5062
					},
					'4xxChanged': true,
					sent_s: 2,
					rcvd_s: 3,
					data: {
						sent: 4,
						received: 5
					}
				}], ['test_3', {
					warning: false,
					'5xxChanged': true,
					processing: 9,
					discarded: 4,
					requests: 10,
					zone_req_s: 1,
					responses: {
						'1xx': 0,
						'2xx': 2,
						'3xx': 0,
						'4xx': 0,
						'5xx': 0,
						codes: {
							'200': 2,
						},
						total: 2
					},
					'4xxChanged': false,
					sent_s: 3,
					rcvd_s: 4,
					data: {
						sent: 5,
						received: 6
					}
				}]
			];
			const wrapper = shallow(
				<ServerZones data={ new Map(items) } />
			);
			const rows = wrapper.find('tbody tr');
			let cells, cell;

			expect(rows.length, 'rows length').to.be.equal(3);

			// Row 1
			cells = rows.at(0).find('td');
			expect(cells.length, 'row 1, cells length').to.be.equal(19);
			expect(cells.at(0).prop('className'), 'row 1, cell 1, className').to.be.equal(
				styles['ok']
			);
			cell = cells.at(1);
			expect(cell.prop('className'), 'row 1, cell 2, className').to.be.equal(
				`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
			);
			expect(cell.text(), 'row 1, cell 2, text').to.be.equal('test');
			expect(cells.at(2).text(), 'row 1, cell 3, text').to.be.equal('99');
			expect(cells.at(3).text(), 'row 1, cell 4, text').to.be.equal('100');
			cell = cells.at(4);
			expect(cell.prop('className'), 'row 1, cell 5, className').to.be.equal(
				styles['bdr']
			);
			expect(cell.text(), 'row 1, cell 5, text').to.be.equal('10');
			expect(cells.at(5).text(), 'row 1, cell 6, text').to.be.equal('0');
			expect(cells.at(6).text(), 'row 1, cell 7, text').to.be.equal('500');
			expect(cells.at(7).text(), 'row 1, cell 8, text').to.be.equal('1');
			cell = cells.at(8);
			expect(cell.prop('className'), 'row 1, cell 9, className').to.be.equal(
				styles['flash']
			);
			expect(cell.text(), 'row 1, cell 9, text').to.be.equal('7');
			cell = cells.at(9);
			expect(cell.prop('className'), 'row 1, cell 10, className').to.be.equal(
				styles['flash']
			);
			expect(cell.text(), 'row 1, cell 10, text').to.be.equal('0');
			cell = cells.at(10);
			expect(cell.prop('className'), 'row 1, cell 11, className').to.be.equal(
				styles['bdr']
			);
			expect(cell.text(), 'row 1, cell 11, text').to.be.equal('506');
			cell = cells.at(11);
			expect(cell.prop('className'), 'row 1, cell 12, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 1, cell 12, text').to.be.equal('formatted_1');
			cell = cells.at(12);
			expect(cell.prop('className'), 'row 1, cell 13, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 1, cell 13, text').to.be.equal('formatted_2');
			cell = cells.at(13);
			expect(cell.prop('className'), 'row 1, cell 14, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 1, cell 14, text').to.be.equal('formatted_3');
			cell = cells.at(14);
			expect(cell.prop('className'), 'row 1, cell 15, className').to.be.equal(
				`${ styles.px60 } ${ styles.bdr }`
			);
			expect(cell.text(), 'row 1, cell 15, text').to.be.equal('formatted_4');
			expect(cells.at(15).text(), 'row 1, cell 16, text').to.be.equal('135');
			expect(cells.at(16).text(), 'row 1, cell 17, text').to.be.equal('19');
			expect(cells.at(17).text(), 'row 1, cell 18, text').to.be.equal('4');
			expect(cells.at(18).text(), 'row 1, cell 18, text').to.be.equal('24');

			// TODO: Add tests for SSL Verify Failures cell

			// Row 2
			cells = rows.at(1).find('td');
			expect(cells.length, 'row 2, cells length').to.be.equal(19);
			expect(cells.at(0).prop('className'), 'row 2, cell 1, className').to.be.equal(
				styles['warning']
			);
			cell = cells.at(1);
			expect(cell.prop('className'), 'row 2, cell 2, className').to.be.equal(
				`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
			);
			expect(cell.text(), 'row 2, cell 2, text').to.be.equal('test_2');
			expect(cells.at(2).text(), 'row 2, cell 3, text').to.be.equal('999');
			expect(cells.at(3).text(), 'row 2, cell 4, text').to.be.equal('1000');
			cell = cells.at(4);
			expect(cell.prop('className'), 'row 2, cell 5, className').to.be.equal(
				styles['bdr']
			);
			expect(cell.text(), 'row 2, cell 5, text').to.be.equal('100');
			expect(cells.at(5).text(), 'row 2, cell 6, text').to.be.equal('1');
			expect(cells.at(6).text(), 'row 2, cell 7, text').to.be.equal('5000');
			expect(cells.at(7).text(), 'row 2, cell 8, text').to.be.equal('10');
			cell = cells.at(8);
			expect(cell.prop('className'), 'row 2, cell 9, className').to.be.equal(
				`${ styles['flash'] } ${ styles['red-flash'] }`
			);
			expect(cell.text(), 'row 2, cell 9, text').to.be.equal('53');
			cell = cells.at(9);
			expect(cell.prop('className'), 'row 2, cell 10, className').to.be.equal(
				styles['flash']
			);
			expect(cell.text(), 'row 2, cell 10, text').to.be.equal('1');
			cell = cells.at(10);
			expect(cell.prop('className'), 'row 2, cell 11, className').to.be.equal(
				styles['bdr']
			);
			expect(cell.text(), 'row 2, cell 11, text').to.be.equal('5062');
			cell = cells.at(11);
			expect(cell.prop('className'), 'row 2, cell 12, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 2, cell 12, text').to.be.equal('formatted_2');
			cell = cells.at(12);
			expect(cell.prop('className'), 'row 2, cell 13, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 2, cell 13, text').to.be.equal('formatted_3');
			cell = cells.at(13);
			expect(cell.prop('className'), 'row 2, cell 14, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 2, cell 14, text').to.be.equal('formatted_4');
			cell = cells.at(14);
			expect(cell.prop('className'), 'row 2, cell 15, className').to.be.equal(
				`${ styles.px60 } ${ styles.bdr }`
			);
			expect(cell.text(), 'row 2, cell 15, text').to.be.equal('formatted_5');
			expect(cells.at(15).text(), 'row 2, cell 16, text').to.be.equal('–');
			expect(cells.at(16).text(), 'row 2, cell 17, text').to.be.equal('–');
			expect(cells.at(17).text(), 'row 2, cell 18, text').to.be.equal('–');

			// TODO: Add tests for SSL Verify Failures cell

			// Row 3
			cells = rows.at(2).find('td');
			expect(cells.length, 'row 3, cells length').to.be.equal(19);
			expect(cells.at(0).prop('className'), 'row 3, cell 1, className').to.be.equal(
				styles['alert']
			);
			cell = cells.at(1);
			expect(cell.prop('className'), 'row 3, cell 2, className').to.be.equal(
				`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
			);
			expect(cell.text(), 'row 3, cell 2, text').to.be.equal('test_3');
			expect(cells.at(2).text(), 'row 3, cell 3, text').to.be.equal('9');
			expect(cells.at(3).text(), 'row 3, cell 4, text').to.be.equal('10');
			cell = cells.at(4);
			expect(cell.prop('className'), 'row 3, cell 5, className').to.be.equal(
				styles['bdr']
			);
			expect(cell.text(), 'row 3, cell 5, text').to.be.equal('1');
			expect(cells.at(5).text(), 'row 3, cell 6, text').to.be.equal('0');
			expect(cells.at(6).text(), 'row 3, cell 7, text').to.be.equal('2');
			expect(cells.at(7).text(), 'row 3, cell 8, text').to.be.equal('0');
			cell = cells.at(8);
			expect(cell.prop('className'), 'row 3, cell 9, className').to.be.equal(
				styles['flash']
			);
			expect(cell.text(), 'row 3, cell 9, text').to.be.equal('4');
			cell = cells.at(9);
			expect(cell.prop('className'), 'row 3, cell 10, className').to.be.equal(
				`${ styles['flash'] } ${ styles['red-flash'] }`
			);
			expect(cell.text(), 'row 3, cell 10, text').to.be.equal('0');
			cell = cells.at(10);
			expect(cell.prop('className'), 'row 3, cell 11, className').to.be.equal(
				styles['bdr']
			);
			expect(cell.text(), 'row 3, cell 11, text').to.be.equal('2');
			cell = cells.at(11);
			expect(cell.prop('className'), 'row 3, cell 12, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 3, cell 12, text').to.be.equal('formatted_3');
			cell = cells.at(12);
			expect(cell.prop('className'), 'row 3, cell 13, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 3, cell 13, text').to.be.equal('formatted_4');
			cell = cells.at(13);
			expect(cell.prop('className'), 'row 3, cell 14, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 3, cell 14, text').to.be.equal('formatted_5');
			cell = cells.at(14);
			expect(cell.prop('className'), 'row 3, cell 15, className').to.be.equal(
				`${ styles.px60 } ${ styles.bdr }`
			);
			expect(cell.text(), 'row 3, cell 15, text').to.be.equal('formatted_6');
			expect(cells.at(15).text(), 'row 3, cell 16, text').to.be.equal('–');
			expect(cells.at(16).text(), 'row 3, cell 17, text').to.be.equal('–');
			expect(cells.at(17).text(), 'row 3, cell 18, text').to.be.equal('–');

			// TODO: Add tests for SSL Verify Failures cell

			expect(tableUtils.responsesTextWithTooltip.callCount, 'responsesTextWithTooltip called 15 times').to.be.equal(15);
			expect(tableUtils.responsesTextWithTooltip.args[0][0], 'responsesTextWithTooltip row 1, arg 1, 1xx').to.be.equal(items[0][1].responses['1xx']);
			expect(tableUtils.responsesTextWithTooltip.args[0][1], 'responsesTextWithTooltip row 1, arg 2, 1xx').to.be.equal(items[0][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[0][2], 'responsesTextWithTooltip row 1, arg 3, 1xx').to.be.equal('1');
			expect(tableUtils.responsesTextWithTooltip.args[1][0], 'responsesTextWithTooltip row 1, arg 1, 2xx').to.be.equal(items[0][1].responses['2xx']);
			expect(tableUtils.responsesTextWithTooltip.args[1][1], 'responsesTextWithTooltip row 1, arg 2, 2xx').to.be.equal(items[0][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[1][2], 'responsesTextWithTooltip row 1, arg 3, 2xx').to.be.equal('2');
			expect(tableUtils.responsesTextWithTooltip.args[2][0], 'responsesTextWithTooltip row 1, arg 1, 3xx').to.be.equal(items[0][1].responses['3xx']);
			expect(tableUtils.responsesTextWithTooltip.args[2][1], 'responsesTextWithTooltip row 1, arg 2, 3xx').to.be.equal(items[0][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[2][2], 'responsesTextWithTooltip row 1, arg 3, 3xx').to.be.equal('3');
			expect(tableUtils.responsesTextWithTooltip.args[3][0], 'responsesTextWithTooltip row 1, arg 1, 4xx').to.be.equal(
				items[0][1].responses['4xx'] + items[0][1].discarded
			);
			expect(tableUtils.responsesTextWithTooltip.args[3][1], 'responsesTextWithTooltip row 1, arg 2, 4xx').to.be.deep.equal({
				...items[0][1].responses.codes,
				'499/444/408': items[0][1].discarded,
			});
			expect(tableUtils.responsesTextWithTooltip.args[3][2], 'responsesTextWithTooltip row 1, arg 3, 4xx').to.be.equal('4');
			expect(tableUtils.responsesTextWithTooltip.args[4][0], 'responsesTextWithTooltip row 1, arg 1, 5xx').to.be.equal(items[0][1].responses['5xx']);
			expect(tableUtils.responsesTextWithTooltip.args[4][1], 'responsesTextWithTooltip row 1, arg 2, 5xx').to.be.equal(items[0][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[4][2], 'responsesTextWithTooltip row 1, arg 3, 5xx').to.be.equal('5');
			expect(tableUtils.responsesTextWithTooltip.args[5][0], 'responsesTextWithTooltip row 2, arg 1, 1xx').to.be.equal(items[1][1].responses['1xx']);
			expect(tableUtils.responsesTextWithTooltip.args[5][1], 'responsesTextWithTooltip row 2, arg 2, 1xx').to.be.equal(items[1][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[5][2], 'responsesTextWithTooltip row 2, arg 3, 1xx').to.be.equal('1');
			expect(tableUtils.responsesTextWithTooltip.args[6][0], 'responsesTextWithTooltip row 2, arg 1, 2xx').to.be.equal(items[1][1].responses['2xx']);
			expect(tableUtils.responsesTextWithTooltip.args[6][1], 'responsesTextWithTooltip row 2, arg 2, 2xx').to.be.equal(items[1][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[6][2], 'responsesTextWithTooltip row 2, arg 3, 2xx').to.be.equal('2');
			expect(tableUtils.responsesTextWithTooltip.args[7][0], 'responsesTextWithTooltip row 2, arg 1, 3xx').to.be.equal(items[1][1].responses['3xx']);
			expect(tableUtils.responsesTextWithTooltip.args[7][1], 'responsesTextWithTooltip row 2, arg 2, 3xx').to.be.equal(items[1][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[7][2], 'responsesTextWithTooltip row 2, arg 3, 3xx').to.be.equal('3');
			expect(tableUtils.responsesTextWithTooltip.args[8][0], 'responsesTextWithTooltip row 2, arg 1, 4xx').to.be.equal(
				items[1][1].responses['4xx'] + items[1][1].discarded
			);
			expect(tableUtils.responsesTextWithTooltip.args[8][1], 'responsesTextWithTooltip row 2, arg 2, 4xx').to.be.deep.equal({
				'4xx': items[1][1].responses['4xx'],
				'499/444/408': items[1][1].discarded,
			});
			expect(tableUtils.responsesTextWithTooltip.args[8][2], 'responsesTextWithTooltip row 2, arg 3, 4xx').to.be.equal('4');
			expect(tableUtils.responsesTextWithTooltip.args[9][0], 'responsesTextWithTooltip row 2, arg 1, 5xx').to.be.equal(items[1][1].responses['5xx']);
			expect(tableUtils.responsesTextWithTooltip.args[9][1], 'responsesTextWithTooltip row 2, arg 2, 5xx').to.be.equal(items[1][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[9][2], 'responsesTextWithTooltip row 2, arg 3, 5xx').to.be.equal('5');
			expect(tableUtils.responsesTextWithTooltip.args[10][0], 'responsesTextWithTooltip row 3, arg 1, 1xx').to.be.equal(items[2][1].responses['1xx']);
			expect(tableUtils.responsesTextWithTooltip.args[10][1], 'responsesTextWithTooltip row 3, arg 2, 1xx').to.be.equal(items[2][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[10][2], 'responsesTextWithTooltip row 3, arg 3, 1xx').to.be.equal('1');
			expect(tableUtils.responsesTextWithTooltip.args[11][0], 'responsesTextWithTooltip row 3, arg 1, 2xx').to.be.equal(items[2][1].responses['2xx']);
			expect(tableUtils.responsesTextWithTooltip.args[11][1], 'responsesTextWithTooltip row 3, arg 2, 2xx').to.be.equal(items[2][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[11][2], 'responsesTextWithTooltip row 3, arg 3, 2xx').to.be.equal('2');
			expect(tableUtils.responsesTextWithTooltip.args[12][0], 'responsesTextWithTooltip row 3, arg 1, 3xx').to.be.equal(items[2][1].responses['3xx']);
			expect(tableUtils.responsesTextWithTooltip.args[12][1], 'responsesTextWithTooltip row 3, arg 2, 3xx').to.be.equal(items[2][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[12][2], 'responsesTextWithTooltip row 3, arg 3, 3xx').to.be.equal('3');
			expect(tableUtils.responsesTextWithTooltip.args[13][0], 'responsesTextWithTooltip row 3, arg 1, 4xx').to.be.equal(
				items[2][1].responses['4xx'] + items[2][1].discarded
			);
			expect(tableUtils.responsesTextWithTooltip.args[13][1], 'responsesTextWithTooltip row 3, arg 2, 4xx').to.be.deep.equal({
				...items[2][1].responses.codes,
				'499/444/408': items[2][1].discarded,
			});
			expect(tableUtils.responsesTextWithTooltip.args[13][2], 'responsesTextWithTooltip row 3, arg 3, 4xx').to.be.equal('4');
			expect(tableUtils.responsesTextWithTooltip.args[14][0], 'responsesTextWithTooltip row 3, arg 1, 5xx').to.be.equal(items[2][1].responses['5xx']);
			expect(tableUtils.responsesTextWithTooltip.args[14][1], 'responsesTextWithTooltip row 3, arg 2, 5xx').to.be.equal(items[2][1].responses.codes);
			expect(tableUtils.responsesTextWithTooltip.args[14][2], 'responsesTextWithTooltip row 3, arg 3, 5xx').to.be.equal('5');

			expect(utils.formatReadableBytes.callCount, 'useTooltip called').to.be.equal(12);
			expect(utils.formatReadableBytes.args[0][0], 'useTooltip call 1 arg').to.be.equal(1);
			expect(utils.formatReadableBytes.args[1][0], 'useTooltip call 2 arg').to.be.equal(2);
			expect(utils.formatReadableBytes.args[2][0], 'useTooltip call 3 arg').to.be.equal(3);
			expect(utils.formatReadableBytes.args[3][0], 'useTooltip call 4 arg').to.be.equal(4);
			expect(utils.formatReadableBytes.args[4][0], 'useTooltip call 5 arg').to.be.equal(2);
			expect(utils.formatReadableBytes.args[5][0], 'useTooltip call 6 arg').to.be.equal(3);
			expect(utils.formatReadableBytes.args[6][0], 'useTooltip call 7 arg').to.be.equal(4);
			expect(utils.formatReadableBytes.args[7][0], 'useTooltip call 8 arg').to.be.equal(5);
			expect(utils.formatReadableBytes.args[8][0], 'useTooltip call 9 arg').to.be.equal(3);
			expect(utils.formatReadableBytes.args[9][0], 'useTooltip call 10 arg').to.be.equal(4);
			expect(utils.formatReadableBytes.args[10][0], 'useTooltip call 11 arg').to.be.equal(5);
			expect(utils.formatReadableBytes.args[11][0], 'useTooltip call 12 arg').to.be.equal(6);

			utils.formatReadableBytes.restore();
			tooltips.useTooltip.restore();
			tableUtils.responsesTextWithTooltip.restore();
			wrapper.unmount();
		});
	});
});
