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
import { mount } from 'enzyme';
import CollapsibleList from '../collapsible-list';

describe('CollapsibleList', () => {
	it('click on collapsible element', () => {
		const wrapper = mount(
			<CollapsibleList
				overflowWhenOpen="visible"
				trigger="foo"
				transitionTime={10}
			>
				bar
			</CollapsibleList>);

		expect(wrapper.find('.triggerClose').exists()).toBeTrue();
		wrapper.find('.triggerClose').simulate('click');
		expect(wrapper.find('.triggerOpen').exists()).toBeTrue();
	});
});
