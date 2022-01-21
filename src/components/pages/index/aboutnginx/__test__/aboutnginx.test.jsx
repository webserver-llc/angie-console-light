/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import {
	AboutNginxTooltip,
	AboutNginx
} from '../aboutnginx.jsx';
import styles from '../style.css';
import tooltipStyles from '../../../../tooltip/style.css';
import utils from '../../../../../utils.js';
import tooltips from '../../../../../tooltips/index.jsx';

describe('<AboutNginxTooltip IndexPage />', () => {
	it('returning component', () => {
		stub(utils, 'formatDate').callsFake(() => 'test_formatDate_result');

		const data = {
			nginx: {
				load_timestamp: 1599571723125,
				generation: 11
			}
		};
		const wrapper = shallow(
			<AboutNginxTooltip
				data={ data }
			/>
		);
		let children = wrapper.children();

		expect(children, 'child length').to.have.lengthOf(2);
		expect(children.at(0).prop('className'), 'child 1 className').to.be.equal(tooltipStyles['row']);
		expect(children.at(0).text(), 'child 1 text').to.be.equal('Last (re)load: test_formatDate_result');
		expect(utils.formatDate.calledOnce, 'formatDate called once').to.be.true;
		expect(utils.formatDate.args[0][0], 'formatDate arg').to.be.equal(1599571723125);
		expect(children.at(1).prop('className'), 'child 2 className').to.be.equal(tooltipStyles['row']);
		expect(children.at(1).text(), 'child 2 text').to.be.equal('Reloads: 11');

		data.processes = { respawned: 20 };
		wrapper.setProps({ data });
		children = wrapper.children();

		expect(children, 'child length').to.have.lengthOf(3);
		expect(children.at(2).prop('className'), 'child 3 className').to.be.equal(tooltipStyles['row']);
		expect(children.at(2).text(), 'child 3 text').to.be.equal('Respawned: 20');

		utils.formatDate.restore();
		wrapper.unmount();
	});
});

describe('<AboutNginx IndexPage />', () => {
	it('render()', () => {
		stub(Date, 'parse').callsFake(a => a);
		stub(utils, 'formatUptime').callsFake(() => 'test_formatUptime_result');
		stub(tooltips, 'useTooltip').callsFake(() => ({
			prop_from_useTooltip: true
		}));

		const data = {
			nginx: {
				build: 1,
				version: '0.0.1',
				address: 'localhost',
				ppid: 12345,
				timestamp: 1599571723125,
				load_timestamp: 1599571720025
			}
		};
		const wrapper = shallow(
			<AboutNginx
				data={ data }
				className="test"
			/>
		);

		expect(wrapper.find('IndexBox').prop('className'), 'IndexBox className').to.be.equal('test');

		const link = wrapper.find(`a.${ styles['release'] }`);

		expect(link, 'link length').to.have.lengthOf(1);
		expect(link.prop('href'), 'link href')
			.to.be.equal('https://www.nginx.com/resources/admin-guide/nginx-plus-releases/');
		expect(link.prop('target'), 'link target').to.be.equal('_blank');
		expect(link.text(), 'link text').to.be.equal('1 (0.0.1)');

		const table = wrapper.find('table');

		expect(table, 'table length').to.have.lengthOf(1);
		expect(table.prop('className'), 'table className').to.be.equal(styles['table']);
		expect(table.childAt(0).childAt(1).text(), 'table, row 1, cell 2 (nginx address').to.be.equal('localhost');
		expect(table.childAt(1).childAt(1).text(), 'table, row 2, cell 2 (nginx ppid').to.be.equal('12345');

		const tooltip = table.childAt(2).childAt(1).childAt(0);

		expect(tooltip.prop('className'), 'tooltip className').to.be.equal(styles['uptime']);
		expect(tooltip.prop('prop_from_useTooltip'), 'tooltip prop from useTooltip').to.be.true;
		expect(tooltips.useTooltip.calledOnce, 'useTooltip called once').to.be.true;
		expect(tooltips.useTooltip.args[0][0].nodeName.displayName, 'useTooltip arg')
			.to.be.equal('AboutNginxTooltip');
		expect(tooltips.useTooltip.args[0][0].attributes.data, 'useTooltip arg prop')
			.to.be.deep.equal(data);
		expect(tooltip.text(), 'tooltip text').to.be.equal('test_formatUptime_result');
		expect(Date.parse.calledTwice, 'formatUptime called twice').to.be.true;
		expect(Date.parse.args[0][0], 'formatUptime call 1, arg').to.be.equal(1599571723125);
		expect(Date.parse.args[1][0], 'formatUptime call 2, arg').to.be.equal(1599571720025);
		expect(utils.formatUptime.calledOnce, 'formatUptime called once').to.be.true;
		expect(utils.formatUptime.args[0][0], 'formatUptime arg').to.be.equal(3100);

		Date.parse.restore();
		utils.formatUptime.restore();
		tooltips.useTooltip.restore();
		wrapper.unmount();
	});
});
