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
import LanguageControl from '../LanguageControl.jsx';
import styles from '../language-control.css';

describe('<LanguageControl />', () => {
	it('value is english', () => {
		const wrapper = shallow(<LanguageControl />);

		expect(wrapper.find('select').prop('value')).toBe('en');
	});

	it('render()', () => {
		const wrapper = shallow(<LanguageControl />);

		expect(wrapper.prop('className')).toBe(styles.select);
		expect(wrapper.childAt(0).prop('value')).toBe('ru');
		expect(wrapper.childAt(1).prop('value')).toBe('en');
	});
});
