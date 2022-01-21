/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import { StreamZones } from '../streamzones.jsx';
import styles from '../../table/style.css';
import utils from '../../../utils';

describe('<StreamZones Page />', () => {
	describe('render()', () => {
		it('return value', () => {
			const limit_conns = 'test_data_for_limit_conns';
			const wrapper = shallow(<StreamZones data={{ server_zones: [] }} />);

			expect(wrapper.find(`.${ styles['table'] }`).length, 'table container').to.be.equal(1);
			expect(wrapper.find('LimitConn').length, 'LimitConn length').to.be.equal(0);

			wrapper.setProps({ data: {
				server_zones: [],
				limit_conns
			} });

			expect(wrapper.find('LimitConn').length, 'LimitConn length').to.be.equal(1);
			expect(wrapper.find('LimitConn').prop('data'), 'LimitConn "data" prop').to.be.equal(limit_conns);

			wrapper.unmount();
		});

		it('zones row', () => {
			stub(utils, 'formatReadableBytes').callsFake(a => a);

			const server_zones = new Map([
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
			]);
			const wrapper = shallow(<StreamZones data={{ server_zones }} />);
			const rows = wrapper.find('tbody tr');
			let cells = rows.at(0).find('td');

			expect(cells.length, 'row 1, cells length').to.be.equal(12);

			let cell = cells.at(0);

			expect(cell.prop('className'), 'row 1, cell 1, className').to.be.equal(
				`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
			);
			expect(cell.text(), 'row 1, cell 1, text').to.be.equal('test');
			expect(cells.at(1).text(), 'row 1, cell 2, text').to.be.equal('100');
			expect(cells.at(2).text(), 'row 1, cell 3, text').to.be.equal('23');
			cell = cells.at(3);
			expect(cell.prop('className'), 'row 1, cell 4, className').to.be.equal(
				styles['bdr']
			);
			expect(cell.text(), 'row 1, cell 4, text').to.be.equal('34');
			expect(cells.at(4).text(), 'row 1, cell 5, text').to.be.equal('83');
			cell = cells.at(5);
			expect(cell.prop('className'), 'row 1, cell 6, className').to.be.equal(
				styles['flash']
			);
			expect(cell.text(), 'row 1, cell 6, text').to.be.equal('2');
			cell = cells.at(6);
			expect(cell.prop('className'), 'row 1, cell 7, className').to.be.equal(
				styles['flash']
			);
			expect(cell.text(), 'row 1, cell 7, text').to.be.equal('1');
			cell = cells.at(7);
			expect(cell.prop('className'), 'row 1, cell 8, className').to.be.equal(
				styles['bdr']
			);
			expect(cell.text(), 'row 1, cell 8, text').to.be.equal('86');
			cell = cells.at(8);
			expect(cell.prop('className'), 'row 1, cell 9, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 1, cell 9, text').to.be.equal('333');
			cell = cells.at(9);
			expect(cell.prop('className'), 'row 1, cell 10, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 1, cell 10, text').to.be.equal('0');
			cell = cells.at(10);
			expect(cell.prop('className'), 'row 1, cell 11, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 1, cell 11, text').to.be.equal('950');
			cell = cells.at(11);
			expect(cell.prop('className'), 'row 1, cell 12, className').to.be.equal(
				styles['px60']
			);
			expect(cell.text(), 'row 1, cell 12, text').to.be.equal('3');

			cells = rows.at(1).find('td');
			expect(cells.at(5).prop('className'), 'row 1, cell 6, className').to.be.equal(
				`${ styles['flash'] } ${ styles['red-flash'] }`
			);

			cells = rows.at(2).find('td');
			expect(cells.at(6).prop('className'), 'row 1, cell 7, className').to.be.equal(
				`${ styles['flash'] } ${ styles['red-flash'] }`
			);

			wrapper.unmount();
			utils.formatReadableBytes.restore();
		});
	});
});
