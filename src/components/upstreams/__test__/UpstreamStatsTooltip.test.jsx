/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import UpstreamStatsTooltip from '../UpstreamStatsTooltip.jsx';
import styles from '../tooltip.css';

describe('<UpstreamStatsTooltip />', () => {
	it('no queue, no stats checking, keepalive is not a number', () => {
		const wrapper = shallow(
			<UpstreamStatsTooltip
				upstream={{
					name: 'test_upstream',
					stats: {
						up: 'up_num',
						failed: 'failed_num',
						draining: 'draining_num',
						down: 'down_num'
					},
					keepalive: 'not a number',
					zombies: 'zombies_number'
				}}
			/>
		);

		expect(wrapper.childAt(0).name(), 'child 1, html tag').to.be.equal('h5');
		expect(wrapper.childAt(0).prop('className'), 'child 1, className').to.be.equal(styles['h5']);
		expect(wrapper.childAt(0).text(), 'child 1, text').to.be.equal('Upstream: test_upstream');
		expect(wrapper.childAt(1).prop('className'), 'child 2, className').to.be.equal(styles['columns']);
		expect(wrapper.childAt(1).children(), 'columns length').to.have.lengthOf(2);

		let column = wrapper.childAt(1).childAt(0);

		expect(column.prop('className'), 'column 1, className').to.be.equal(styles['column']);
		expect(column.children(), 'column 1, children length').to.have.lengthOf(4);
		expect(
			column.childAt(0).childAt(0).prop('className'),
			'status up, tag className'
		).to.be.equal(`${ styles['status-tag'] } ${ styles['status_up'] }`);
		expect(column.childAt(0).text(), 'status up, text').to.be.equal(' Up: up_num');
		expect(
			column.childAt(1).childAt(0).prop('className'),
			'status up, tag className'
		).to.be.equal(`${ styles['status-tag'] } ${ styles['status_unhealthy'] }`);
		expect(column.childAt(1).text(), 'status up, text').to.be.equal(' Failed: failed_num');
		expect(
			column.childAt(2).childAt(0).prop('className'),
			'status up, tag className'
		).to.be.equal(`${ styles['status-tag'] } ${ styles['status_draining'] }`);
		expect(column.childAt(2).text(), 'status up, text').to.be.equal(' Drain: draining_num');
		expect(
			column.childAt(3).childAt(0).prop('className'),
			'status up, tag className'
		).to.be.equal(`${ styles['status-tag'] } ${ styles['status_down'] }`);
		expect(column.childAt(3).text(), 'status up, text').to.be.equal(' Down: down_num');

		column = wrapper.childAt(1).childAt(1);

		expect(column.children(), 'column 1, children length').to.have.lengthOf(1);
		expect(column.childAt(0).text(), 'zombies text').to.be.equal('Zombies: zombies_number');

		wrapper.unmount();
	});

	it('with queue, with stats checking, normal keepalive', () => {
		const wrapper = shallow(
			<UpstreamStatsTooltip
				upstream={{
					queue: {
						size: 'size_num',
						max_size: 'max_size_num',
						overflows: 'overflows_num'
					},
					stats: {
						checking: 'checking_num'
					},
					keepalive: 123
				}}
			/>
		);

		expect(wrapper.childAt(1).children(), 'columns length').to.have.lengthOf(3);

		let column = wrapper.childAt(1).childAt(0);

		expect(column.prop('className'), 'column 1, className').to.be.equal(styles['column']);
		expect(column.children(), 'column 1, children length').to.have.lengthOf(5);
		expect(
			column.childAt(4).childAt(0).prop('className'),
			'status checking, tag className'
		).to.be.equal(`${ styles['status-tag'] } ${ styles['status_checking'] }`);
		expect(column.childAt(4).text(), 'status checking, text').to.be.equal(' Checking: checking_num');

		column = wrapper.childAt(1).childAt(1);

		expect(column.prop('className'), 'column 1, className').to.be.equal(styles['column']);
		expect(column.childAt(0).text(), 'Q-Size: size_num/max_size_num');
		expect(column.childAt(0).text(), 'Overflows: overflows_num');

		column = wrapper.childAt(1).childAt(2);

		expect(column.children(), 'column 1, children length').to.have.lengthOf(2);
		expect(column.childAt(0).text(), 'keepalive text').to.be.equal('Keepalive: 123');

		wrapper.unmount();
	});
});
