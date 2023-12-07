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
import { ZoneSync } from '../zonesync.jsx';

describe('<ZoneSync IndexPage />', () => {
	it('render()', () => {
		const data = {
			zone_sync: {
				__STATS: {
					total: 100,
					alerts: 3,
					warnings: 7,
					traffic: {}
				}
			}
		};
		const store = {
			__STATUSES: {
				zone_sync: {
					status: 'ok'
				}
			}
		};
		const wrapper = shallow(
			<ZoneSync
				data={data}
				store={store}
			/>
		);
		const indexBox = wrapper.find('IndexBox');

		// IndexBox title
		expect(indexBox.prop('title')).toBe('Cluster');
		// IndexBox status
		expect(indexBox.prop('status')).toBe('ok');
		// IndexBox href
		expect(indexBox.prop('href')).toBe('#cluster');

		const alertsCount = indexBox.find('AlertsCount');

		// AlertsCount href
		expect(alertsCount.prop('href')).toBe('#cluster');
		// AlertsCount total
		expect(alertsCount.prop('total')).toBe(100);
		// AlertsCount alerts
		expect(alertsCount.prop('alerts')).toBe(3);
		// AlertsCount warnings
		expect(alertsCount.prop('warnings')).toBe(7);

		let traffic = indexBox.find('p');

		// Traffic req/s
		expect(traffic.at(0).text()).toBe('In: 0');
		// Traffic resp/s
		expect(traffic.at(1).text()).toBe('Out: 0');

		data.zone_sync.__STATS.traffic = { in: 20, out: 19 };
		wrapper.setProps({ data, store });
		traffic = wrapper.find('IndexBox p');

		// Traffic req/s
		expect(traffic.at(0).text()).toBe('In: 20');
		// Traffic resp/s
		expect(traffic.at(1).text()).toBe('Out: 19');

		wrapper.unmount();
	});
});
