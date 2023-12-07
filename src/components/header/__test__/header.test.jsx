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
import Header from '../header.jsx';
import Navigation from '../navigation.jsx';
import styles from '../style.css';
import mainStyles from '../../../style.css';

describe('<Header />', () => {
	describe('render()', () => {
		it('root element', () => {
			const wrapper = shallow(<Header />);

			// element length
			expect(wrapper.find(`.${ styles.header }`).length).toBe(1);
		});

		it('props.hash = "#"', () => {
			const wrapper = shallow(<Header hash="#" />);
			const link = wrapper.find('a');

			// link length
			expect(link.length).toBe(1);
			// link className
			expect(link.prop('className')).toBe(styles.logoactive);
			// link href
			expect(link.prop('href')).toBe('#');
		});

		it('other props.hash', () => {
			const wrapper = shallow(<Header />);
			const link = wrapper.find('a');

			// link length
			expect(link.length).toBe(1);
			// link className
			expect(link.prop('className')).toBe(styles.logo);
			// link href
			expect(link.prop('href')).toBe('#');
		});

		it('no props.navigation', () => {
			const wrapper = shallow(<Header />);

			// Navigation length
			expect(wrapper.find(Navigation).length).toBe(0);
		});

		it('with props.navigation', () => {
			const wrapper = shallow(
				<Header
					navigation
					test_property="test"
				/>
			);
			const navigation = wrapper.find('Navigation_binded');

			// Navigation length
			expect(navigation.length).toBe(1);
			// Navigation props
			expect(navigation.props()).toEqual({
				children: [],
				navigation: true,
				test_property: 'test'
			});
		});
	});
});
