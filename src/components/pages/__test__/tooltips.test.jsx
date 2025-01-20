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
import {
	SharedZoneTooltip,
	CacheStateTooltip
} from '../tooltips.jsx';
import styles from '../../tooltip/style.css';

describe('Tooltips', () => {
	it('<SharedZoneTooltip />', () => {
		const wrapper = shallow(
			<SharedZoneTooltip zone={{
				pages: { used: 98, total: 100 }
			}}
			/>
		);
		const text = wrapper.text();

		expect(text).toContain('Used memory pages: 98 Total memory pages: 100 Memory usage = Used memory pages / Total memory pages');

		wrapper.unmount();
	});

	it('<CacheStateTooltip />', () => {
		const wrapper = shallow(<CacheStateTooltip />);
		const rows = wrapper.find(`.${styles.row}`);
		let icon;

		// wrapper html tag
		expect(wrapper.getElement().type).toBe('div');
		// rows length
		expect(rows).toHaveLength(2);
		icon = rows.at(0).find('Icon');
		// row 1, icon className
		expect(icon.hasClass(styles.icon)).toBe(true);
		// row 1, icon type
		expect(icon.prop('type')).toBe('sun');
		icon = rows.at(1).find('Icon');
		// row 2, icon className
		expect(icon.hasClass(styles.icon)).toBe(true);
		// row 2, icon type
		expect(icon.prop('type')).toBe('snowflake');

		wrapper.unmount();
	});
});
