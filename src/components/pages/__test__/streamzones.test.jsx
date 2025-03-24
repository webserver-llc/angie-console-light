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
import { StreamZones } from '../streamzones.jsx';
import styles from '../../table/style.css';
import utils from '../../../utils';
import HumanReadableBytes from '#/components/human-readable-bytes/human-readable-bytes';

describe('<StreamZones Page />', () => {
	describe('render()', () => {
		it('return value', () => {
			const limit_conns = 'test_data_for_limit_conns';
			const wrapper = shallow(<StreamZones data={{ server_zones: [] }} />);

			// table container
			expect(wrapper.find(`.${ styles.table }`).length).toBe(1);
			// LimitConn length
			expect(wrapper.find('LimitConn').length).toBe(0);

			wrapper.setProps({ data: {
				server_zones: [],
				limit_conns
			} });

			// LimitConn length
			expect(wrapper.find('LimitConn').length).toBe(1);
			// LimitConn "data" prop
			expect(wrapper.find('LimitConn').prop('data')).toBe(limit_conns);

			wrapper.unmount();
		});

		it('zones row', () => {
			jest.spyOn(utils, 'formatReadableBytes').mockClear().mockImplementation(a => a);

			const server_zones = [
				['test', {
					processing: 100,
					connections: 23,
					zone_conn_s: 34,
					sessions: {
						'2xx': 83,
						'4xx': 2,
						'5xx': 1,
						total: 86
					},
					'4xxChanged': false,
					'5xxChanged': false,
					sent_s: 333,
					rcvd_s: 0,
					sent: 950,
					received: 3
				}], ['test_2', {
					sessions: {},
					'4xxChanged': true,
					'5xxChanged': false
				}], ['test_3', {
					sessions: {},
					'4xxChanged': false,
					'5xxChanged': true
				}]
			];
			const wrapper = shallow(<StreamZones data={{ server_zones }} />);
			const rows = wrapper.find('tbody tr');
			let cells = rows.at(0).find('td');

			// row 1, cells length
			expect(cells.length).toBe(15);

			let cell = cells.at(0);

			// row 1, cell 1, className
			expect(cell.prop('className')).toBe(`${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }`);
			// row 1, cell 1, text
			expect(cell.text()).toBe('test');
			// row 1, cell 2, text
			expect(cells.at(1).text()).toBe('100');
			// row 1, cell 3, text
			expect(cells.at(2).text()).toBe('23');
			cell = cells.at(3);
			// row 1, cell 4, className
			expect(cell.prop('className')).toBe(styles.bdr);
			// row 1, cell 4, text
			expect(cell.text()).toBe('34');
			// row 1, cell 5, text
			expect(cells.at(4).text()).toBe('83');
			cell = cells.at(5);
			// row 1, cell 6, className
			expect(cell.prop('className')).toBe(styles.flash);
			// row 1, cell 6, text
			expect(cell.text()).toBe('2');
			cell = cells.at(6);
			// row 1, cell 7, className
			expect(cell.prop('className')).toBe(styles.flash);
			// row 1, cell 7, text
			expect(cell.text()).toBe('1');
			cell = cells.at(7);
			// row 1, cell 8, className
			expect(cell.prop('className')).toBe(styles.bdr);
			// row 1, cell 8, text
			expect(cell.text()).toBe('86');

			const row = 0;
			// row 1, cell 9
			cell = cells.at(8);
			expect(cell.prop('className')).toBe(styles.px60);
			expect(cell.find(HumanReadableBytes).props().value).toBe(server_zones[row][1].sent_s);
			// row 1, cell 10
			cell = cells.at(9);
			expect(cell.prop('className')).toBe(styles.px60);
			expect(cell.find(HumanReadableBytes).props().value).toBe(server_zones[row][1].rcvd_s);
			// row 1, cell 11
			cell = cells.at(10);
			expect(cell.prop('className')).toBe(styles.px60);
			expect(cell.find(HumanReadableBytes).props().value).toBe(server_zones[row][1].sent);
			// row 1, cell 12
			cell = cells.at(11);
			expect(cell.prop('className')).toBe(`${ styles.px60 } ${ styles.bdr }`);
			expect(cell.find(HumanReadableBytes).props().value).toBe(server_zones[row][1].received);

			// TODO: Add tests for SSL stat cells

			cells = rows.at(1).find('td');
			// row 1, cell 6, className
			expect(cells.at(5).prop('className')).toBe(`${ styles.flash } ${ styles['red-flash'] }`);

			cells = rows.at(2).find('td');
			// row 1, cell 7, className
			expect(cells.at(6).prop('className')).toBe(`${ styles.flash } ${ styles['red-flash'] }`);

			wrapper.unmount();
			utils.formatReadableBytes.mockRestore();
		});
	});
});
