/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import ConnectionsTooltip from '../ConnectionsTooltip.jsx';
import * as utils from '../../../utils.js';

describe('<ConnectionsTooltip />', () => {
	it('peer.selected = false', () => {
		const wrapper = shallow(
			<ConnectionsTooltip
				peer={{}}
			/>
		);

		expect(wrapper.children(), 'children length').to.have.lengthOf(1);
		expect(wrapper.childAt(0).text(), 'content').to.be.equal('Last: unknown');

		wrapper.unmount();
	});

	it('peer.selected = true', () => {
		stub(utils, 'formatDate').callsFake(() => 'formatted_date');
		stub(utils, 'formatUptime').callsFake(() => 'formatted_uptime');
		stub(Date.prototype, 'getTime').callsFake(() => 10);
		stub(Date, 'parse').callsFake(() => 8);

		const wrapper = shallow(
			<ConnectionsTooltip
				peer={{ selected: 'ts' }}
			/>
		);

		expect(wrapper.children(), 'children length').to.have.lengthOf(1);
		expect(wrapper.childAt(0).children(), 'content blocks length').to.have.lengthOf(2);
		expect(wrapper.childAt(0).childAt(0).text(), 'content blocks 1').to.be.equal('Last: formatted_date');
		expect(utils.formatDate.calledOnce, 'formatDate called').to.be.true;
		expect(utils.formatDate.args[0][0], 'formatDate call arg').to.be.equal('ts');
		expect(wrapper.childAt(0).childAt(1).text(), 'content blocks 2').to.be.equal('(formatted_uptime ago)');
		expect(Date.prototype.getTime.calledOnce, 'Date().getTime() called once').to.be.true;
		expect(Date.parse.calledOnce, 'Date.parse() called once').to.be.true;
		expect(Date.parse.args[0][0], 'Date.parse call arg').to.be.equal('ts');
		expect(utils.formatUptime.calledOnce, 'formatUptime called').to.be.true;
		expect(utils.formatUptime.args[0][0], 'formatUptime call arg').to.be.equal(2);

		utils.formatDate.restore();
		utils.formatUptime.restore();
		Date.prototype.getTime.restore();
		Date.parse.restore();
		wrapper.unmount();
	});
});
