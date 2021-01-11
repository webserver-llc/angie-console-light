/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
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
				data={ data }
				store={ store }
			/>
		);
		const indexBox = wrapper.find('IndexBox');

		expect(indexBox.prop('title'), 'IndexBox title').to.be.equal('Cluster');
		expect(indexBox.prop('status'), 'IndexBox status').to.be.equal('ok');
		expect(indexBox.prop('href'), 'IndexBox href').to.be.equal('#cluster');

		const alertsCount = indexBox.find('AlertsCount');

		expect(alertsCount.prop('href'), 'AlertsCount href').to.be.equal('#cluster');
		expect(alertsCount.prop('total'), 'AlertsCount total').to.be.equal(100);
		expect(alertsCount.prop('alerts'), 'AlertsCount alerts').to.be.equal(3);
		expect(alertsCount.prop('warnings'), 'AlertsCount warnings').to.be.equal(7);

		let traffic = indexBox.find('p');

		expect(traffic.at(0).text(), 'Traffic req/s').to.be.equal('In: 0');
		expect(traffic.at(1).text(), 'Traffic resp/s').to.be.equal('Out: 0');

		data.zone_sync.__STATS.traffic = { in: 20, out: 19 };
		wrapper.setProps({ data, store });
		traffic = wrapper.find('IndexBox p');

		expect(traffic.at(0).text(), 'Traffic req/s').to.be.equal('In: 20');
		expect(traffic.at(1).text(), 'Traffic resp/s').to.be.equal('Out: 19');

		wrapper.unmount();
	});
});
