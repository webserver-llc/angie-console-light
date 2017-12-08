/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

/* eslint-env browser, mocha */

import React from 'react';
import { mount } from 'enzyme';
import AlertsCount from './alertscount.jsx';
import styles from './style.css';

describe('AlertsCount', () => {
	describe('render()', () => {
		let wrapper;

		const cssSelector = classes => classes.split(' ').map(className => `.${className}`).join(' ');

		beforeEach(() => {
			wrapper = mount(<AlertsCount total={1} alerts={0} />);
		});

		it('renders', () => {
			assert(wrapper.find(`.${styles.num}`).at(0).text() === 'Total1');
			assert(wrapper.find(`.${styles.num}`).at(1).text() === 'Problems0');
		});

		it('changes color for alert counter', (done) => {
			assert(wrapper.find(cssSelector(styles.alert)).length === 0);
			assert(wrapper.find(cssSelector(styles.ok)).length === 1);

			wrapper.setProps({
				total: 1,
				alerts: 1
			});

			setImmediate(() => {
				assert(wrapper.find(cssSelector(styles.alert)).length === 1);
				assert(wrapper.find(cssSelector(styles.ok)).length === 0);
				done();
			});
		});

		it('changes label from "problems" to "alerts"', (done) => {
			assert(wrapper.find(`.${styles.label}`).at(1).text() === 'Problems');

			wrapper.setProps({
				total: 1,
				alerts: 1
			});

			setImmediate(() => {
				assert(wrapper.find(`.${styles.label}`).at(1).text() === 'Alerts');
				done();
			});
		});

		it('shows warning ', (done) => {
			wrapper.setProps({
				total: 1,
				alerts: 1,
				warnings: true
			});

			setImmediate(() => {
				assert(wrapper.find(cssSelector(styles.warning)).length === 1);
				assert(wrapper.find(`.${styles.label}`).at(1).text() === 'Warnings');
				done();
			});
		});
	});

	it('shouldComponentUpdate', () => {
		const wrapper = mount(<AlertsCount total={1} alerts={0} />);

		assert(wrapper.instance().shouldComponentUpdate({
			total: 1,
			alerts: 0
		}) === false);

		assert(wrapper.instance().shouldComponentUpdate({
			total: 1,
			alerts: 2
		}) === true);
	});
});
