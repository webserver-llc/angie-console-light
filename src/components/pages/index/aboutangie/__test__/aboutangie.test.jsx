/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import {
	AboutAngieTooltip,
	AboutAngie
} from '../aboutangie.jsx';
import styles from '../style.css';
import tooltipStyles from '../../../../tooltip/style.css';
import utils from '../../../../../utils.js';
import tooltips from '../../../../../tooltips/index.jsx';
import { apiUtils } from '../../../../../api/index.js';
import { docs } from '../utils.js';

describe('<AboutAngieTooltip IndexPage />', () => {
	describe('this.renderLinkToDocs()', () => {
		it('nothing render', () => {
			const data = {
				angie: {
					address: 'localhost',
					load_time: 1599571720025
				}
			};
			const wrapper = shallow(
				<AboutAngie
					data={data}
					className="test"
				/>
			);
			const instance = wrapper.instance();
			expect(instance.renderLinkToDocs()).toBeNull();
			wrapper.unmount();
		});

		it('only version', () => {
			const data = {
				angie: {
					version: '0.0.1',
					address: 'localhost',
					load_time: 1599571720025
				}
			};
			const wrapper = shallow(
				<AboutAngie
					data={data}
					className="test"
				/>
			);
			const instance = wrapper.instance();
			const link = shallow(instance.renderLinkToDocs());

			expect(link.prop('href')).toBe(docs.default);
			expect(link.text()).toBe(data.angie.version);

			wrapper.unmount();
		});

		it('build and version', () => {
			jest.spyOn(apiUtils, 'isAngiePro').mockClear().mockImplementation(() => true);

			const data = {
				angie: {
					build: 'PRO',
					version: '0.0.1',
					address: 'localhost',
					load_time: 1599571720025
				}
			};
			const wrapper = shallow(
				<AboutAngie
					data={data}
					className="test"
				/>
			);
			const instance = wrapper.instance();
			const link = shallow(instance.renderLinkToDocs());

			expect(link.prop('href')).toBe(docs.pro);
			expect(link.text()).toBe(`${data.angie.version} ${data.angie.build}`);

			wrapper.unmount();
			apiUtils.isAngiePro.mockRestore();
		});
	});

	it('returning component', () => {
		jest.spyOn(utils, 'formatDate').mockClear().mockImplementation(() => 'test_formatDate_result');

		const data = {
			angie: {
				load_timestamp: 1599571723125,
				generation: 11
			}
		};
		const wrapper = shallow(
			<AboutAngieTooltip
				data={data}
			/>
		);
		const children = wrapper.children();

		// child length
		expect(children).toHaveLength(1);
		// child 1 className
		expect(children.at(0).prop('className')).toBe(tooltipStyles.row);
		// child 1 text
		expect(children.at(0).text()).toBe('Reloads: 11');

		utils.formatDate.mockRestore();
		wrapper.unmount();
	});
});

describe('<AboutAngie IndexPage />', () => {
	it('render()', () => {
		jest.spyOn(Date, 'now').mockClear().mockImplementation(() => 1599571723125);
		jest.spyOn(Date, 'parse').mockClear().mockImplementation(a => a);
		jest.spyOn(utils, 'formatUptime').mockClear().mockImplementation(() => 'test_formatUptime_result');
		jest.spyOn(apiUtils, 'isAngiePro').mockClear().mockImplementation(() => true);
		jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({
			prop_from_useTooltip: true
		}));

		const data = {
			angie: {
				build: 'PRO',
				version: '0.0.1',
				address: 'localhost',
				load_time: 1599571720025,
				config_files: {
					'/etc/angie.conf': 'foo',
					'/etc/types.conf': 'bar'
				}
			}
		};
		const wrapper = shallow(
			<AboutAngie
				data={data}
				className="test"
			/>
		);

		// IndexBox className
		expect(wrapper.find('IndexBox').prop('className')).toBe('test');

		const link = wrapper.find(`a.${ styles.release }`);

		// link length
		expect(link).toHaveLength(1);
		// link href
		expect(link.prop('href')).toBe(docs.pro);
		// link target
		expect(link.prop('target')).toBe('_blank');
		// link text
		expect(link.text()).toBe('0.0.1 PRO');

		const table = wrapper.find('table');

		expect(wrapper.find('a#config-files').exists()).toBeTrue();
		// table length
		expect(table).toHaveLength(1);
		// table className
		expect(table.prop('className')).toBe(styles.table);
		// table, row 1, cell 2 (angie address
		expect(table.childAt(0).childAt(1).text()).toBe('localhost');

		const tooltip = table.childAt(1).childAt(1).childAt(0);

		// tooltip className
		expect(tooltip.prop('className')).toBe(styles.uptime);
		// tooltip prop from useTooltip
		expect(tooltip.prop('prop_from_useTooltip')).toBe(true);
		// useTooltip called once
		expect(tooltips.useTooltip).toHaveBeenCalledTimes(1);
		// useTooltip arg
		expect(tooltips.useTooltip.mock.calls[0][0].type.displayName).toBe('AboutAngieTooltip');
		// useTooltip arg prop
		expect(tooltips.useTooltip.mock.calls[0][0].props.data).toEqual(data);
		// tooltip text
		expect(tooltip.text()).toBe('test_formatUptime_result');
		// formatUptime called once
		expect(Date.parse).toHaveBeenCalledTimes(1);
		// formatUptime call 1, arg
		expect(Date.parse.mock.calls[0][0]).toBe(1599571720025);
		// formatUptime called once
		expect(utils.formatUptime).toHaveBeenCalledTimes(1);
		// formatUptime arg
		expect(utils.formatUptime.mock.calls[0][0]).toBe(3100);

		Date.now.mockRestore();
		Date.parse.mockRestore();
		apiUtils.isAngiePro.mockRestore();
		utils.formatUptime.mockRestore();
		tooltips.useTooltip.mockRestore();
		wrapper.unmount();
	});
});
