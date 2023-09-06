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
	AboutAngieTooltip,
	AboutAngie	
} from '../aboutangie.jsx';
import styles from '../style.css';
import tooltipStyles from '../../../../tooltip/style.css';
import utils from '../../../../../utils.js';
import tooltips from '../../../../../tooltips/index.jsx';
import { apiUtils } from '../../../../../api/index.js';
import { docs } from '../utils.js';

describe('<AboutAngieTooltip IndexPage />', () => {
	describe('this.renderLinkToDocs()', () => {
		it('nothing render', () => {
			const data = {
				angie: {
					address: 'localhost',
					load_time: 1599571720025
				}
			};
			const wrapper = shallow(
				<AboutAngie
					data={ data }
					className="test"
				/>
			);
			let instance = wrapper.instance();
			expect(instance.renderLinkToDocs()).to.be.null
			wrapper.unmount();
		});

		it('only version', () => {
			const data = {
				angie: {
					version: '0.0.1',
					address: 'localhost',
					load_time: 1599571720025
				}
			};
			const wrapper = shallow(
				<AboutAngie
					data={ data }
					className="test"
				/>
			);
			let instance = wrapper.instance();
			const link = shallow(instance.renderLinkToDocs())
			
			expect(link.prop('href')).to.be.equal(docs.default);
			expect(link.text()).to.be.equal(data.angie.version);
			
			wrapper.unmount();
		});

		it('build and version', () => {
			stub(apiUtils, 'isAngiePro').callsFake(() => true);
			
			const data = {
				angie: {
					build: 'PRO',
					version: '0.0.1',
					address: 'localhost',
					load_time: 1599571720025
				}
			};
			const wrapper = shallow(
				<AboutAngie
					data={ data }
					className="test"
				/>
			);
			let instance = wrapper.instance();
			const link = shallow(instance.renderLinkToDocs())
			
			expect(link.prop('href')).to.be.equal(docs.pro);
			expect(link.text()).to.be.equal(`${data.angie.version} ${data.angie.build}`);
			
			wrapper.unmount();
			apiUtils.isAngiePro.restore();
		});
	});
	
	it('returning component', () => {
		stub(utils, 'formatDate').callsFake(() => 'test_formatDate_result');

		const data = {
			angie: {
				load_timestamp: 1599571723125,
				generation: 11
			}
		};
		const wrapper = shallow(
			<AboutAngieTooltip
				data={ data }
			/>
		);
		let children = wrapper.children();

		expect(children, 'child length').to.have.lengthOf(1);
		expect(children.at(0).prop('className'), 'child 1 className').to.be.equal(tooltipStyles['row']);
		expect(children.at(0).text(), 'child 1 text').to.be.equal('Reloads: 11');

		utils.formatDate.restore();
		wrapper.unmount();
	});
});

describe('<AboutAngie IndexPage />', () => {
	it('render()', () => {
		stub(Date, 'now').callsFake(() => 1599571723125);
		stub(Date, 'parse').callsFake(a => a);
		stub(utils, 'formatUptime').callsFake(() => 'test_formatUptime_result');
		stub(apiUtils, 'isAngiePro').callsFake(() => true);
		stub(tooltips, 'useTooltip').callsFake(() => ({
			prop_from_useTooltip: true
		}));

		const data = {
			angie: {
				build: 'PRO',
				version: '0.0.1',
				address: 'localhost',
				load_time: 1599571720025
			}
		};
		const wrapper = shallow(
			<AboutAngie
				data={ data }
				className="test"
			/>
		);

		expect(wrapper.find('IndexBox').prop('className'), 'IndexBox className').to.be.equal('test');

		const link = wrapper.find(`a.${ styles['release'] }`);

		expect(link, 'link length').to.have.lengthOf(1);
		expect(link.prop('href'), 'link href')
			.to.be.equal(docs.pro);
		expect(link.prop('target'), 'link target').to.be.equal('_blank');
		expect(link.text(), 'link text').to.be.equal('0.0.1 PRO');

		const table = wrapper.find('table');

		expect(table, 'table length').to.have.lengthOf(1);
		expect(table.prop('className'), 'table className').to.be.equal(styles['table']);
		expect(table.childAt(0).childAt(1).text(), 'table, row 1, cell 2 (angie address').to.be.equal('localhost');

		const tooltip = table.childAt(1).childAt(1).childAt(0);

		expect(tooltip.prop('className'), 'tooltip className').to.be.equal(styles['uptime']);
		expect(tooltip.prop('prop_from_useTooltip'), 'tooltip prop from useTooltip').to.be.true;
		expect(tooltips.useTooltip.calledOnce, 'useTooltip called once').to.be.true;
		expect(tooltips.useTooltip.args[0][0].type.displayName, 'useTooltip arg')
			.to.be.equal('AboutAngieTooltip');
		expect(tooltips.useTooltip.args[0][0].props.data, 'useTooltip arg prop')
			.to.be.deep.equal(data);
		expect(tooltip.text(), 'tooltip text').to.be.equal('test_formatUptime_result');
		expect(Date.parse.calledOnce, 'formatUptime called once').to.be.true;
		expect(Date.parse.args[0][0], 'formatUptime call 1, arg').to.be.equal(1599571720025);
		expect(utils.formatUptime.calledOnce, 'formatUptime called once').to.be.true;
		expect(utils.formatUptime.args[0][0], 'formatUptime arg').to.be.equal(3100);

		Date.now.restore();
		Date.parse.restore();
		apiUtils.isAngiePro.restore();
		utils.formatUptime.restore();
		tooltips.useTooltip.restore();
		wrapper.unmount();
	});
});
