/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import NumberInput from '../numberinput.jsx';

describe('<NumberInput />', () => {
	it('onKeyPress()', () => {
		const evt = {
			charCode: 0,
			preventDefault: spy()
		};

		NumberInput.onKeyPress(evt);
		expect(evt.preventDefault.notCalled, 'evt.preventDefault not called [charCode = 0]').to.be.true;

		evt.charCode = 53;
		NumberInput.onKeyPress(evt);
		expect(evt.preventDefault.notCalled, 'evt.preventDefault not called ["5" char]').to.be.true;

		evt.charCode = 100;
		NumberInput.onKeyPress(evt);
		expect(evt.preventDefault.calledOnce, 'evt.preventDefault called once ["d" char]').to.be.true;
	});

	it('render()', () => {
		const prop_1 = true;
		const prop_2 = '123qwe';
		const wrapper = shallow(
			<NumberInput
				prop_1={ prop_1 }
				prop_2={ prop_2 }
			/>
		);
		const rootEl = wrapper.getElement();

		expect(rootEl.nodeName, 'check html tag').to.be.equal('input');
		expect(rootEl.children, 'check children').to.be.an('undefined');
		expect(rootEl.attributes.onKeyPress.name, '"onKeyPress" prop').to.be.equal('onKeyPress');
		expect(rootEl.attributes.prop_1, '"prop_1" prop').to.be.equal(prop_1);
		expect(rootEl.attributes.prop_2, '"prop_2" prop').to.be.equal(prop_2);

		wrapper.unmount();
	});
});
