/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import PeerTooltip from '../PeerTooltip.jsx';
import * as utils from '../../../utils.js';
import styles from '../tooltip.css';

describe('<PeerTooltip />', () => {
	before(() => {
		stub(utils, 'formatDate').callsFake(() => 'formatted_date');
		stub(utils, 'formatUptime').callsFake(() => 'formatted_uptime');
	});

	beforeEach(() => {
		utils.formatDate.resetHistory();
		utils.formatUptime.resetHistory();
	});

	after(() => {
		utils.formatDate.restore();
		utils.formatUptime.restore();
	});

	it('state = unavail, health_status = null, with name, backup, isHttp and downstart', () => {
		const wrapper = shallow(
			<PeerTooltip
				peer={{
					state: 'unavail',
					health_status: null,
					name: 'test_1',
					backup: true,
					server: 'test_server',
					downtime: 'downtime_ts',
					isHttp: true,
					downstart: 'downstart_ts'
				}}
			/>
		);

		expect(wrapper.children(), 'content length').to.have.lengthOf(7);
		expect(wrapper.childAt(0).prop('className'), 'peer name, className').to.be.equal(styles['row']);
		expect(wrapper.childAt(0).text(), 'peer name, text').to.be.equal('test_1');
		expect(wrapper.childAt(1).name(), 'peer server, html tag').to.be.equal('h5');
		expect(wrapper.childAt(1).prop('className'), 'peer server, className').to.be.equal(styles['h5']);
		expect(wrapper.childAt(1).text(), 'peer server, text').to.be.equal('b test_server');
		expect(
			wrapper.childAt(2).prop('className'),
			'peer state wrap, className'
		).to.be.equal(styles['row']);
		expect(
			wrapper.childAt(2).childAt(0).childAt(0).prop('className'),
			'peer state, className'
		).to.be.equal(styles['status_unavail']);
		expect(
			wrapper.childAt(2).childAt(0).text(),
			'peer state, text'
		).to.be.equal('failed (Passive health check failed)');
		expect(
			wrapper.childAt(3).prop('className'),
			'peer type, className'
		).to.be.equal(styles['row']);
		expect(
			wrapper.childAt(3).text(),
			'peer type, text'
		).to.be.equal('Type: backup');
		expect(
			wrapper.childAt(4).prop('className'),
			'peer downtime, className'
		).to.be.equal(styles['row']);
		expect(
			wrapper.childAt(4).text(),
			'peer downtime, text'
		).to.be.equal('Total downtime: formatted_uptime');
		expect(utils.formatUptime.calledOnce, 'formatUptime called once').to.be.true;
		expect(utils.formatUptime.args[0][0], 'formatUptime call arg').to.be.equal('downtime_ts');
		expect(
			wrapper.childAt(5).prop('className'),
			'peer lastcheck, className'
		).to.be.equal(styles['row']);
		expect(
			wrapper.childAt(5).text(),
			'peer lastcheck, text'
		).to.be.equal('Last check: unknown');
		expect(
			wrapper.childAt(6).prop('className'),
			'peer downstart, className'
		).to.be.equal(styles['row']);
		expect(
			wrapper.childAt(6).text(),
			'peer downstart, text'
		).to.be.equal('Down since: formatted_date ');
		expect(utils.formatDate.calledOnce, 'formatDate called once').to.be.true;
		expect(utils.formatDate.args[0][0], 'formatDate call arg').to.be.equal('downstart_ts');

		wrapper.unmount();
	});

	it('state = unhealthy, health_status = true, no name, not backup, isHttp, no downstart', () => {
		const wrapper = shallow(
			<PeerTooltip
				peer={{
					state: 'unhealthy',
					health_status: true,
					backup: false,
					server: 'test_server',
					downtime: 'downtime_ts',
					isHttp: true
				}}
			/>
		);

		expect(wrapper.children(), 'content length').to.have.lengthOf(4);
		expect(wrapper.childAt(0).name(), 'peer server, html tag').to.be.equal('h5');
		expect(wrapper.childAt(0).prop('className'), 'peer server, className').to.be.equal(styles['h5']);
		expect(wrapper.childAt(0).text(), 'peer server, text').to.be.equal('test_server');
		expect(
			wrapper.childAt(1).prop('className'),
			'peer state wrap, className'
		).to.be.equal(styles['row']);
		expect(
			wrapper.childAt(1).childAt(0).childAt(0).prop('className'),
			'peer state, className'
		).to.be.equal(styles['status_unavail']);
		expect(
			wrapper.childAt(1).childAt(0).text(),
			'peer state, text'
		).to.be.equal('failed (Active health check failed)');
		expect(
			wrapper.childAt(3).prop('className'),
			'peer lastcheck, className'
		).to.be.equal(styles['row']);
		expect(
			wrapper.childAt(3).text(),
			'peer lastcheck, text'
		).to.be.equal('Last check: passed');
		expect(utils.formatDate.notCalled, 'formatDate not called').to.be.true;

		wrapper.unmount();
	});

	it('state = up, health_status = false, no name, not backup, not isHttp, no downstart', () => {
		const wrapper = shallow(
			<PeerTooltip
				peer={{
					state: 'up',
					health_status: false,
					backup: false,
					server: 'test_server',
					downtime: 'downtime_ts',
					isHttp: false
				}}
			/>
		);

		expect(wrapper.children(), 'content length').to.have.lengthOf(4);
		expect(
			wrapper.childAt(1).prop('className'),
			'peer state wrap, className'
		).to.be.equal(styles['row']);
		expect(
			wrapper.childAt(1).childAt(0).prop('className'),
			'peer state, className'
		).to.be.equal(styles['status_up']);
		expect(wrapper.childAt(1).childAt(0).text(), 'peer state, text').to.be.equal('up');
		expect(
			wrapper.childAt(3).prop('className'),
			'peer lastcheck, className'
		).to.be.equal(styles['row']);
		expect(
			wrapper.childAt(3).text(),
			'peer lastcheck, text'
		).to.be.equal('Last check: failed');
		expect(utils.formatDate.notCalled, 'formatDate not called').to.be.true;

		wrapper.unmount();
	});
});
