/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
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
				data={ data }
				store={ store }
			/>
		);
		const indexBox = wrapper.find('IndexBox');

		expect(indexBox.prop('title'), 'IndexBox title').to.be.equal('Caches');
		expect(indexBox.prop('status'), 'IndexBox status').to.be.equal('ok');
		expect(indexBox.prop('href'), 'IndexBox href').to.be.equal('#caches');

		const alertsCount = indexBox.find('AlertsCount');

		expect(alertsCount.prop('href'), 'AlertsCount href').to.be.equal('#caches');
		expect(alertsCount.prop('total'), 'AlertsCount total').to.be.equal(100);
		expect(alertsCount.prop('alerts'), 'AlertsCount alerts').to.be.equal(3);
		expect(alertsCount.prop('warnings'), 'AlertsCount warnings').to.be.equal(5);

		const states = wrapper.find('p');

		expect(states.at(0).childAt(0).name(), 'Icon 1').to.be.equal('Icon');
		expect(states.at(0).childAt(0).prop('type'), 'Icon 1, type').to.be.equal('sun');
		expect(states.at(0).childAt(0).prop('className'), 'Icon 1, className').to.be.equal(styles['icon']);
		expect(states.at(0).childAt(1).text(), 'state label 1').to.be.equal('Warm: 10');
		expect(states.at(1).childAt(0).name(), 'Icon 2').to.be.equal('Icon');
		expect(states.at(1).childAt(0).prop('type'), 'Icon 2, type').to.be.equal('snowflake');
		expect(states.at(1).childAt(0).prop('className'), 'Icon 2, className').to.be.equal(`${ styles['icon'] } ${ styles['snowflakeIcon'] }`);
		expect(states.at(1).childAt(1).text(), 'state label 2').to.be.equal('Cold: 30');

		wrapper.unmount();
	});
});
