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
import { Resolvers } from '../resolvers.jsx';

describe('<Resolvers IndexPage />', () => {
	it('render()', () => {
		const data = {
			resolvers: {
				__STATS: {
					total: 100,
					alerts: 3,
					traffic: {}
				}
			}
		};
		const store = {
			__STATUSES: {
				resolvers: {
					status: 'ok'
				}
			}
		};
		const wrapper = shallow(
			<Resolvers
				data={data}
				store={store}
			/>
		);
		const indexBox = wrapper.find('IndexBox');

		// IndexBox title
		expect(indexBox.prop('title')).toBe('DNS-резолверы');
		// IndexBox status
		expect(indexBox.prop('status')).toBe('ok');
		// IndexBox href
		expect(indexBox.prop('href')).toBe('#resolvers');

		const alertsCount = indexBox.find('AlertsCount');

		// AlertsCount href
		expect(alertsCount.prop('href')).toBe('#resolvers');
		// AlertsCount total
		expect(alertsCount.prop('total')).toBe(100);
		// AlertsCount alerts
		expect(alertsCount.prop('alerts')).toBe(3);

		let traffic = indexBox.find('p');

		// Traffic req/s
		expect(traffic.at(0).text()).toBe('Запр./сек.: 0');
		// Traffic resp/s
		expect(traffic.at(1).text()).toBe('Отв./сек.: 0');

		data.resolvers.__STATS.traffic = { in: 20, out: 19 };
		wrapper.setProps({ data, store });
		traffic = wrapper.find('IndexBox p');

		// Traffic req/s
		expect(traffic.at(0).text()).toBe('Запр./сек.: 20');
		// Traffic resp/s
		expect(traffic.at(1).text()).toBe('Отв./сек.: 19');

		wrapper.unmount();
	});
});
