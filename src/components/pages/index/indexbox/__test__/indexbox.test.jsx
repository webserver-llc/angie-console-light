/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import IndexBox from '../indexbox.jsx';
import styles from '../styles.css';

describe('<IndexBox />', () => {
	it('render()', () => {
		const props = {};
		const wrapper = shallow(
			<IndexBox {...props} />
		);

		// root className
		expect(wrapper.first().prop('className')).toBe(styles.box);

		// [no title, no children] children length
		expect(wrapper.children()).toHaveLength(0);

		props.className = 'test_class';
		props.title = 'Test title';
		props.href = '#test';
		wrapper.setProps(props);

		expect(wrapper.hasClass(styles.box, '[with className prop] root className')).toBe(true);
		// [with className prop] root className from props
		expect(wrapper.hasClass('test_class')).toBe(true);

		// [no title, no children] children length
		expect(wrapper.children()).toHaveLength(1);
		// [with title] title tag
		expect(wrapper.childAt(0).type()).toBe('a');
		// [with title] title className
		expect(wrapper.childAt(0).prop('className')).toBe(styles.header);
		// [with title] title href
		expect(wrapper.childAt(0).prop('href')).toBe('#test');
		// [with title] title title
		expect(wrapper.childAt(0).prop('title')).toBe('Test title');
		// [with title, no status] title children length
		expect(wrapper.childAt(0).children()).toHaveLength(1);
		// [with title, no status] title text
		expect(wrapper.childAt(0).childAt(0).text()).toBe('Test title');

		props.status = 'danger';
		wrapper.setProps(props);

		// [with title, with status] title children length
		expect(wrapper.childAt(0).children()).toHaveLength(2);
		// [with title, with status] title icon
		expect(wrapper.childAt(0).childAt(1).name()).toBe('Icon');
		// [with title, with status] title icon type
		expect(wrapper.childAt(0).childAt(1).prop('type')).toBe('danger');
		// [with title, with status] title icon className
		expect(wrapper.childAt(0).childAt(1).prop('className')).toBe(styles.status);

		props.children = 'test_children';
		wrapper.setProps(props);

		// [with title, with children] children length
		expect(wrapper.children()).toHaveLength(2);
		// [with title, with children] passed children
		expect(wrapper.childAt(1).text()).toBe('test_children');

		wrapper.unmount();
	});
});
