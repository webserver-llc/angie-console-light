/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import { StreamZones } from '../streamzones.jsx';
import * as utils from '../../../../../utils.js';

describe('<StreamZones IndexPage />', () => {
	it('render()', () => {
		stub(utils, 'formatReadableBytes').callsFake(a => a);

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
		const wrapper = shallow(<StreamZones { ...props } />);
		let indexBox = wrapper.find('IndexBox');

		expect(indexBox.prop('title'), 'IndexBox title').to.be.equal('TCP/UDP Zones');
		expect(indexBox.prop('status'), 'IndexBox status').to.be.equal('danger');
		expect(indexBox.prop('href'), 'IndexBox href').to.be.equal('#tcp_zones');

		indexBox = indexBox.childAt(0);

		expect(indexBox.childAt(0).text(), 'total row').to.be.equal('Conn total: 10');
		expect(indexBox.childAt(1).text(), 'current row').to.be.equal('Conn current: 1');
		expect(indexBox.childAt(2).text(), 'conn/s row').to.be.equal('Conn/s: 3');
		expect(indexBox.childAt(4).text(), 'traffic in row').to.be.equal('In: 0');
		expect(indexBox.childAt(5).text(), 'traffic out row').to.be.equal('Out: 0');

		props.data.server_zones.__STATS.traffic = {
			in: 3,
			out: 2
		};
		wrapper.setProps(props);
		indexBox = wrapper.find('IndexBox').childAt(0);

		expect(indexBox.childAt(4).text(), 'traffic in row').to.be.equal('In: 3/s');
		expect(indexBox.childAt(5).text(), 'traffic out row').to.be.equal('Out: 2/s');
		expect(utils.formatReadableBytes.calledTwice, 'formatReadableBytes called twice').to.be.true;
		expect(utils.formatReadableBytes.args[0][0], 'formatReadableBytes call 1, arg').to.be.equal(3);
		expect(utils.formatReadableBytes.args[1][0], 'formatReadableBytes call 2, arg').to.be.equal(2);

		utils.formatReadableBytes.restore();
		wrapper.unmount();
	});
});
