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
import Footer from '../footer.jsx';
import styles from '../style.css';

describe('<Footer />', () => {
	it('shouldComponentUpdate()', () => {
		const wrapper = shallow(<Footer />);

		// return value
		expect(wrapper.instance().shouldComponentUpdate()).toBe(false);
	});

	it('render()', () => {
		const wrapper = shallow(<Footer />);

		// div length
		expect(wrapper.find(`div.${ styles.footer }`).length).toBe(1);
	});
});
