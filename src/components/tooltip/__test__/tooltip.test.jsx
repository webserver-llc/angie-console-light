/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow, mount } from 'enzyme';
import { spy, stub } from 'sinon';
import Tooltip from '../tooltip.jsx';
import styles from '../style.css';

describe('<Tooltip />', () => {
	const props = {
		top: 500,
		left: 120,
		anchorWidth: 20,
		anchorHeight: 40
	};

	it('constructor()', () => {
		const wrapper = shallow(
			<Tooltip { ...props } />
		);

		expect(wrapper.state(), 'this.state').to.be.deep.equal({
			top: 500,
			left: 120
		});

		wrapper.unmount();
	});

	it('componentDidMount()', () => {
		const wrapper = mount(
			<Tooltip { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance, 'reposition').callsFake(() => {});

		instance.componentDidMount();

		expect(instance.reposition.calledOnce, 'this.reposition called').to.be.true;

		instance.reposition.restore();
		wrapper.unmount();
	});

	it('reposition()', () => {
		const wrapper = shallow(
			<Tooltip { ...props } />
		);
		const instance = wrapper.instance();
		const setStateStub = stub(instance, 'setState').callsFake(() => {});

		stub(instance.ref, 'getBoundingClientRect').callsFake(() => ({
			width: 200,
			height: 100
		}));

		instance.reposition();

		expect(
			instance.ref.getBoundingClientRect.calledOnce,
			'[no align, no position] this.ref.getBoundingClientRect called'
		).to.be.true;
		expect(
			setStateStub.calledOnce,
			'[no align, no position] this.setState called'
		).to.be.true;
		expect(
			setStateStub.args[0][0],
			'[no align, no position] this.setState call args'
		).to.be.deep.equal({
			top: 500,
			left: 120
		});

		instance.ref.getBoundingClientRect.resetHistory();
		setStateStub.resetHistory();
		wrapper.setProps({ align: 'center' });
		instance.reposition();

		expect(
			instance.ref.getBoundingClientRect.calledOnce,
			'[align = center, no position] this.ref.getBoundingClientRect called'
		).to.be.true;
		expect(
			setStateStub.calledOnce,
			'[align = center, no position] this.setState called'
		).to.be.true;
		expect(
			setStateStub.args[0][0],
			'[align = center, no position] this.setState call args'
		).to.be.deep.equal({
			top: 500,
			left: 30
		});

		instance.ref.getBoundingClientRect.resetHistory();
		setStateStub.resetHistory();
		wrapper.setProps({ position: 'top' });
		instance.reposition();

		expect(
			instance.ref.getBoundingClientRect.calledOnce,
			'[align = center, position = top] this.ref.getBoundingClientRect called'
		).to.be.true;
		expect(
			setStateStub.calledOnce,
			'[align = center, position = top] this.setState called'
		).to.be.true;
		expect(
			setStateStub.args[0][0],
			'[align = center, position = top] this.setState call args'
		).to.be.deep.equal({
			top: 360,
			left: 30
		});

		instance.ref.getBoundingClientRect.resetHistory();
		setStateStub.resetHistory();
		wrapper.setProps({ position: 'right' });
		instance.reposition();

		expect(
			instance.ref.getBoundingClientRect.calledOnce,
			'[align = center, position = right] this.ref.getBoundingClientRect called'
		).to.be.true;
		expect(
			setStateStub.calledOnce,
			'[align = center, position = right] this.setState called'
		).to.be.true;
		expect(
			setStateStub.args[0][0],
			'[align = center, position = right] this.setState call args'
		).to.be.deep.equal({
			top: 460,
			left: 60
		});

		instance.ref.getBoundingClientRect.resetHistory();
		setStateStub.resetHistory();
		wrapper.setProps({ align: '' });
		instance.reposition();

		expect(
			instance.ref.getBoundingClientRect.calledOnce,
			'[no align, position = right] this.ref.getBoundingClientRect called'
		).to.be.true;
		expect(
			setStateStub.calledOnce,
			'[no align, position = right] this.setState called'
		).to.be.true;
		expect(
			setStateStub.args[0][0],
			'[no align, position = right] this.setState call args'
		).to.be.deep.equal({
			top: 460,
			left: 150
		});

		instance.ref.getBoundingClientRect.resetHistory();
		setStateStub.resetHistory();
		wrapper.setProps({ position: 'top' });
		instance.reposition();

		expect(
			instance.ref.getBoundingClientRect.calledOnce,
			'[no align, position = top] this.ref.getBoundingClientRect called'
		).to.be.true;
		expect(
			setStateStub.calledOnce,
			'[no align, position = top] this.setState called'
		).to.be.true;
		expect(
			setStateStub.args[0][0],
			'[no align, position = top] this.setState call args'
		).to.be.deep.equal({
			top: 360,
			left: 120
		});

		instance.ref.getBoundingClientRect.restore();
		delete instance.ref;
		setStateStub.resetHistory();
		instance.reposition();

		expect(setStateStub.notCalled, '[no this.ref] this.setState not called').to.be.true;

		setStateStub.restore();
		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(
			<Tooltip { ...props }>
				test_children
			</Tooltip>
		);
		const instance = wrapper.instance();

		expect(wrapper.prop('className'), 'wrapper className').to.be.equal(
			`${ styles['tooltip'] } ${ styles['bottom'] }`
		);
		expect(wrapper.prop('style'), 'wrapper prop style').to.be.deep.equal({
			top: '500px',
			left: '120px'
		});
		expect(wrapper.children(), 'wrapper children size').to.have.lengthOf(1);
		expect(wrapper.childAt(0).text(), 'wrapper children').to.be.equal('test_children');

		wrapper.setProps({
			position: 'top',
			align: 'center'
		});

		expect(wrapper.prop('className'), 'wrapper className').to.be.equal(
			`${ styles['tooltip'] } ${ styles['top'] } ${ styles['center'] }`
		);

		wrapper.unmount();
	});
});
