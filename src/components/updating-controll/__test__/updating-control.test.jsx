/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import UpdatingControl from '../updating-control.jsx';
import styles from '../style.css';

describe('<UpdatingControl />', () => {
	it('constructor()', () => {
		const toggleBindSpy = jest.spyOn(UpdatingControl.prototype.toggle, 'bind').mockClear();
		const playBindSpy = jest.spyOn(UpdatingControl.prototype.play, 'bind').mockClear();
		const pauseBindSpy = jest.spyOn(UpdatingControl.prototype.pause, 'bind').mockClear();
		const updateBindSpy = jest.spyOn(UpdatingControl.prototype.update, 'bind').mockClear();
		const wrapper = shallow(
			<UpdatingControl />
		);

		// this.state
		expect(wrapper.state()).toEqual({
			expanded: false,
			state: true
		});
		// this.toggle.bind called
		expect(toggleBindSpy).toHaveBeenCalledTimes(1);
		// this.toggle.bind call arg
		expect(toggleBindSpy.mock.calls[0][0] instanceof UpdatingControl).toBe(true);
		// this.play.bind called
		expect(playBindSpy).toHaveBeenCalledTimes(1);
		// this.play.bind call arg
		expect(playBindSpy.mock.calls[0][0] instanceof UpdatingControl).toBe(true);
		// this.pause.bind called
		expect(pauseBindSpy).toHaveBeenCalledTimes(1);
		// this.pause.bind call arg
		expect(pauseBindSpy.mock.calls[0][0] instanceof UpdatingControl).toBe(true);
		// this.update.bind called
		expect(updateBindSpy).toHaveBeenCalledTimes(1);
		// this.update.bind call arg
		expect(updateBindSpy.mock.calls[0][0] instanceof UpdatingControl).toBe(true);

		updateBindSpy.mockRestore();
		pauseBindSpy.mockRestore();
		playBindSpy.mockRestore();
		toggleBindSpy.mockRestore();
	});

	it('toggle()', () => {
		const wrapper = shallow(
			<UpdatingControl />
		);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.toggle();

		// [from false] this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// [from false] this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			expanded: true
		});

		wrapper.update();
		setStateSpy.mockClear();
		instance.toggle();

		// [from true] this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// [from true] this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			expanded: false
		});

		setStateSpy.mockRestore();
	});

	it('play()', () => {
		const playSpy = jest.fn();
		const wrapper = shallow(
			<UpdatingControl
				play={playSpy}
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.play();

		// props.play called
		expect(playSpy).toHaveBeenCalledTimes(1);
		// this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			state: true
		});

		setStateSpy.mockRestore();
	});

	it('pause()', () => {
		const pauseSpy = jest.fn();
		const wrapper = shallow(
			<UpdatingControl
				pause={pauseSpy}
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.pause();

		// props.pause called
		expect(pauseSpy).toHaveBeenCalledTimes(1);
		// this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			state: false
		});

		setStateSpy.mockRestore();
	});

	it('update()', () => {
		const updateSpy = jest.fn();
		const wrapper = shallow(
			<UpdatingControl
				update={updateSpy}
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.update();

		// props.update called
		expect(updateSpy).toHaveBeenCalledTimes(1);
		// props.update call arg
		expect(updateSpy.mock.calls[0][0]).toBe(true);
		// this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			state: true
		});

		setStateSpy.mockRestore();
	});

	it('render()', () => {
		const wrapper = shallow(
			<UpdatingControl />
		);

		// [expanded = false] wrapper className
		expect(wrapper.prop('className')).toBe(styles['updating-control']);
		// toggle className
		expect(wrapper.childAt(0).prop('className')).toBe(styles.toggle);
		expect(wrapper.childAt(0).prop('onClick')).toBeInstanceOf(Function);
		// toggle onClick name
		expect(wrapper.childAt(0).prop('onClick').name).toBe('bound toggle');
		// pause className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.pause);
		expect(wrapper.childAt(1).prop('onClick')).toBeInstanceOf(Function);
		// pause onClick name
		expect(wrapper.childAt(1).prop('onClick').name).toBe('bound pause');
		// update className
		expect(wrapper.childAt(2).prop('className')).toBe(styles.update);
		expect(wrapper.childAt(2).prop('onClick')).toBeInstanceOf(Function);
		// update onClick name
		expect(wrapper.childAt(2).prop('onClick').name).toBe('bound update');

		wrapper.setState({
			expanded: true,
			state: false
		});

		// [expanded = true] wrapper className
		expect(wrapper.prop('className')).toBe(styles['expanded-control']);
		// play className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.play);
		expect(wrapper.childAt(1).prop('onClick')).toBeInstanceOf(Function);
		// play onClick name
		expect(wrapper.childAt(1).prop('onClick').name).toBe('bound play');
	});
});
