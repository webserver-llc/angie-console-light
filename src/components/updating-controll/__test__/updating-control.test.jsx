/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';
import UpdatingControl from '../updating-control.jsx';
import styles from '../style.css';

describe('<UpdatingControl />', () => {
	it('constructor()', () => {
		const wrapper = shallow(
			<UpdatingControl />
		);
		const instance = wrapper.instance();

		expect(wrapper.state(), 'this.state').to.be.deep.equal({
			expanded: false,
			state: true
		});

		const toggleBindSpy = spy(instance.toggle, 'bind');
		const playBindSpy = spy(instance.play, 'bind');
		const pauseBindSpy = spy(instance.pause, 'bind');
		const updateBindSpy = spy(instance.update, 'bind');

		instance.constructor();

		expect(toggleBindSpy.calledOnce, 'this.toggle.bind called').to.be.true;
		expect(toggleBindSpy.args[0][0], 'this.toggle.bind call arg').to.be.deep.equal(instance);
		expect(playBindSpy.calledOnce, 'this.play.bind called').to.be.true;
		expect(playBindSpy.args[0][0], 'this.play.bind call arg').to.be.deep.equal(instance);
		expect(pauseBindSpy.calledOnce, 'this.pause.bind called').to.be.true;
		expect(pauseBindSpy.args[0][0], 'this.pause.bind call arg').to.be.deep.equal(instance);
		expect(updateBindSpy.calledOnce, 'this.update.bind called').to.be.true;
		expect(updateBindSpy.args[0][0], 'this.update.bind call arg').to.be.deep.equal(instance);

		toggleBindSpy.restore();
		playBindSpy.restore();
		pauseBindSpy.restore();
		updateBindSpy.restore();
		wrapper.unmount();
	});

	it('toggle()', () => {
		const wrapper = shallow(
			<UpdatingControl />
		);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		instance.toggle();

		expect(setStateSpy.calledOnce, '[from false] this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], '[from false] this.setState call args').to.be.deep.equal({
			expanded: true
		});

		setStateSpy.resetHistory();
		instance.toggle();

		expect(setStateSpy.calledOnce, '[from true] this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], '[from true] this.setState call args').to.be.deep.equal({
			expanded: false
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('play()', () => {
		const playSpy = spy();
		const wrapper = shallow(
			<UpdatingControl
				play={ playSpy }
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		instance.play();

		expect(playSpy.calledOnce, 'props.play called').to.be.true;
		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			state: true
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('pause()', () => {
		const pauseSpy = spy();
		const wrapper = shallow(
			<UpdatingControl
				pause={ pauseSpy }
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		instance.pause();

		expect(pauseSpy.calledOnce, 'props.pause called').to.be.true;
		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			state: false
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('update()', () => {
		const updateSpy = spy();
		const wrapper = shallow(
			<UpdatingControl
				update={ updateSpy }
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		instance.update();

		expect(updateSpy.calledOnce, 'props.update called').to.be.true;
		expect(updateSpy.args[0][0], 'props.update call arg').to.be.true;
		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			state: true
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(
			<UpdatingControl />
		);

		expect(
			wrapper.prop('className'),
			'[expanded = false] wrapper className'
		).to.be.equal(styles['updating-control']);
		expect(
			wrapper.childAt(0).prop('className'),
			'toggle className'
		).to.be.equal(styles['toggle']);
		expect(
			wrapper.childAt(0).prop('onClick'),
			'toggle onClick'
		).to.be.a('function');
		expect(
			wrapper.childAt(0).prop('onClick').name,
			'toggle onClick name'
		).to.be.equal('bound toggle');
		expect(
			wrapper.childAt(1).prop('className'),
			'pause className'
		).to.be.equal(styles['pause']);
		expect(
			wrapper.childAt(1).prop('onClick'),
			'pause onClick'
		).to.be.a('function');
		expect(
			wrapper.childAt(1).prop('onClick').name,
			'pause onClick name'
		).to.be.equal('bound pause');
		expect(
			wrapper.childAt(2).prop('className'),
			'update className'
		).to.be.equal(styles['update']);
		expect(
			wrapper.childAt(2).prop('onClick'),
			'update onClick'
		).to.be.a('function');
		expect(
			wrapper.childAt(2).prop('onClick').name,
			'update onClick name'
		).to.be.equal('bound update');

		wrapper.setState({
			expanded: true,
			state: false
		});

		expect(
			wrapper.prop('className'),
			'[expanded = true] wrapper className'
		).to.be.equal(styles['expanded-control']);
		expect(
			wrapper.childAt(1).prop('className'),
			'play className'
		).to.be.equal(styles['play']);
		expect(
			wrapper.childAt(1).prop('onClick'),
			'play onClick'
		).to.be.a('function');
		expect(
			wrapper.childAt(1).prop('onClick').name,
			'play onClick name'
		).to.be.equal('bound play');

		wrapper.unmount();
	});
});
