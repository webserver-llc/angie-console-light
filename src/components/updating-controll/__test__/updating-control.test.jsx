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
		const toggleBindSpy = spy(UpdatingControl.prototype.toggle, 'bind');
		const playBindSpy = spy(UpdatingControl.prototype.play, 'bind');
		const pauseBindSpy = spy(UpdatingControl.prototype.pause, 'bind');
		const updateBindSpy = spy(UpdatingControl.prototype.update, 'bind');
		const wrapper = shallow(
			<UpdatingControl />
		);

		expect(wrapper.state(), 'this.state').to.be.deep.equal({
			expanded: false,
			state: true
		});
		expect(toggleBindSpy.calledOnce, 'this.toggle.bind called').to.be.true;
		expect(toggleBindSpy.args[0][0] instanceof UpdatingControl, 'this.toggle.bind call arg').to.be.true;
		expect(playBindSpy.calledOnce, 'this.play.bind called').to.be.true;
		expect(playBindSpy.args[0][0] instanceof UpdatingControl, 'this.play.bind call arg').to.be.true;
		expect(pauseBindSpy.calledOnce, 'this.pause.bind called').to.be.true;
		expect(pauseBindSpy.args[0][0] instanceof UpdatingControl, 'this.pause.bind call arg').to.be.true;
		expect(updateBindSpy.calledOnce, 'this.update.bind called').to.be.true;
		expect(updateBindSpy.args[0][0] instanceof UpdatingControl, 'this.update.bind call arg').to.be.true;

		updateBindSpy.restore();
		pauseBindSpy.restore();
		playBindSpy.restore();
		toggleBindSpy.restore();
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
	});
});
