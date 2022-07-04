/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
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
			}} />
		);
		const text = wrapper.text();

		expect(text, 'display pages.used').to.includes('Used memory pages: 98');
		expect(text, 'display pages.total').to.includes('Total pages: 100');

		wrapper.unmount();
	});

	it('<CacheStateTooltip />', () => {
		const wrapper = shallow(<CacheStateTooltip />);
		const rows = wrapper.find(`.${ styles['row'] }`);
		let icon;

		expect(wrapper.getElement().type, 'wrapper html tag').to.be.equal('div');
		expect(rows, 'rows length').to.have.lengthOf(2);
		icon = rows.at(0).find('Icon');
		expect(icon.hasClass(styles['icon']), 'row 1, icon className').to.be.true;
		expect(icon.prop('type'), 'row 1, icon type').to.be.equal('sun');
		icon = rows.at(1).find('Icon');
		expect(icon.hasClass(styles['icon']), 'row 2, icon className').to.be.true;
		expect(icon.prop('type'), 'row 2, icon type').to.be.equal('snowflake');

		wrapper.unmount();
	});
});