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
import ConnectionsTooltip from '../ConnectionsTooltip.jsx';
import utils from '../../../utils.js';

describe('<ConnectionsTooltip />', () => {
	it('peer.selected = false', () => {
		const wrapper = shallow(
			<ConnectionsTooltip
				peer={{}}
			/>
		);

		// children length
		expect(wrapper.children()).toHaveLength(1);
		// content
		expect(wrapper.childAt(0).text()).toBe('Last: unknown');
	});

	it('peer.selected = true', () => {
		jest.spyOn(utils, 'formatDate').mockClear().mockImplementation(() => 'formatted_date');
		jest.spyOn(utils, 'formatUptime').mockClear().mockImplementation(() => 'formatted_uptime');
		jest.spyOn(Date.prototype, 'getTime').mockClear().mockImplementation(() => 10);
		jest.spyOn(Date, 'parse').mockClear().mockImplementation(() => 8);

		const wrapper = shallow(
			<ConnectionsTooltip
				peer={{ selected: 'ts' }}
			/>
		);

		// children length
		expect(wrapper.children()).toHaveLength(1);
		// content blocks length
		expect(wrapper.childAt(0).children()).toHaveLength(2);
		// content blocks 1
		expect(wrapper.childAt(0).childAt(0).text()).toBe('Last: formatted_date');
		// formatDate called
		expect(utils.formatDate).toHaveBeenCalled();
		// formatDate call arg
		expect(utils.formatDate.mock.calls[0][0]).toBe('ts');
		// content blocks 2
		expect(wrapper.childAt(0).childAt(1).text()).toBe('(formatted_uptime ago)');
		// Date().getTime() called once
		expect(Date.prototype.getTime).toHaveBeenCalled();
		// Date.parse() called once
		expect(Date.parse).toHaveBeenCalled();
		// Date.parse call arg
		expect(Date.parse.mock.calls[0][0]).toBe('ts');
		// formatUptime called
		expect(utils.formatUptime).toHaveBeenCalled();
		// formatUptime call arg
		expect(utils.formatUptime.mock.calls[0][0]).toBe(2);

		utils.formatDate.mockRestore();
		utils.formatUptime.mockRestore();
		Date.prototype.getTime.mockRestore();
		Date.parse.mockRestore();
	});
});
