/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

/* eslint-env browser, mocha */
/* eslint import/first: "off" */
/* eslint no-param-reassign: "off" */

import React from 'react';
import { spy } from 'sinon';
import { shallow } from 'enzyme';
import Icon from './icon.jsx';
import styles from './style.css';

describe('<Icon />', () => {
	const className = 'test';
	const type = 'sun';
	const wrapper = shallow(
		<Icon
			className={ className }
			type={ type }
		/>
	);

	it('render()', () => {
		const rootEl = wrapper.getElement();

		assert(rootEl.nodeName === 'span', 'Should be a "span" html tag');
		assert(rootEl.children === undefined, 'Should not have any children');

		assert(wrapper.hasClass(className), 'Should have a class from "className" property');
		assert(wrapper.hasClass(styles[type]), 'Should have a class based on "type" property');
	});
});
