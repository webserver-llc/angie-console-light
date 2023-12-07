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
import { shallow, mount } from 'enzyme';
import Popup from '../popup.jsx';
import styles from '../style.css';

describe('<Popup />', () => {
	it('componentDidMount()', () => {
		const wrapper = shallow(<Popup />);
		const instance = wrapper.instance();

		instance.componentDidMount();

		// document.documentElement class
		expect(document.documentElement.classList.contains(styles['disable-scroll'])).toBe(true);
	});

	it('componentWillUnmount()', () => {
		const wrapper = shallow(<Popup />);
		const instance = wrapper.instance();

		// document.documentElement class
		expect(document.documentElement.classList.contains(styles['disable-scroll'])).toBe(true);

		instance.componentWillUnmount();

		// document.documentElement class
		expect(document.documentElement.classList.contains(styles['disable-scroll'])).toBe(false);
	});

	it('render()', () => {
		const wrapper = mount(
			<Popup className="test_class">
				<div>test child 1</div>
				<div>test child 2</div>
			</Popup>
		);
		const instance = wrapper.instance();
		const rootElement = instance.rootElementRef;

		expect(wrapper.hasClass('test_class')).toBe(true);
		// fader className
		expect(rootElement.className).toBe(styles.fader);
		// modal className
		expect(rootElement.children[0].className).toBe(styles.modal);

		const popup = rootElement.children[0].children[0];

		// popup className
		expect(popup.className).toBe(`${ styles.popup } test_class`);
		// popup children
		expect(popup.children).toHaveLength(2);
		// popup child 1
		expect(popup.children[0].innerHTML).toBe('test child 1');
		// popup child 2
		expect(popup.children[1].innerHTML).toBe('test child 2');

		wrapper.unmount();
	});
});
