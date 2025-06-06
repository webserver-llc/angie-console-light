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
import { ServerZones } from '../serverzones.jsx';
import utils from '../../../../../utils.js';
import HumanReadableBytes from '#/components/human-readable-bytes/human-readable-bytes.jsx';

describe('<ServerZones IndexPage />', () => {
	describe('render()', () => {
		it('empty data', () => {
			const wrapper = shallow(<ServerZones data={{}} />);
			const indexBox = wrapper.find('IndexBox');

			// IndexBox title
			expect(indexBox.prop('title')).toBe('HTTP Zones');
			// IndexBox status
			expect(indexBox.prop('status')).toBe('ok');
			// IndexBox href
			expect(indexBox.prop('href')).toBe('#server_zones');
			// IndexBox children length
			expect(indexBox.children()).toHaveLength(1);
			// AlertsCount
			expect(indexBox.childAt(0).name()).toBe('AlertsCount');
			// AlertsCount href
			expect(indexBox.childAt(0).prop('href')).toBe('#server_zones');
			// AlertsCount total
			expect(indexBox.childAt(0).prop('total')).toBe(0);
			// AlertsCount warnings
			expect(indexBox.childAt(0).prop('warnings')).toBe(0);
			// AlertsCount alerts
			expect(indexBox.childAt(0).prop('alerts')).toBe(0);

			wrapper.unmount();
		});

		it('with server_zones', () => {
			jest.spyOn(utils, 'formatReadableBytes').mockClear().mockImplementation(a => a);

			const props = {
				data: {
					server_zones: {
						__STATS: {
							total: 200,
							warnings: 5,
							alerts: 15,
							traffic: {}
						}
					}
				},
				store: {
					__STATUSES: {
						server_zones: {
							status: 'warning'
						}
					}
				}
			};
			const wrapper = shallow(
				<ServerZones {...props} />
			);
			let indexBox = wrapper.find('IndexBox');

			// IndexBox status
			expect(indexBox.prop('status')).toBe('warning');
			// IndexBox children length
			expect(indexBox.children()).toHaveLength(2);
			// AlertsCount total
			expect(indexBox.childAt(0).prop('total')).toBe(200);
			// AlertsCount warnings
			expect(indexBox.childAt(0).prop('warnings')).toBe(5);
			// AlertsCount alerts
			expect(indexBox.childAt(0).prop('alerts')).toBe(15);
			// trafficBlock
			expect(indexBox.childAt(1).type()).toBe('div');
			// trafficBlock, row 2, text
			expect(indexBox.childAt(1).childAt(1).text()).toBe(`In: <${HumanReadableBytes.name} />`);
			expect(indexBox.childAt(1).childAt(1).find(HumanReadableBytes).props().value).toBeUndefined();
			// trafficBlock, row 3, text
			expect(indexBox.childAt(1).childAt(2).text()).toBe(`Out: <${HumanReadableBytes.name} />`);
			expect(indexBox.childAt(1).childAt(2).find(HumanReadableBytes).props().value).toBeUndefined();

			props.data.server_zones.__STATS.traffic = {
				in: 50,
				out: 45
			};
			wrapper.setProps(props);
			indexBox = wrapper.find('IndexBox');

			// traffic in row
			expect(indexBox.childAt(1).childAt(1).text()).toBe(`In: <${HumanReadableBytes.name} />`);
			expect(indexBox.childAt(1).childAt(1).find(HumanReadableBytes).props().value).toBe(props.data.server_zones.__STATS.traffic.in);
			expect(indexBox.childAt(1).childAt(1).find(HumanReadableBytes).props().postfix).toBe('/sec');
			// traffic out row
			expect(indexBox.childAt(1).childAt(2).text()).toBe(`Out: <${HumanReadableBytes.name} />`);
			expect(indexBox.childAt(1).childAt(2).find(HumanReadableBytes).props().value).toBe(props.data.server_zones.__STATS.traffic.out);
			expect(indexBox.childAt(1).childAt(2).find(HumanReadableBytes).props().postfix).toBe('/sec');

			utils.formatReadableBytes.mockRestore();
			wrapper.unmount();
		});

		it('with location_zones', () => {
			const wrapper = shallow(
				<ServerZones
					data={{
						server_zones: {
							__STATS: {
								total: 200,
								warnings: 5,
								alerts: 15,
								traffic: {}
							}
						},
						location_zones: {
							__STATS: {
								total: 1000,
								warnings: 30,
								alerts: 7
							}
						}
					}}
					store={{
						__STATUSES: {
							server_zones: {
								status: 'warning'
							},
							location_zones: {
								status: 'danger'
							}
						}
					}}
				/>
			);
			const indexBox = wrapper.find('IndexBox');

			// IndexBox status
			expect(indexBox.prop('status')).toBe('danger');
			// AlertsCount total
			expect(indexBox.childAt(0).prop('total')).toBe(1200);
			// AlertsCount warnings
			expect(indexBox.childAt(0).prop('warnings')).toBe(35);
			// AlertsCount alerts
			expect(indexBox.childAt(0).prop('alerts')).toBe(22);

			wrapper.unmount();
		});
	});
});
