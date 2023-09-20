import React from 'react';
import { shallow } from 'enzyme';
import Editor from '../editor';

describe('Editor', () => {
	it('render()', () => {
		const wrapper = shallow(<Editor />);
		expect(wrapper.hasClass('Editor')).toBeTrue();
	});
});
