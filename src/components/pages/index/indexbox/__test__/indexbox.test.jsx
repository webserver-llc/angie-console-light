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
			<IndexBox { ...props } />
		);

		expect(wrapper.first().prop('className'), 'root className').to.be.equal(styles['box']);

		expect(wrapper.children(), '[no title, no children] children length').to.have.lengthOf(0);

		props.className = 'test_class';
		props.title = 'Test title';
		props.href = '#test';
		wrapper.setProps(props);

		expect(wrapper.hasClass(styles['box'], '[with className prop] root className')).to.be.true;
		expect(wrapper.hasClass('test_class'), '[with className prop] root className from props').to.be.true;

		expect(wrapper.children(), '[no title, no children] children length').to.have.lengthOf(1);
		expect(wrapper.childAt(0).type(), '[with title] title tag').to.be.equal('a');
		expect(wrapper.childAt(0).prop('className'), '[with title] title className').to.be.equal(styles['header']);
		expect(wrapper.childAt(0).prop('href'), '[with title] title href').to.be.equal('#test');
		expect(wrapper.childAt(0).prop('title'), '[with title] title title').to.be.equal('Test title');
		expect(
			wrapper.childAt(0).children(),
			'[with title, no status] title children length'
		).to.have.lengthOf(1);
		expect(
			wrapper.childAt(0).childAt(0).text(),
			'[with title, no status] title text'
		).to.be.equal('Test title');

		props.status = 'danger';
		wrapper.setProps(props);

		expect(
			wrapper.childAt(0).children(),
			'[with title, with status] title children length'
		).to.have.lengthOf(2);
		expect(
			wrapper.childAt(0).childAt(1).name(),
			'[with title, with status] title icon'
		).to.be.equal('Icon');
		expect(
			wrapper.childAt(0).childAt(1).prop('type'),
			'[with title, with status] title icon type'
		).to.be.equal('danger');
		expect(
			wrapper.childAt(0).childAt(1).prop('className'),
			'[with title, with status] title icon className'
		).to.be.equal(styles['status']);

		props.children = 'test_children';
		wrapper.setProps(props);

		expect(wrapper.children(), '[with title, with children] children length').to.have.lengthOf(2);
		expect(
			wrapper.childAt(1).text(),
			'[with title, with children] passed children'
		).to.be.equal('test_children');

		wrapper.unmount();
	});
});
