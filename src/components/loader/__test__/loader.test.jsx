/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import Loader, {
	defaultSN,
	graySN
} from '../loader.jsx';
import styles from '../style.css';

describe('<Loader />', () => {
	it('return', () => {
		const className = 'test';
		const wrapper = shallow(
			<Loader className={ className } />
		);
		const rootEl = wrapper.getElement();

		assert(rootEl.type === 'div', 'Should be a "div" html tag');
		assert(rootEl.props.children === undefined, 'Should not have any children');

		assert(wrapper.hasClass(className), 'Should have a class from "className" property');

		wrapper.unmount();
	});

	it('gray = false', () => {
		const wrapper = shallow(
			<Loader gray={ false } />
		);

		expect(wrapper.hasClass(defaultSN)).to.be.true;

		wrapper.unmount();
	});

	it('gray = true', () => {
		const wrapper = shallow(
			<Loader gray={ true } />
		);

		expect(wrapper.hasClass(graySN)).to.be.true;

		wrapper.unmount();
	});
});
