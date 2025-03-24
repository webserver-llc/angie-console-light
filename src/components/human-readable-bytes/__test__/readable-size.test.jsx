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
import HumanReadableBytes from '../human-readable-bytes';
import tooltips from '#/tooltips';

describe('<HumanReadableBytes />', () => {
	it('renders value and tooltip when value > 1023', () => {
		const initialValue = 2000;
		let tooltipText;
		jest
			.spyOn(tooltips, 'useTooltip')
			.mockClear()
			.mockImplementation((value) => {
				tooltipText = value;
			});

		const wrapper = shallow(<HumanReadableBytes value={initialValue} />);
		const outputText = wrapper.find('span').text();

		expect(outputText).toBe('1.95 KiB');
		expect(tooltipText).toBe(`${initialValue} B`);
	});

	it('should render 0 when input value prop is not set', () => {
		const wrapper = shallow(<HumanReadableBytes />);
		const outputText = wrapper.find('span').text();

		expect(outputText).toBe('0');
	});

	it('renders value with postfix', () => {
		const initialValue = 2000;
		const postfix = 'postfix';
		let tooltipText;
		jest
			.spyOn(tooltips, 'useTooltip')
			.mockClear()
			.mockImplementation((input) => {
				tooltipText = input;
			});

		const wrapper = shallow(<HumanReadableBytes value={initialValue} postfix={postfix} />);
		const outputText = wrapper.find('span').text();

		expect(outputText).toBe(`1.95 KiB${postfix}`);
		expect(tooltipText).toBe(`${initialValue} B${postfix}`);
	});

	it('wont render tooltip when value <= 1023', () => {
		const initialValue = 500;
		let tooltipComponent;
		jest
			.spyOn(tooltips, 'useTooltip')
			.mockClear()
			.mockImplementation((component) => {
				tooltipComponent = component;
			});
		const wrapper = shallow(<HumanReadableBytes value={initialValue} />);
		const outputText = wrapper.find('span').text();

		expect(outputText).toBe(`${initialValue} B`);
		expect(tooltipComponent).toBe(undefined);
	});
});
