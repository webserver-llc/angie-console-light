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

		// child 1, html tag
		expect(wrapper.childAt(0).name()).toBe('h5');
		// child 1, className
		expect(wrapper.childAt(0).prop('className')).toBe(styles.h5);
		// child 1, text
		expect(wrapper.childAt(0).text()).toBe('Upstream: test_upstream');
		// child 2, className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.columns);
		// columns length
		expect(wrapper.childAt(1).children()).toHaveLength(2);

		let column = wrapper.childAt(1).childAt(0);

		// column 1, className
		expect(column.prop('className')).toBe(styles.column);
		// column 1, children length
		expect(column.children()).toHaveLength(4);
		// status up, tag className
		expect(column.childAt(0).childAt(0).prop('className')).toBe(`${ styles['status-tag'] } ${ styles.status_up }`);
		// status up, text
		expect(column.childAt(0).text()).toBe(' Up: up_num');
		// status up, tag className
		expect(column.childAt(1).childAt(0).prop('className')).toBe(`${ styles['status-tag'] } ${ styles.status_unhealthy }`);
		// status up, text
		expect(column.childAt(1).text()).toBe(' Failed: failed_num');
		// status up, tag className
		expect(column.childAt(2).childAt(0).prop('className')).toBe(`${ styles['status-tag'] } ${ styles.status_draining }`);
		// status up, text
		expect(column.childAt(2).text()).toBe(' Drain: draining_num');
		// status up, tag className
		expect(column.childAt(3).childAt(0).prop('className')).toBe(`${ styles['status-tag'] } ${ styles.status_down }`);
		// status up, text
		expect(column.childAt(3).text()).toBe(' Down: down_num');

		column = wrapper.childAt(1).childAt(1);

		// column 1, children length
		expect(column.children()).toHaveLength(1);
		// zombies text
		expect(column.childAt(0).text()).toBe('Zombies: zombies_number');

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

		// columns length
		expect(wrapper.childAt(1).children()).toHaveLength(3);

		let column = wrapper.childAt(1).childAt(0);

		// column 1, className
		expect(column.prop('className')).toBe(styles.column);
		// column 1, children length
		expect(column.children()).toHaveLength(5);
		// status checking, tag className
		expect(column.childAt(4).childAt(0).prop('className')).toBe(`${ styles['status-tag'] } ${ styles.status_checking }`);
		// status checking, text
		expect(column.childAt(4).text()).toBe(' Checking: checking_num');

		column = wrapper.childAt(1).childAt(1);

		// column 1, className
		expect(column.prop('className')).toBe(styles.column);
		expect(column.childAt(0).text()).toBe('Q-Size: size_num/max_size_num');
		expect(column.childAt(1).text()).toBe('Overflows: overflows_num ');

		column = wrapper.childAt(1).childAt(2);

		// column 1, children length
		expect(column.children()).toHaveLength(2);
		// keepalive text
		expect(column.childAt(0).text()).toBe('Keepalive: 123');

		wrapper.unmount();
	});
});
