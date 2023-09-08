/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import NumberControl from '../NumberControl.jsx';
import styles from '../number-control.css';

describe('<NumberControl />', () => {
	const props = {
		value: 20000
	};

	it('constructor()', () => {
		const incSpy = jest.spyOn(NumberControl.prototype.inc, 'bind').mockClear();
		const decSpy = jest.spyOn(NumberControl.prototype.dec, 'bind').mockClear();
		const wrapper = shallow(<NumberControl {...props} />);

		// this.inc.bind called
		expect(incSpy).toHaveBeenCalled();
		// this.inc.bind call arg
		expect(incSpy.mock.calls[0][0] instanceof NumberControl).toBe(true);
		// this.dec.bind called
		expect(decSpy).toHaveBeenCalled();
		// this.dec.bind call arg
		expect(decSpy.mock.calls[0][0] instanceof NumberControl).toBe(true);

		decSpy.mockRestore();
		incSpy.mockRestore();
	});

	it('inc()', () => {
		const onChangeSpy = jest.fn();
		const wrapper = shallow(
			<NumberControl
				{...props}
				onChange={onChangeSpy}
			/>
		);
		const instance = wrapper.instance();

		instance.inc();

		// props.onChange called
		expect(onChangeSpy).toHaveReturnedTimes(1);
		// props.onChange call arg
		expect(onChangeSpy).toHaveBeenCalledWith(21000);
	});

	it('dec()', () => {
		const onChangeSpy = jest.fn();
		const wrapper = shallow(
			<NumberControl
				{...props}
				onChange={onChangeSpy}
			/>
		);
		const instance = wrapper.instance();

		instance.dec();

		// props.onChange called
		expect(onChangeSpy).toHaveBeenCalledTimes(1);
		// props.onChange call arg
		expect(onChangeSpy).toHaveBeenCalledWith(19000);
	});

	it('render()', () => {
		const wrapper = shallow(<NumberControl {...props} />);
		const instance = wrapper.instance();

		// wrapper className
		expect(wrapper.prop('className')).toBe(styles['number-control']);
		// dec control className
		expect(wrapper.childAt(0).prop('className')).toBe(styles.dec);
		expect(wrapper.childAt(0).prop('onClick')).toBeInstanceOf(Function);
		// dec control onClick name
		expect(wrapper.childAt(0).prop('onClick').name).toBe('bound dec');
		// value className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.value);
		// value text
		expect(wrapper.childAt(1).text()).toBe('20');
		// inc control className
		expect(wrapper.childAt(2).prop('className')).toBe(styles.inc);
		expect(wrapper.childAt(2).prop('onClick')).toBeInstanceOf(Function);
		// inc control onClick name
		expect(wrapper.childAt(2).prop('onClick').name).toBe('bound inc');
	});
});
