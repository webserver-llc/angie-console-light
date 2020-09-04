/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import Footer from '../footer.jsx';
import styles from '../style.css';

describe('<Footer />', () => {
	it('shouldComponentUpdate()', () => {
		const wrapper = shallow(<Footer />);

		expect(wrapper.instance().shouldComponentUpdate(), 'return value').to.be.false;
	});

	it('render()', () => {
		const wrapper = shallow(<Footer />);

		expect(wrapper.find(`div.${ styles['footer'] }`).length, 'div length').to.be.equal(1);
	});
});
