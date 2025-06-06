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
import { StreamZones } from '../streamzones.jsx';
import HumanReadableBytes from '#/components/human-readable-bytes/human-readable-bytes.jsx';

describe('<StreamZones IndexPage />', () => {
	it('render()', () => {
		const props = {
			data: {
				server_zones: {
					__STATS: {
						conn_total: 10,
						conn_current: 1,
						conn_s: 3,
						traffic: {}
					}
				}
			},
			store: {
				__STATUSES: {
					tcp_zones: {
						status: 'danger'
					}
				}
			}
		};
		const wrapper = shallow(<StreamZones {...props} />);
		let indexBox = wrapper.find('IndexBox');

		// IndexBox title
		expect(indexBox.prop('title')).toBe('TCP/UDP Zones');
		// IndexBox status
		expect(indexBox.prop('status')).toBe('danger');
		// IndexBox href
		expect(indexBox.prop('href')).toBe('#tcp_zones');
		// total row
		expect(indexBox.childAt(0).text()).toBe('Conn total: 10');
		// current row
		expect(indexBox.childAt(1).text()).toBe('Conn current: 1');
		// conn/s row
		expect(indexBox.childAt(2).text()).toBe('Conn/s: 3');
		// traffic in row
		expect(indexBox.childAt(4).text()).toBe(`In: <${HumanReadableBytes.name} />`);
		expect(indexBox.childAt(4).find(HumanReadableBytes).props().value).toBeUndefined();
		// traffic out row
		expect(indexBox.childAt(5).text()).toBe(`Out: <${HumanReadableBytes.name} />`);
		expect(indexBox.childAt(5).find(HumanReadableBytes).props().value).toBeUndefined();

		props.data.server_zones.__STATS.traffic = {
			in: 3,
			out: 2
		};
		wrapper.setProps(props);
		indexBox = wrapper.find('IndexBox');

		// traffic in row
		expect(indexBox.childAt(4).text()).toBe(`In: <${HumanReadableBytes.name} />`);
		expect(indexBox.childAt(4).find(HumanReadableBytes).props().value).toBe(props.data.server_zones.__STATS.traffic.in);
		expect(indexBox.childAt(4).find(HumanReadableBytes).props().postfix).toBe('/sec');
		// traffic out row
		expect(indexBox.childAt(5).text()).toBe(`Out: <${HumanReadableBytes.name} />`);
		expect(indexBox.childAt(5).find(HumanReadableBytes).props().value).toBe(props.data.server_zones.__STATS.traffic.out);
		expect(indexBox.childAt(5).find(HumanReadableBytes).props().postfix).toBe('/sec');

		wrapper.unmount();
	});
});
