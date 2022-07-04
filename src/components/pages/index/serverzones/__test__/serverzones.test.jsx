/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import { ServerZones } from '../serverzones.jsx';
import utils from '../../../../../utils.js';

describe('<ServerZones IndexPage />', () => {
	describe('render()', () => {
		it('empty data', () => {
			const wrapper = shallow(<ServerZones data={{}} />);
			const indexBox = wrapper.find('IndexBox');

			expect(indexBox.prop('title'), 'IndexBox title').to.be.equal('HTTP Zones');
			expect(indexBox.prop('status'), 'IndexBox status').to.be.equal('ok');
			expect(indexBox.prop('href'), 'IndexBox href').to.be.equal('#server_zones');
			expect(indexBox.children(), 'IndexBox children length').to.have.lengthOf(1);
			expect(indexBox.childAt(0).name(), 'AlertsCount').to.be.equal('AlertsCount');
			expect(indexBox.childAt(0).prop('href'), 'AlertsCount href').to.be.equal('#server_zones');
			expect(indexBox.childAt(0).prop('total'), 'AlertsCount total').to.be.equal(0);
			expect(indexBox.childAt(0).prop('warnings'), 'AlertsCount warnings').to.be.equal(0);
			expect(indexBox.childAt(0).prop('alerts'), 'AlertsCount alerts').to.be.equal(0);

			wrapper.unmount();
		});

		it('with server_zones', () => {
			stub(utils, 'formatReadableBytes').callsFake(a => a);

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
				<ServerZones { ...props } />
			);
			let indexBox = wrapper.find('IndexBox');

			expect(indexBox.prop('status'), 'IndexBox status').to.be.equal('warning');
			expect(indexBox.children(), 'IndexBox children length').to.have.lengthOf(2);
			expect(indexBox.childAt(0).prop('total'), 'AlertsCount total').to.be.equal(200);
			expect(indexBox.childAt(0).prop('warnings'), 'AlertsCount warnings').to.be.equal(5);
			expect(indexBox.childAt(0).prop('alerts'), 'AlertsCount alerts').to.be.equal(15);
			expect(indexBox.childAt(1).type(), 'trafficBlock').to.be.equal('div');
			expect(indexBox.childAt(1).childAt(1).text(), 'trafficBlock, row 2, text').to.be.equal('In: 0');
			expect(indexBox.childAt(1).childAt(2).text(), 'trafficBlock, row 3, text').to.be.equal('Out: 0');

			props.data.server_zones.__STATS.traffic = {
				in: 50,
				out: 45
			};
			wrapper.setProps(props);
			indexBox = wrapper.find('IndexBox');

			expect(indexBox.childAt(1).childAt(1).text(), 'trafficBlock, row 2, text').to.be.equal('In: 50/s');
			expect(indexBox.childAt(1).childAt(2).text(), 'trafficBlock, row 3, text').to.be.equal('Out: 45/s');
			expect(utils.formatReadableBytes.calledTwice, 'formatReadableBytes called twice').to.be.true;
			expect(utils.formatReadableBytes.args[0][0], 'formatReadableBytes call 1, arg').to.be.equal(50);
			expect(utils.formatReadableBytes.args[1][0], 'formatReadableBytes call 2, arg').to.be.equal(45);

			utils.formatReadableBytes.restore();
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

			expect(indexBox.prop('status'), 'IndexBox status').to.be.equal('danger');
			expect(indexBox.childAt(0).prop('total'), 'AlertsCount total').to.be.equal(1200);
			expect(indexBox.childAt(0).prop('warnings'), 'AlertsCount warnings').to.be.equal(35);
			expect(indexBox.childAt(0).prop('alerts'), 'AlertsCount alerts').to.be.equal(22);

			wrapper.unmount();
		});
	});
});
