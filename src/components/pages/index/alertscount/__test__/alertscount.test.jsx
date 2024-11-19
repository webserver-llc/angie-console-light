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
import AlertsCount from '../alertscount.jsx';
import styles from '../style.css';

describe('<AlertsCount IndexPage />', () => {
	it('shouldComponentUpdate()', () => {
		const wrapper = shallow(
			<AlertsCount
				total={100}
				alerts={9}
				warnings={42}
			/>
		);
		const instance = wrapper.instance();

		// same props
		expect(instance.shouldComponentUpdate({
			total: 100,
			alerts: 9,
			warnings: 42
		})).toBe(false);
		// another total
		expect(instance.shouldComponentUpdate({
			total: 10,
			alerts: 9,
			warnings: 42
		})).toBe(true);
		// another alerts
		expect(instance.shouldComponentUpdate({
			total: 100,
			alerts: 99,
			warnings: 42
		})).toBe(true);
		// another warnings
		expect(instance.shouldComponentUpdate({
			total: 100,
			alerts: 9,
			warnings: 2
		})).toBe(true);

		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(
			<AlertsCount
				total={100}
				alerts={0}
				warnings={0}
				href="test_href"
			/>
		);
		const instance = wrapper.instance();

		// root el className
		expect(wrapper.prop('className')).toBe(styles.alerts);
		// "total" el className
		expect(wrapper.childAt(0).prop('className')).toBe(styles.num);
		// "total" el, child 1 className
		expect(wrapper.childAt(0).childAt(0).prop('className')).toBe(styles.label);
		// "total" el, child 2 text
		expect(wrapper.childAt(0).childAt(1).text()).toBe('100');
		// "alerts/warnings" el className
		expect(wrapper.childAt(2).prop('className')).toBe(styles.ok);
		// "alerts/warnings" el href
		expect(wrapper.childAt(2).prop('href')).toBe('test_href');
		// "alerts/warnings" el, child 1 className
		expect(wrapper.childAt(2).childAt(0).prop('className')).toBe(styles.label);
		// "alerts/warnings" el, child 1 text
		expect(wrapper.childAt(2).childAt(0).text()).toBe('Проблем');
		// "alerts/warnings" el, child 2 text
		expect(wrapper.childAt(2).childAt(1).text()).toBe('0');

		wrapper.setProps({
			total: 100,
			alerts: 0,
			warnings: 11
		});

		// "alerts/warnings" el className
		expect(wrapper.childAt(2).prop('className')).toBe(styles.warning);
		// "alerts/warnings" el, child 1 text
		expect(wrapper.childAt(2).childAt(0).text()).toBe('Предупрежд.');
		// "alerts/warnings" el, child 2 text
		expect(wrapper.childAt(2).childAt(1).text()).toBe('11');

		wrapper.setProps({
			total: 100,
			alerts: 2,
			warnings: 11
		});

		// "alerts/warnings" el className
		expect(wrapper.childAt(2).prop('className')).toBe(styles.alert);
		// "alerts/warnings" el, child 1 text
		expect(wrapper.childAt(2).childAt(0).text()).toBe('Проблем');
		// "alerts/warnings" el, child 2 text
		expect(wrapper.childAt(2).childAt(1).text()).toBe('2');

		wrapper.unmount();
	});
});
