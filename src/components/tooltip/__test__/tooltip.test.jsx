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
import { shallow, mount } from 'enzyme';
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
			<Tooltip {...props} />
		);

		// this.state
		expect(wrapper.state()).toEqual({
			top: 500,
			left: 120,
			movedToLeft: false,
		});
	});

	it('componentDidMount()', () => {
		const wrapper = mount(
			<Tooltip {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'reposition').mockClear().mockImplementation(() => {});

		instance.componentDidMount();

		// this.reposition called
		expect(instance.reposition).toHaveBeenCalledTimes(1);

		instance.reposition.mockRestore();
		wrapper.unmount();
	});

	it('reposition()', () => {
		const wrapper = shallow(
			<Tooltip {...props} />
		);
		const instance = wrapper.instance();
		const setStateStub = jest.spyOn(instance, 'setState').mockClear().mockImplementation(() => {});
		let width = 200;
		jest.spyOn(instance.ref, 'getBoundingClientRect').mockClear().mockImplementation(() => ({
			width,
			height: 100,
		}));

		instance.reposition();

		// [no align, no position] this.ref.getBoundingClientRect called
		expect(instance.ref.getBoundingClientRect).toHaveBeenCalledTimes(1);
		// [no align, no position] this.setState called
		expect(setStateStub).toHaveBeenCalledTimes(1);
		// [no align, no position] this.setState call args
		expect(setStateStub.mock.calls[0][0]).toEqual({
			top: 500,
			left: 120,
			movedToLeft: false,
		});

		instance.ref.getBoundingClientRect.mockClear();
		setStateStub.mockClear();
		wrapper.setProps({ align: 'center' });
		instance.reposition();

		// [align = center, no position] this.ref.getBoundingClientRect called
		expect(instance.ref.getBoundingClientRect).toHaveBeenCalledTimes(1);
		// [align = center, no position] this.setState called
		expect(setStateStub).toHaveBeenCalledTimes(1);
		// [align = center, no position] this.setState call args
		expect(setStateStub.mock.calls[0][0]).toEqual({
			top: 500,
			left: 30,
			movedToLeft: false,
		});

		instance.ref.getBoundingClientRect.mockClear();
		setStateStub.mockClear();
		wrapper.setProps({ position: 'top' });
		instance.reposition();

		// [align = center, position = top] this.ref.getBoundingClientRect called
		expect(instance.ref.getBoundingClientRect).toHaveBeenCalledTimes(1);
		// [align = center, position = top] this.setState called
		expect(setStateStub).toHaveBeenCalledTimes(1);
		// [align = center, position = top] this.setState call args
		expect(setStateStub.mock.calls[0][0]).toEqual({
			top: 340,
			left: 30,
			movedToLeft: false,
		});

		instance.ref.getBoundingClientRect.mockClear();
		setStateStub.mockClear();
		wrapper.setProps({ position: 'right' });
		instance.reposition();

		// [align = center, position = right] this.ref.getBoundingClientRect called
		expect(instance.ref.getBoundingClientRect).toHaveBeenCalledTimes(1);
		// [align = center, position = right] this.setState called
		expect(setStateStub).toHaveBeenCalledTimes(1);
		// [align = center, position = right] this.setState call args
		expect(setStateStub.mock.calls[0][0]).toEqual({
			top: 440,
			left: 60,
			movedToLeft: false,
		});

		instance.ref.getBoundingClientRect.mockClear();
		setStateStub.mockClear();
		wrapper.setProps({ align: '' });
		instance.reposition();

		// [no align, position = right] this.ref.getBoundingClientRect called
		expect(instance.ref.getBoundingClientRect).toHaveBeenCalledTimes(1);
		// [no align, position = right] this.setState called
		expect(setStateStub).toHaveBeenCalledTimes(1);
		// [no align, position = right] this.setState call args
		expect(setStateStub.mock.calls[0][0]).toEqual({
			top: 440,
			left: 150,
			movedToLeft: false,
		});

		instance.ref.getBoundingClientRect.mockClear();
		setStateStub.mockClear();
		wrapper.setProps({ position: 'top' });
		instance.reposition();

		// [no align, position = top] this.ref.getBoundingClientRect called
		expect(instance.ref.getBoundingClientRect).toHaveBeenCalledTimes(1);
		// [no align, position = top] this.setState called
		expect(setStateStub).toHaveBeenCalledTimes(1);
		// [no align, position = top] this.setState call args
		expect(setStateStub.mock.calls[0][0]).toEqual({
			top: 340,
			left: 120,
			movedToLeft: false,
		});

		instance.ref.getBoundingClientRect.mockClear();
		setStateStub.mockClear();
		width = 2000;
		wrapper.setProps({ align: 'center' });
		instance.reposition();

		// [movedToLeft = true, align = center, position = top] this.ref.getBoundingClientRect called
		expect(instance.ref.getBoundingClientRect).toHaveBeenCalledTimes(1);
		// [movedToLeft = true, align = center, position = top] this.setState called
		expect(setStateStub).toHaveBeenCalledTimes(1);
		// [movedToLeft = true, align = center, position = top] this.setState call args
		expect(setStateStub.mock.calls[0][0]).toEqual({
			top: 340,
			left: -1850,
			movedToLeft: true,
		});

		instance.ref.getBoundingClientRect.mockClear();
		delete instance.ref;
		setStateStub.mockClear();
		instance.reposition();

		// [no this.ref] this.setState not called
		expect(setStateStub).not.toHaveBeenCalledTimes(1);

		setStateStub.mockRestore();
	});

	it('render()', () => {
		const wrapper = shallow(
			<Tooltip {...props}>
				test_children
			</Tooltip>
		);
		const instance = wrapper.instance();

		// [no position, no align] wrapper className
		expect(wrapper.prop('className')).toBe(`${ styles.tooltip } ${ styles.bottom }`);
		// wrapper prop style
		expect(wrapper.prop('style')).toEqual({
			top: '500px',
			left: '120px'
		});
		// wrapper children size
		expect(wrapper.children()).toHaveLength(1);
		// wrapper children
		expect(wrapper.childAt(0).text()).toBe('test_children');

		wrapper.setProps({
			position: 'top',
			align: 'center'
		});

		// [position, align] wrapper className
		expect(wrapper.prop('className')).toBe(`${ styles.tooltip } ${ styles.top } ${ styles.center }`);

		wrapper.setState({ movedToLeft: true });

		// [position, movedToLeft] wrapper className
		expect(wrapper.prop('className')).toBe(`${ styles.tooltip } ${ styles.top } ${ styles.start }`);
	});
});
