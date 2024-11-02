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
import { Caches } from '../caches.jsx';
import styles from '../style.css';

describe('<Caches IndexPage />', () => {
	it('render()', () => {
		const data = {
			caches: {
				__STATS: {
					total: 100,
					alerts: 3,
					warnings: 5,
					states: {
						warm: 10,
						cold: 30
					}
				}
			}
		};
		const store = {
			__STATUSES: {
				caches: {
					status: 'ok'
				}
			}
		};
		const wrapper = shallow(
			<Caches
				data={data}
				store={store}
			/>
		);
		const indexBox = wrapper.find('IndexBox');

		// IndexBox title
		expect(indexBox.prop('title')).toBe('Кэши');
		// IndexBox status
		expect(indexBox.prop('status')).toBe('ok');
		// IndexBox href
		expect(indexBox.prop('href')).toBe('#caches');

		const alertsCount = indexBox.find('AlertsCount');

		// AlertsCount href
		expect(alertsCount.prop('href')).toBe('#caches');
		// AlertsCount total
		expect(alertsCount.prop('total')).toBe(100);
		// AlertsCount alerts
		expect(alertsCount.prop('alerts')).toBe(3);
		// AlertsCount warnings
		expect(alertsCount.prop('warnings')).toBe(5);

		const states = wrapper.find('p');

		// Icon 1
		expect(states.at(0).childAt(0).name()).toBe('Icon');
		// Icon 1, type
		expect(states.at(0).childAt(0).prop('type')).toBe('sun');
		// Icon 1, className
		expect(states.at(0).childAt(0).prop('className')).toBe(styles.icon);
		// state label 1
		expect(states.at(0).text()).toContain('Прогретые: 10');
		// Icon 2
		expect(states.at(1).childAt(0).name()).toBe('Icon');
		// Icon 2, type
		expect(states.at(1).childAt(0).prop('type')).toBe('snowflake');
		// Icon 2, className
		expect(states.at(1).childAt(0).prop('className')).toBe(`${styles.icon} ${styles.snowflakeIcon}`);
		// state label 2
		expect(states.at(1).text()).toContain('Холодные: 30');

		wrapper.unmount();
	});
});
