/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import ProgressBar from '../progressbar.jsx';
import styles from '../style.css';

describe('<ProgressBar />', () => {
	it('shouldComponentUpdate()', () => {
		const wrapper = shallow(<ProgressBar percentage={ 10 } />);
		const instance = wrapper.instance();

		expect(
			instance.shouldComponentUpdate({ percentage: 10 }),
			'percentage prop not changed'
		).to.be.false;
		expect(
			instance.shouldComponentUpdate({ percentage: 53 }),
			'percentage prop changed'
		).to.be.true;

		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(<ProgressBar percentage={ -1 } />);
		const instance = wrapper.instance();

		expect(
			wrapper.prop('className'),
			'[no danger, no warning] wrapper className'
		).to.be.equal(styles['progress-bar']);
		expect(
			wrapper.childAt(0).text(),
			'percentage text'
		).to.be.equal('<1 %');
		expect(
			wrapper.childAt(1).prop('className'),
			'fulfillment className'
		).to.be.equal(styles['fulfillment']);
		expect(
			wrapper.childAt(1).prop('style'),
			'fulfillment style'
		).to.be.deep.equal({
			width: '1%'
		});
		expect(
			wrapper.childAt(1).text(),
			'fulfillment text'
		).to.be.equal('<1 %');

		wrapper.setProps({
			percentage: 50,
			warning: true
		});

		expect(
			wrapper.prop('className'),
			'[warning] wrapper className'
		).to.be.equal(`${ styles['progress-bar'] } ${ styles['warning'] }`);
		expect(
			wrapper.childAt(0).text(),
			'percentage text'
		).to.be.equal('50 %');
		expect(
			wrapper.childAt(1).prop('style'),
			'fulfillment style'
		).to.be.deep.equal({
			width: '50%'
		});
		expect(
			wrapper.childAt(1).text(),
			'fulfillment text'
		).to.be.equal('50 %');

		wrapper.setProps({
			percentage: 99,
			danger: true
		});

		expect(
			wrapper.prop('className'),
			'[danger] wrapper className'
		).to.be.equal(`${ styles['progress-bar'] } ${ styles['danger'] }`);

		wrapper.unmount();
	});
});
