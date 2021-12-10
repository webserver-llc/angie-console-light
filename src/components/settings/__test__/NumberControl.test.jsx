/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import NumberControl from '../NumberControl.jsx';
import styles from '../number-control.css';

describe('<NumberControl />', () => {
	const props = {
		value: 20000
	};

	it('constructor()', () => {
		const incSpy = spy(NumberControl.prototype.inc, 'bind');
		const decSpy = spy(NumberControl.prototype.dec, 'bind');
		const wrapper = shallow(<NumberControl { ...props } />);

		expect(incSpy.calledOnce, 'this.inc.bind called').to.be.true;
		expect(incSpy.args[0][0] instanceof NumberControl, 'this.inc.bind call arg').to.be.true;
		expect(decSpy.calledOnce, 'this.dec.bind called').to.be.true;
		expect(decSpy.args[0][0] instanceof NumberControl, 'this.dec.bind call arg').to.be.true;

		decSpy.restore();
		incSpy.restore();
	});

	it('inc()', () => {
		const onChangeSpy = spy();
		const wrapper = shallow(
			<NumberControl
				{ ...props }
				onChange={ onChangeSpy }
			/>
		);
		const instance = wrapper.instance();

		instance.inc();

		expect(onChangeSpy.calledOnce, 'props.onChange called').to.be.true;
		expect(onChangeSpy.calledWith(21000), 'props.onChange call arg').to.be.true;
	});

	it('dec()', () => {
		const onChangeSpy = spy();
		const wrapper = shallow(
			<NumberControl
				{ ...props }
				onChange={ onChangeSpy }
			/>
		);
		const instance = wrapper.instance();

		instance.dec();

		expect(onChangeSpy.calledOnce, 'props.onChange called').to.be.true;
		expect(onChangeSpy.calledWith(19000), 'props.onChange call arg').to.be.true;
	});

	it('render()', () => {
		const wrapper = shallow(<NumberControl { ...props } />);
		const instance = wrapper.instance();

		expect(
			wrapper.prop('className'),
			'wrapper className'
		).to.be.equal(styles['number-control']);
		expect(
			wrapper.childAt(0).prop('className'),
			'dec control className'
		).to.be.equal(styles['dec']);
		expect(
			wrapper.childAt(0).prop('onClick'),
			'dec control onClick'
		).to.be.a('function');
		expect(
			wrapper.childAt(0).prop('onClick').name,
			'dec control onClick name'
		).to.be.equal('bound dec');
		expect(
			wrapper.childAt(1).prop('className'),
			'value className'
		).to.be.equal(styles['value']);
		expect(
			wrapper.childAt(1).text(),
			'value text'
		).to.be.equal('20');
		expect(
			wrapper.childAt(2).prop('className'),
			'inc control className'
		).to.be.equal(styles['inc']);
		expect(
			wrapper.childAt(2).prop('onClick'),
			'inc control onClick'
		).to.be.a('function');
		expect(
			wrapper.childAt(2).prop('onClick').name,
			'inc control onClick name'
		).to.be.equal('bound inc');
	});
});
