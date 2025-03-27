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

import ServerZones from '../serverzones.jsx';
import { SortableTable, tableUtils, styles } from '#/components/table';
import tooltips from '#/tooltips/index.jsx';
import HumanReadableBytes from '#/components/human-readable-bytes/human-readable-bytes.jsx';

describe('<ServerZones />', () => {
	it('extends SortableTable', () => {
		expect(ServerZones.prototype instanceof SortableTable).toBe(true);
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(<ServerZones />);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).toBe('streamZonesSortOrder');

		wrapper.unmount();
	});

	describe('render()', () => {
		it('no zones', () => {
			const wrapper = shallow(<ServerZones />);

			// return value
			expect(wrapper).toHaveLength(0);

			wrapper.unmount();
		});

		it('sort zones', () => {
			const wrapper = shallow(
				<ServerZones data={new Map([
					['loca', {
						alert: false,
						warning: false,
						data: {},
						responses: {}
					}], ['maka', {
						alert: true,
						warning: false,
						data: {},
						responses: {}
					}], ['arak', {
						alert: false,
						warning: true,
						data: {},
						responses: {}
					}], ['bora', {
						alert: false,
						warning: false,
						data: {},
						responses: {}
					}]
				])}
				/>
			);
			let rows = wrapper.find('tbody tr');

			// row 1, title
			expect(rows.at(0).find('td').at(1).text()).toBe('loca');
			// row 2, title
			expect(rows.at(1).find('td').at(1).text()).toBe('maka');
			// row 3, title
			expect(rows.at(2).find('td').at(1).text()).toBe('arak');
			// row 4, title
			expect(rows.at(3).find('td').at(1).text()).toBe('bora');

			wrapper.setState({ sortOrder: 'desc' });
			rows = wrapper.find('tbody tr');

			expect(rows.at(0).find('td').at(1).text() === 'arak').toBeTruthy();
			expect(rows.at(1).find('td').at(1).text() === 'bora').toBeTruthy();
			expect(rows.at(2).find('td').at(1).text() === 'loca').toBeTruthy();
			expect(rows.at(3).find('td').at(1).text() === 'maka').toBeTruthy();

			wrapper.unmount();
		});

		it('component', () => {
			const wrapper = shallow(
				<ServerZones data={[]} />
			);
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

		it('zone row', () => {
			jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({
				prop_from_useTooltip: true
			}));
			jest.spyOn(tableUtils, 'responsesTextWithTooltip').mockClear().mockImplementation(value => value);

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
							404: 1,
							403: 2,
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
							200: 2,
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
				<ServerZones data={new Map(items)} />
			);
			const rows = wrapper.find('tbody tr');
			let cells; let
				cell;

			// rows length
			expect(rows.length).toBe(3);

			// Row 1
			cells = rows.at(0).find('td');
			// row 1, cells length
			expect(cells.length).toBe(19);
			// row 1, cell 1, className
			expect(cells.at(0).prop('className')).toBe(styles.ok);
			cell = cells.at(1);
			// row 1, cell 2, className
			expect(cell.prop('className')).toBe(`${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }`);
			// row 1, cell 2, text
			expect(cell.text()).toBe('test');
			// row 1, cell 3, text
			expect(cells.at(2).text()).toBe('99');
			// row 1, cell 4, text
			expect(cells.at(3).text()).toBe('100');
			cell = cells.at(4);
			// row 1, cell 5, className
			expect(cell.prop('className')).toBe(styles.bdr);
			// row 1, cell 5, text
			expect(cell.text()).toBe('10');
			// row 1, cell 6, text
			expect(cells.at(5).text()).toBe('0');
			// row 1, cell 7, text
			expect(cells.at(6).text()).toBe('500');
			// row 1, cell 8, text
			expect(cells.at(7).text()).toBe('1');
			cell = cells.at(8);
			// row 1, cell 9, className
			expect(cell.prop('className')).toBe(styles.flash);
			// row 1, cell 9, text
			expect(cell.text()).toBe('7');
			cell = cells.at(9);
			// row 1, cell 10, className
			expect(cell.prop('className')).toBe(styles.flash);
			// row 1, cell 10, text
			expect(cell.text()).toBe('0');
			cell = cells.at(10);
			// row 1, cell 11, className
			expect(cell.prop('className')).toBe(styles.bdr);
			// row 1, cell 11, text
			expect(cell.text()).toBe('506');

			let row = 0;
			cell = cells.at(11);
			// row 1, cell 12
			expect(cell.prop('className')).toBe(styles.px60);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].sent_s);
			cell = cells.at(12);
			// row 1, cell 13
			expect(cell.prop('className')).toBe(styles.px60);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].rcvd_s);
			cell = cells.at(13);
			// row 1, cell 14
			expect(cell.prop('className')).toBe(styles.px60);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].data.sent);
			cell = cells.at(14);
			// row 1, cell 15
			expect(cell.prop('className')).toBe(`${styles.px60} ${styles.bdr}`);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].data.received);

			cell = cells.at(14);
			// row 1, cell 15, className
			expect(cell.prop('className')).toBe(`${ styles.px60 } ${ styles.bdr }`);
			// row 1, cell 15, text
			expect(cell.find(HumanReadableBytes).props().value).toBe(4);
			// row 1, cell 16, text
			expect(cells.at(15).text()).toBe('135');
			// row 1, cell 17, text
			expect(cells.at(16).text()).toBe('19');
			// row 1, cell 18, text
			expect(cells.at(17).text()).toBe('4');
			// row 1, cell 18, text
			expect(cells.at(18).text()).toBe('24');

			// TODO: Add tests for SSL Verify Failures cell

			// Row 2
			cells = rows.at(1).find('td');
			// row 2, cells length
			expect(cells.length).toBe(19);
			// row 2, cell 1, className
			expect(cells.at(0).prop('className')).toBe(styles.warning);
			cell = cells.at(1);
			// row 2, cell 2, className
			expect(cell.prop('className')).toBe(`${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }`);
			// row 2, cell 2, text
			expect(cell.text()).toBe('test_2');
			// row 2, cell 3, text
			expect(cells.at(2).text()).toBe('999');
			// row 2, cell 4, text
			expect(cells.at(3).text()).toBe('1000');
			cell = cells.at(4);
			// row 2, cell 5, className
			expect(cell.prop('className')).toBe(styles.bdr);
			// row 2, cell 5, text
			expect(cell.text()).toBe('100');
			// row 2, cell 6, text
			expect(cells.at(5).text()).toBe('1');
			// row 2, cell 7, text
			expect(cells.at(6).text()).toBe('5000');
			// row 2, cell 8, text
			expect(cells.at(7).text()).toBe('10');
			cell = cells.at(8);
			// row 2, cell 9, className
			expect(cell.prop('className')).toBe(`${ styles.flash } ${ styles['red-flash'] }`);
			// row 2, cell 9, text
			expect(cell.text()).toBe('53');
			cell = cells.at(9);
			// row 2, cell 10, className
			expect(cell.prop('className')).toBe(styles.flash);
			// row 2, cell 10, text
			expect(cell.text()).toBe('1');
			cell = cells.at(10);
			// row 2, cell 11, className
			expect(cell.prop('className')).toBe(styles.bdr);
			// row 2, cell 11, text
			expect(cell.text()).toBe('5062');

			row = 1;
			// row 2, cell 12
			cell = cells.at(11);
			expect(cell.prop('className')).toBe(styles.px60);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].sent_s);
			// row 2, cell 13
			cell = cells.at(12);
			expect(cell.prop('className')).toBe(styles.px60);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].rcvd_s);
			// row 2, cell 14
			cell = cells.at(13);
			expect(cell.prop('className')).toBe(styles.px60);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].data.sent);
			// row 2, cell 15
			cell = cells.at(14);
			expect(cell.prop('className')).toBe(`${ styles.px60 } ${ styles.bdr }`);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].data.received);

			// row 2, cell 16, text
			expect(cells.at(15).text()).toBe('–');
			// row 2, cell 17, text
			expect(cells.at(16).text()).toBe('–');
			// row 2, cell 18, text
			expect(cells.at(17).text()).toBe('–');

			// TODO: Add tests for SSL Verify Failures cell

			// Row 3
			cells = rows.at(2).find('td');
			// row 3, cells length
			expect(cells.length).toBe(19);
			// row 3, cell 1, className
			expect(cells.at(0).prop('className')).toBe(styles.alert);
			cell = cells.at(1);
			// row 3, cell 2, className
			expect(cell.prop('className')).toBe(`${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }`);
			// row 3, cell 2, text
			expect(cell.text()).toBe('test_3');
			// row 3, cell 3, text
			expect(cells.at(2).text()).toBe('9');
			// row 3, cell 4, text
			expect(cells.at(3).text()).toBe('10');
			cell = cells.at(4);
			// row 3, cell 5, className
			expect(cell.prop('className')).toBe(styles.bdr);
			// row 3, cell 5, text
			expect(cell.text()).toBe('1');
			// row 3, cell 6, text
			expect(cells.at(5).text()).toBe('0');
			// row 3, cell 7, text
			expect(cells.at(6).text()).toBe('2');
			// row 3, cell 8, text
			expect(cells.at(7).text()).toBe('0');
			cell = cells.at(8);
			// row 3, cell 9, className
			expect(cell.prop('className')).toBe(styles.flash);
			// row 3, cell 9, text
			expect(cell.text()).toBe('4');
			cell = cells.at(9);
			// row 3, cell 10, className
			expect(cell.prop('className')).toBe(`${ styles.flash } ${ styles['red-flash'] }`);
			// row 3, cell 10, text
			expect(cell.text()).toBe('0');
			cell = cells.at(10);
			// row 3, cell 11, className
			expect(cell.prop('className')).toBe(styles.bdr);
			// row 3, cell 11, text
			expect(cell.text()).toBe('2');

			row = 2;
			// row 3, cell 12
			cell = cells.at(11);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].sent_s);
			// row 3, cell 13
			cell = cells.at(12);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].rcvd_s);
			// row 3, cell 14
			cell = cells.at(13);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].data.sent);
			// row 3, cell 15
			cell = cells.at(14);
			expect(cell.find(HumanReadableBytes).props().value).toBe(items[row][1].data.received);

			// row 3, cell 16, text
			expect(cells.at(15).text()).toBe('–');
			// row 3, cell 17, text
			expect(cells.at(16).text()).toBe('–');
			// row 3, cell 18, text
			expect(cells.at(17).text()).toBe('–');

			// TODO: Add tests for SSL Verify Failures cell

			expect(tableUtils.responsesTextWithTooltip).toHaveBeenCalledTimes(15);
			// responsesTextWithTooltip row 1, arg 1, 1xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[0][0]).toBe(items[0][1].responses['1xx']);
			// responsesTextWithTooltip row 1, arg 2, 1xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[0][1]).toBe(items[0][1].responses.codes);
			// responsesTextWithTooltip row 1, arg 3, 1xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[0][2]).toBe('1');
			// responsesTextWithTooltip row 1, arg 1, 2xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[1][0]).toBe(items[0][1].responses['2xx']);
			// responsesTextWithTooltip row 1, arg 2, 2xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[1][1]).toBe(items[0][1].responses.codes);
			// responsesTextWithTooltip row 1, arg 3, 2xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[1][2]).toBe('2');
			// responsesTextWithTooltip row 1, arg 1, 3xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[2][0]).toBe(items[0][1].responses['3xx']);
			// responsesTextWithTooltip row 1, arg 2, 3xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[2][1]).toBe(items[0][1].responses.codes);
			// responsesTextWithTooltip row 1, arg 3, 3xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[2][2]).toBe('3');
			// responsesTextWithTooltip row 1, arg 1, 4xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[3][0]).toBe(items[0][1].responses['4xx'] + items[0][1].discarded);
			// responsesTextWithTooltip row 1, arg 2, 4xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[3][1]).toEqual({
				...items[0][1].responses.codes,
				'499/444/408': items[0][1].discarded,
			});
			// responsesTextWithTooltip row 1, arg 3, 4xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[3][2]).toBe('4');
			// responsesTextWithTooltip row 1, arg 1, 5xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[4][0]).toBe(items[0][1].responses['5xx']);
			// responsesTextWithTooltip row 1, arg 2, 5xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[4][1]).toBe(items[0][1].responses.codes);
			// responsesTextWithTooltip row 1, arg 3, 5xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[4][2]).toBe('5');
			// responsesTextWithTooltip row 2, arg 1, 1xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[5][0]).toBe(items[1][1].responses['1xx']);
			// responsesTextWithTooltip row 2, arg 2, 1xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[5][1]).toBe(items[1][1].responses.codes);
			// responsesTextWithTooltip row 2, arg 3, 1xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[5][2]).toBe('1');
			// responsesTextWithTooltip row 2, arg 1, 2xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[6][0]).toBe(items[1][1].responses['2xx']);
			// responsesTextWithTooltip row 2, arg 2, 2xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[6][1]).toBe(items[1][1].responses.codes);
			// responsesTextWithTooltip row 2, arg 3, 2xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[6][2]).toBe('2');
			// responsesTextWithTooltip row 2, arg 1, 3xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[7][0]).toBe(items[1][1].responses['3xx']);
			// responsesTextWithTooltip row 2, arg 2, 3xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[7][1]).toBe(items[1][1].responses.codes);
			// responsesTextWithTooltip row 2, arg 3, 3xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[7][2]).toBe('3');
			// responsesTextWithTooltip row 2, arg 1, 4xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[8][0]).toBe(items[1][1].responses['4xx'] + items[1][1].discarded);
			// responsesTextWithTooltip row 2, arg 2, 4xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[8][1]).toEqual({
				'4xx': items[1][1].responses['4xx'],
				'499/444/408': items[1][1].discarded,
			});
			// responsesTextWithTooltip row 2, arg 3, 4xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[8][2]).toBe('4');
			// responsesTextWithTooltip row 2, arg 1, 5xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[9][0]).toBe(items[1][1].responses['5xx']);
			// responsesTextWithTooltip row 2, arg 2, 5xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[9][1]).toBe(items[1][1].responses.codes);
			// responsesTextWithTooltip row 2, arg 3, 5xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[9][2]).toBe('5');
			// responsesTextWithTooltip row 3, arg 1, 1xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[10][0]).toBe(items[2][1].responses['1xx']);
			// responsesTextWithTooltip row 3, arg 2, 1xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[10][1]).toBe(items[2][1].responses.codes);
			// responsesTextWithTooltip row 3, arg 3, 1xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[10][2]).toBe('1');
			// responsesTextWithTooltip row 3, arg 1, 2xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[11][0]).toBe(items[2][1].responses['2xx']);
			// responsesTextWithTooltip row 3, arg 2, 2xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[11][1]).toBe(items[2][1].responses.codes);
			// responsesTextWithTooltip row 3, arg 3, 2xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[11][2]).toBe('2');
			// responsesTextWithTooltip row 3, arg 1, 3xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[12][0]).toBe(items[2][1].responses['3xx']);
			// responsesTextWithTooltip row 3, arg 2, 3xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[12][1]).toBe(items[2][1].responses.codes);
			// responsesTextWithTooltip row 3, arg 3, 3xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[12][2]).toBe('3');
			// responsesTextWithTooltip row 3, arg 1, 4xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[13][0]).toBe(items[2][1].responses['4xx'] + items[2][1].discarded);
			// responsesTextWithTooltip row 3, arg 2, 4xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[13][1]).toEqual({
				...items[2][1].responses.codes,
				'499/444/408': items[2][1].discarded,
			});
			// responsesTextWithTooltip row 3, arg 3, 4xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[13][2]).toBe('4');
			// responsesTextWithTooltip row 3, arg 1, 5xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[14][0]).toBe(items[2][1].responses['5xx']);
			// responsesTextWithTooltip row 3, arg 2, 5xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[14][1]).toBe(items[2][1].responses.codes);
			// responsesTextWithTooltip row 3, arg 3, 5xx
			expect(tableUtils.responsesTextWithTooltip.mock.calls[14][2]).toBe('5');

			const HumanReadableBytesWrappers = wrapper.find(HumanReadableBytes);
			expect(HumanReadableBytesWrappers).toHaveLength(12);

			const rsExpectedValues = items.flatMap(([, obj]) => [
				obj.sent_s,
				obj.rcvd_s,
				obj.data.sent,
				obj.data.received,
			]);

			rsExpectedValues.forEach((value, i) => {
				expect(HumanReadableBytesWrappers.at(i).props().value).toBe(value);
			});

			tooltips.useTooltip.mockRestore();
			tableUtils.responsesTextWithTooltip.mockRestore();
			wrapper.unmount();
		});
	});
});
