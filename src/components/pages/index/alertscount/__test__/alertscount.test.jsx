/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import AlertsCount from '../alertscount.jsx';
import styles from '../style.css';

describe('<AlertsCount IndexPage />', () => {
	it('shouldComponentUpdate()', () => {
		const wrapper = shallow(
			<AlertsCount
				total={ 100 }
				alerts={ 9 }
				warnings={ 42 }
			/>
		);
		const instance = wrapper.instance();

		expect(instance.shouldComponentUpdate({
			total: 100,
			alerts: 9,
			warnings: 42
		}), 'same props').to.be.false;
		expect(instance.shouldComponentUpdate({
			total: 10,
			alerts: 9,
			warnings: 42
		}), 'another total').to.be.true;
		expect(instance.shouldComponentUpdate({
			total: 100,
			alerts: 99,
			warnings: 42
		}), 'another alerts').to.be.true;
		expect(instance.shouldComponentUpdate({
			total: 100,
			alerts: 9,
			warnings: 2
		}), 'another warnings').to.be.true;

		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(
			<AlertsCount
				total={ 100 }
				alerts={ 0 }
				warnings={ 0 }
				href="test_href"
			/>
		);
		const instance = wrapper.instance();

		expect(wrapper.prop('className'), 'root el className').to.be.equal(styles['alerts']);
		expect(wrapper.childAt(0).prop('className'), '"total" el className').to.be.equal(styles['num']);
		expect(wrapper.childAt(0).childAt(0).prop('className'), '"total" el, child 1 className')
			.to.be.equal(styles['label']);
		expect(wrapper.childAt(0).childAt(1).text(), '"total" el, child 2 text').to.be.equal('100');
		expect(wrapper.childAt(2).prop('className'), '"alerts/warnings" el className').to.be.equal(styles['ok']);
		expect(wrapper.childAt(2).prop('href'), '"alerts/warnings" el href').to.be.equal('test_href');
		expect(wrapper.childAt(2).childAt(0).prop('className'), '"alerts/warnings" el, child 1 className')
			.to.be.equal(styles['label']);
		expect(wrapper.childAt(2).childAt(0).text(), '"alerts/warnings" el, child 1 text')
			.to.be.equal('Problems');
		expect(wrapper.childAt(2).childAt(1).text(), '"alerts/warnings" el, child 2 text').to.be.equal('0');

		wrapper.setProps({
			total: 100,
			alerts: 0,
			warnings: 11
		});

		expect(wrapper.childAt(2).prop('className'), '"alerts/warnings" el className').to.be.equal(styles['warning']);
		expect(wrapper.childAt(2).childAt(0).text(), '"alerts/warnings" el, child 1 text')
			.to.be.equal('Warnings');
		expect(wrapper.childAt(2).childAt(1).text(), '"alerts/warnings" el, child 2 text').to.be.equal('11');

		wrapper.setProps({
			total: 100,
			alerts: 2,
			warnings: 11
		});

		expect(wrapper.childAt(2).prop('className'), '"alerts/warnings" el className').to.be.equal(styles['alert']);
		expect(wrapper.childAt(2).childAt(0).text(), '"alerts/warnings" el, child 1 text')
			.to.be.equal('Alerts');
		expect(wrapper.childAt(2).childAt(1).text(), '"alerts/warnings" el, child 2 text').to.be.equal('2');

		wrapper.unmount();
	});
});
