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
				className={ className }
				type={ type }
			/>
		);
		const rootEl = wrapper.getElement();

		assert(rootEl.type === 'span', 'Should be a "span" html tag');
		assert(rootEl.props.children === undefined, 'Should not have any children');

		assert(wrapper.hasClass(className), 'Should have a class from "className" property');
		assert(wrapper.hasClass(styles[type]), 'Should have a class based on "type" property');

		// Without className prop
		wrapper = shallow(
			<Icon type={ type } />
		);

		assert(wrapper.first().prop('className') === styles[type], 'className without "className" prop provided');

		// Unknown icon type
		wrapper = shallow(
			<Icon type='there is no such an icon' />
		);

		assert(!wrapper.first().prop('className'), 'className when icon type does not exist');
	});
});
