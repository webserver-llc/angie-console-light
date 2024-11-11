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
import { shallow } from 'enzyme';
import Disclaimer from '../disclaimer.jsx';
import styles from '../style.css';

describe('<Disclaimer /> (demo)', () => {
	let wrapper; let
		instance;

	beforeEach(() => {
		wrapper = shallow(<Disclaimer />);
		instance = wrapper.instance();
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it('constructor()', () => {
		const bindSpy = jest.spyOn(Disclaimer.prototype.close, 'bind').mockClear();

		instance.constructor();

		// state
		expect(wrapper.state()).toEqual({ opened: true });
		// close.bind called once
		expect(bindSpy).toHaveBeenCalled();
		// close.bind 1st arg
		expect(bindSpy.mock.calls[0][0] instanceof Disclaimer).toBe(true);

		bindSpy.mockRestore();
	});

	it('close()', () => {
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.close();

		// setState called once
		expect(setStateSpy).toHaveBeenCalled();
		// setState 1st arg
		expect(setStateSpy.mock.calls[0][0]).toEqual({ opened: false });

		setStateSpy.mockRestore();
	});

	it('render()', () => {
		const closeEl = wrapper.find(`.${styles['disclaimer-close']}`);
		const contentEl = wrapper.find(`.${styles['disclaimer-content']}`);

		// root el length
		expect(wrapper.find(`.${styles.disclaimer}`).length).toBe(1);
		// close element length
		expect(closeEl.length).toBe(1);
		// onClick handler
		expect(closeEl.prop('onClick').name).toBe('bound close');
		// content element length
		expect(contentEl.length).toBe(1);

		const links = contentEl.find('a');

		// links length
		expect(links.length).toBe(2);
		// 1nd link href
		expect(links.get(0).props.href).toBe('https://angie.software/angie/docs/configuration/monitoring/');
		// 2rd link href
		expect(links.get(1).props.href).toBe('https://angie.software/angie/pro/');

		wrapper.setState({ opened: false });

		// root el when closed
		expect(wrapper.length).toBe(0);
	});
});
