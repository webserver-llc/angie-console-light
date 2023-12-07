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
import { mount } from 'enzyme';
import Unsupported, { start } from '../unsupported.jsx';
import Footer from '../components/footer/footer.jsx';
import styles from '../style.css';
import headerStyles from '../components/header/style.css';

describe('<Unsupported />', () => {
	it('render()', () => {
		const wrapper = mount(<Unsupported />);

		expect(wrapper.find(`.${ styles.console }`)).toHaveLength(1);

		const simpleHeader = wrapper.find(`.${ headerStyles.header }`);

		expect(simpleHeader.length === 1).toBeTruthy();
		expect(
			simpleHeader.find(`.${ headerStyles.logo.replace(' ', '.') }`).length === 1
		).toBeTruthy();

		expect(wrapper.find(`.${ styles.content }`).length === 1).toBeTruthy();
		expect(wrapper.find(`.${ styles['error-block'] }`).length === 1).toBeTruthy();

		expect(wrapper.find(Footer).length === 1).toBeTruthy();
	});

	it('start()', () => {
		jest.spyOn(document.body, 'appendChild').mockClear().mockImplementation(() => {});

		start();

		const Wrapper = document.body.appendChild.mock.calls[0][0];

		expect(Wrapper.children.length === 1).toBeTruthy();
		expect(
			Wrapper.textContent.includes('Unfortunately your browser is not supported, please use modern one.')
		).toBeTruthy();

		document.body.appendChild.mockRestore();
	});
});
