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
