/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
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

			expect(wrapper.find(`.${ styles['header'] }`).length, 'element length').to.be.equal(1);
		});

		it('props.hash = "#"', () => {
			const wrapper = shallow(<Header hash="#" />);
			const link = wrapper.find('a');

			expect(link.length, 'link length').to.be.equal(1);
			expect(link.prop('className'), 'link className').to.be.equal(styles['logoactive']);
			expect(link.prop('href'), 'link href').to.be.equal('#');
		});

		it('other props.hash', () => {
			const wrapper = shallow(<Header />);
			const link = wrapper.find('a');

			expect(link.length, 'link length').to.be.equal(1);
			expect(link.prop('className'), 'link className').to.be.equal(styles['logo']);
			expect(link.prop('href'), 'link href').to.be.equal('#');
		});

		it('no props.navigation', () => {
			const wrapper = shallow(<Header />);

			expect(wrapper.find(Navigation).length, 'Navigation length').to.be.equal(0);
		});

		it('with props.navigation', () => {
			const wrapper = shallow(
				<Header
					navigation={ true }
					test_property="test"
				/>
			);
			const navigation = wrapper.find('Navigation_binded');

			expect(navigation.length, 'Navigation length').to.be.equal(1);
			expect(navigation.props(), 'Navigation props').to.be.deep.equal({
				children: [],
				navigation: true,
				test_property: 'test'
			});
		});
	});
});