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
import NumberInput from '../numberinput.jsx';

describe('<NumberInput />', () => {
	it('onKeyPress()', () => {
		const evt = {
			charCode: 0,
			preventDefault: jest.fn()
		};

		NumberInput.onKeyPress(evt);
		// evt.preventDefault not called [charCode = 0]
		expect(evt.preventDefault).not.toHaveBeenCalled();

		evt.charCode = 53;
		NumberInput.onKeyPress(evt);
		// evt.preventDefault not called ["5" char]
		expect(evt.preventDefault).not.toHaveBeenCalled();

		evt.charCode = 100;
		NumberInput.onKeyPress(evt);
		// evt.preventDefault called once ["d" char]
		expect(evt.preventDefault).toHaveReturnedTimes(1);
	});

	it('render()', () => {
		const prop_1 = true;
		const prop_2 = '123qwe';
		const wrapper = shallow(
			<NumberInput
				prop_1={prop_1}
				prop_2={prop_2}
			/>
		);
		const rootEl = wrapper.getElement();

		// check html tag
		expect(rootEl.type).toBe('input');
		expect(rootEl.props.children).toBeUndefined();
		// "onKeyPress" prop
		expect(rootEl.props.onKeyPress.name).toBe('onKeyPress');
		// "prop_1" prop
		expect(rootEl.props.prop_1).toBe(prop_1);
		// "prop_2" prop
		expect(rootEl.props.prop_2).toBe(prop_2);

		wrapper.unmount();
	});
});
