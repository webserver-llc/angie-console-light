/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
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
				data={ data }
				store={ store }
			/>
		);
		const indexBox = wrapper.find('IndexBox');

		expect(indexBox.prop('title'), 'IndexBox title').to.be.equal('Resolvers');
		expect(indexBox.prop('status'), 'IndexBox status').to.be.equal('ok');
		expect(indexBox.prop('href'), 'IndexBox href').to.be.equal('#resolvers');

		const alertsCount = indexBox.find('AlertsCount');

		expect(alertsCount.prop('href'), 'AlertsCount href').to.be.equal('#resolvers');
		expect(alertsCount.prop('total'), 'AlertsCount total').to.be.equal(100);
		expect(alertsCount.prop('alerts'), 'AlertsCount alerts').to.be.equal(3);

		let traffic = indexBox.find('p');

		expect(traffic.at(0).text(), 'Traffic req/s').to.be.equal('Req/s: 0');
		expect(traffic.at(1).text(), 'Traffic resp/s').to.be.equal('Resp/s: 0');

		data.resolvers.__STATS.traffic = { in: 20, out: 19 };
		wrapper.setProps({ data, store });
		traffic = wrapper.find('IndexBox p');

		expect(traffic.at(0).text(), 'Traffic req/s').to.be.equal('Req/s: 20');
		expect(traffic.at(1).text(), 'Traffic resp/s').to.be.equal('Resp/s: 19');

		wrapper.unmount();
	});
});
