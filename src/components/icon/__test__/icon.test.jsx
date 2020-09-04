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
		const wrapper = shallow(
			<Icon
				className={ className }
				type={ type }
			/>
		);
		const rootEl = wrapper.getElement();

		assert(rootEl.nodeName === 'span', 'Should be a "span" html tag');
		assert(rootEl.children === undefined, 'Should not have any children');

		assert(wrapper.hasClass(className), 'Should have a class from "className" property');
		assert(wrapper.hasClass(styles[type]), 'Should have a class based on "type" property');

		wrapper.unmount();
	});
});
