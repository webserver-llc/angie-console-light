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
import Loader, {
	defaultSN,
	graySN
} from '../loader.jsx';
import styles from '../style.css';

describe('<Loader />', () => {
	it('return', () => {
		const className = 'test';
		const wrapper = shallow(
			<Loader className={className} />
		);
		const rootEl = wrapper.getElement();

		expect(rootEl.type === 'div').toBeTruthy();
		expect(rootEl.props.children === undefined).toBeTruthy();

		expect(wrapper.hasClass(className)).toBeTruthy();

		wrapper.unmount();
	});

	it('gray = false', () => {
		const wrapper = shallow(
			<Loader gray={false} />
		);

		expect(wrapper.hasClass(defaultSN)).toBe(true);

		wrapper.unmount();
	});

	it('gray = true', () => {
		const wrapper = shallow(
			<Loader gray />
		);

		expect(wrapper.hasClass(graySN)).toBe(true);

		wrapper.unmount();
	});
});
