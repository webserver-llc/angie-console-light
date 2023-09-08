/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import Icon from '../icon.jsx';
import styles from '../style.css';

describe('<Icon />', () => {
	it('return', () => {
		const className = 'test';
		const type = 'sun';
		// With className prop
		let wrapper = shallow(
			<Icon
				className={className}
				type={type}
			/>
		);
		const rootEl = wrapper.getElement();

		expect(rootEl.type === 'span').toBeTruthy();
		expect(rootEl.props.children === undefined).toBeTruthy();

		expect(wrapper.hasClass(className)).toBeTruthy();
		expect(wrapper.hasClass(styles[type])).toBeTruthy();

		// Without className prop
		wrapper = shallow(
			<Icon type={type} />
		);

		expect(wrapper.first().prop('className') === styles[type]).toBeTruthy();
	});
});
