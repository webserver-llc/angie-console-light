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
		const wrapper = shallow(<ProgressBar percentage={10} />);
		const instance = wrapper.instance();

		// percentage prop not changed
		expect(instance.shouldComponentUpdate({ percentage: 10 })).toBe(false);
		// percentage prop changed
		expect(instance.shouldComponentUpdate({ percentage: 53 })).toBe(true);

		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(<ProgressBar percentage={-1} />);
		const instance = wrapper.instance();

		// [no danger, no warning] wrapper className
		expect(wrapper.prop('className')).toBe(styles['progress-bar']);
		// percentage text
		expect(wrapper.childAt(0).text()).toBe('<1 %');
		// fulfillment className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.fulfillment);
		// fulfillment style
		expect(wrapper.childAt(1).prop('style')).toEqual({
			width: '1%'
		});
		// fulfillment text
		expect(wrapper.childAt(1).text()).toBe('<1 %');

		wrapper.setProps({
			percentage: 50,
			warning: true
		});

		// [warning] wrapper className
		expect(wrapper.prop('className')).toBe(`${ styles['progress-bar'] } ${ styles.warning }`);
		// percentage text
		expect(wrapper.childAt(0).text()).toBe('50 %');
		// fulfillment style
		expect(wrapper.childAt(1).prop('style')).toEqual({
			width: '50%'
		});
		// fulfillment text
		expect(wrapper.childAt(1).text()).toBe('50 %');

		wrapper.setProps({
			percentage: 99,
			danger: true
		});

		// [danger] wrapper className
		expect(wrapper.prop('className')).toBe(`${ styles['progress-bar'] } ${ styles.danger }`);

		wrapper.unmount();
	});
});
