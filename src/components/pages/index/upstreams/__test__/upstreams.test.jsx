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
import { UpstreamsBox, Upstreams } from '../upstreams.jsx';
import styles from '../style.css';

describe('<UpstreamsBox IndexPage />', () => {
	it('render()', () => {
		const props = {
			title: 'test_title',
			stats: {
				total: 99,
				warnings: 0,
				alerts: 1,
				servers: {
					all: 3,
					up: 3,
					failed: 0
				}
			},
			status: 'ok',
			href: '#test_block'
		};
		const wrapper = shallow(<UpstreamsBox {...props} />);
		let indexBox = wrapper.find('IndexBox');

		// IndexBox title
		expect(indexBox.prop('title')).toBe('test_title');
		// IndexBox status
		expect(indexBox.prop('status')).toBe('ok');
		// IndexBox href
		expect(indexBox.prop('href')).toBe('#test_block');
		// AlertsCount
		expect(indexBox.childAt(0).name()).toBe('AlertsCount');
		// AlertsCount total
		expect(indexBox.childAt(0).prop('total')).toBe(99);
		// AlertsCount warnings
		expect(indexBox.childAt(0).prop('warnings')).toBe(0);
		// AlertsCount alerts
		expect(indexBox.childAt(0).prop('alerts')).toBe(1);
		// AlertsCount href
		expect(indexBox.childAt(0).prop('href')).toBe('#test_block');
		// all / up row
		expect(indexBox.childAt(2).text()).toBe('Peer: 3 / Active: 3');
		expect(indexBox.childAt(3).prop('className')).toBeUndefined();
		// failed row
		expect(indexBox.childAt(3).text()).toBe('Problems: 0');

		props.stats.servers.up = 2;
		props.stats.servers.failed = 1;
		wrapper.setProps(props);
		indexBox = wrapper.find('IndexBox');

		// all / up row
		expect(indexBox.childAt(2).text()).toBe('Peer: 3 / Active: 2');
		// failed row className
		expect(indexBox.childAt(3).prop('className')).toBe(styles.red);
		// failed row
		expect(indexBox.childAt(3).text()).toBe('Problems: 1');

		wrapper.unmount();
	});
});

describe('<Upstreams IndexPage />', () => {
	it('render()', () => {
		const wrapper = shallow(
			<Upstreams
				data={{
					upstreams: {
						__STATS: 'test_stats'
					}
				}}
				store={{
					__STATUSES: {
						upstreams: {
							status: 'ok'
						}
					}
				}}
			/>
		);
		const box = wrapper.find('UpstreamsBox');

		// UpstreamsBox title
		expect(box.prop('title')).toBe('HTTP Upstreams');
		// UpstreamsBox stats
		expect(box.prop('stats')).toBe('test_stats');
		// UpstreamsBox status
		expect(box.prop('status')).toBe('ok');
		// UpstreamsBox href
		expect(box.prop('href')).toBe('#upstreams');

		wrapper.unmount();
	});
});
