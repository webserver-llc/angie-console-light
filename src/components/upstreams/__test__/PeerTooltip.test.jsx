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
import PeerTooltip from '../PeerTooltip.jsx';
import utils from '../../../utils.js';
import styles from '../tooltip.css';

describe('<PeerTooltip />', () => {
	beforeAll(() => {
		jest.spyOn(utils, 'formatDate').mockClear().mockImplementation(() => 'formatted_date');
		jest.spyOn(utils, 'formatUptime').mockClear().mockImplementation(() => 'formatted_uptime');
	});

	beforeEach(() => {
		utils.formatDate.mockClear();
		utils.formatUptime.mockClear();
	});

	afterAll(() => {
		utils.formatDate.mockRestore();
		utils.formatUptime.mockRestore();
	});

	it('state = unavail, health_status = null, with name, backup, isHttp and downstart', () => {
		const wrapper = shallow(
			<PeerTooltip
				peer={{
					state: 'unavail',
					name: 'test_1',
					backup: true,
					server: 'test_server',
					downtime: 'downtime_ts',
					isHttp: true,
					downstart: 'downstart_ts'
				}}
			/>
		);

		// content length
		expect(wrapper.children()).toHaveLength(6);
		// peer name, className
		expect(wrapper.childAt(0).prop('className')).toBe(styles.row);
		// peer name, text
		expect(wrapper.childAt(0).text()).toBe('test_1');
		// peer server, html tag
		expect(wrapper.childAt(1).name()).toBe('h5');
		// peer server, className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.h5);
		// peer server, text
		expect(wrapper.childAt(1).text()).toBe('b test_server');
		// peer state wrap, className
		expect(wrapper.childAt(2).prop('className')).toBe(styles.row);
		// peer state, className
		expect(wrapper.childAt(2).childAt(0).childAt(0).prop('className')).toBe(styles.status_unavail);
		// peer state, text
		expect(wrapper.childAt(2).childAt(0).text()).toBe('Failed (Passive health check failed)');
		// peer type, className
		expect(wrapper.childAt(3).prop('className')).toBe(styles.row);
		// peer type, text
		expect(wrapper.childAt(3).text()).toBe('Type: backup');
		// peer downtime, className
		expect(wrapper.childAt(4).prop('className')).toBe(styles.row);
		// peer downtime, text
		expect(wrapper.childAt(4).text()).toBe('Total downtime: formatted_uptime');
		// formatUptime called once
		expect(utils.formatUptime).toHaveBeenCalled();
		// formatUptime call arg
		expect(utils.formatUptime.mock.calls[0][0]).toBe('downtime_ts');
		// peer downstart, className
		expect(wrapper.childAt(5).prop('className')).toBe(styles.row);
		// peer downstart, text
		expect(wrapper.childAt(5).text()).toBe('Down since: formatted_date');
		// formatDate called once
		expect(utils.formatDate).toHaveBeenCalled();
		// formatDate call arg
		expect(utils.formatDate.mock.calls[0][0]).toBe('downstart_ts');

		wrapper.unmount();
	});

	it('state = unhealthy, health_status = true, no name, not backup, isHttp, no downstart', () => {
		const wrapper = shallow(
			<PeerTooltip
				peer={{
					state: 'unhealthy',
					backup: false,
					server: 'test_server',
					downtime: 'downtime_ts',
					isHttp: true
				}}
			/>
		);

		// content length
		expect(wrapper.children()).toHaveLength(3);
		// peer server, html tag
		expect(wrapper.childAt(0).name()).toBe('h5');
		// peer server, className
		expect(wrapper.childAt(0).prop('className')).toBe(styles.h5);
		// peer server, text
		expect(wrapper.childAt(0).text()).toBe('test_server');
		// peer state wrap, className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.row);
		// peer state, className
		expect(wrapper.childAt(1).childAt(0).childAt(0).prop('className')).toBe(styles.status_unavail);
		// peer state, text
		expect(wrapper.childAt(1).childAt(0).text()).toBe('Failed (Active health check failed)');
		// formatDate not called
		expect(utils.formatDate).not.toHaveBeenCalled();

		wrapper.unmount();
	});

	it('state = up, health_status = false, no name, not backup, not isHttp, no downstart', () => {
		const wrapper = shallow(
			<PeerTooltip
				peer={{
					state: 'up',
					backup: false,
					server: 'test_server',
					downtime: 'downtime_ts',
					isHttp: false
				}}
			/>
		);

		// content length
		expect(wrapper.children()).toHaveLength(3);
		// peer state wrap, className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.row);
		// peer state, className
		expect(wrapper.childAt(1).childAt(0).prop('className')).toBe(styles.status_up);
		// peer state, text
		expect(wrapper.childAt(1).childAt(0).text()).toBe('Up');
		// formatDate not called
		expect(utils.formatDate).not.toHaveBeenCalled();

		wrapper.unmount();
	});
});
