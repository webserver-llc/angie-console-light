/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';
import { LimitConnReqConstructor } from '../constructors.jsx';
import styles from '../../../table/style.css';

describe('ServerZones Constructors', () => {
	describe('<LimitConnReqConstructor />', () => {
		it('constructor()', () => {
			const wrapper = shallow(<LimitConnReqConstructor data={{}} />);
			const instance = wrapper.instance();
			const bindSpy = spy(instance.toggleChart, 'bind');

			instance.constructor();

			expect(wrapper.state(), 'this.state').to.be.deep.equal({
				activeCharts: []
			});
			expect(bindSpy.calledOnce, 'this.toggleChart.bind called once').to.be.true;
			expect(bindSpy.args[0][0], 'this.toggleChart.bind arg').to.be.deep.equal(instance);

			bindSpy.restore();
			wrapper.unmount();
		});

		it('shouldComponentUpdate()', () => {
			const wrapper = shallow(<LimitConnReqConstructor />);
			const instance = wrapper.instance();

			expect(
				instance.shouldComponentUpdate({}, { activeCharts: [] }),
				'empty props, no active charts'
			).to.be.false;
			expect(
				instance.shouldComponentUpdate({ data: {} }, { activeCharts: [] }),
				'with props'
			).to.be.true;
			expect(
				instance.shouldComponentUpdate({}, { activeCharts: ['test'] }),
				'active charts changed'
			).to.be.true;

			wrapper.unmount();
		});

		it('toggleChart()', () => {
			const wrapper = shallow(<LimitConnReqConstructor />);
			const instance = wrapper.instance();
			const stateSpy = spy(instance, 'setState');

			instance.toggleChart('limit_req');

			expect(stateSpy.calledOnce, '[1] this.setState called').to.be.true;
			expect(stateSpy.args[0][0], '[1] this.setState arg').to.be.deep.equal({
				activeCharts: ['limit_req']
			});

			instance.toggleChart('limit_conn');

			expect(stateSpy.calledTwice, '[1] this.setState called').to.be.true;
			expect(stateSpy.args[1][0], '[1] this.setState arg').to.be.deep.equal({
				activeCharts: ['limit_req', 'limit_conn']
			});

			instance.toggleChart('limit_req');

			expect(stateSpy.calledThrice, '[1] this.setState called').to.be.true;
			expect(stateSpy.args[2][0], '[1] this.setState arg').to.be.deep.equal({
				activeCharts: ['limit_conn']
			});

			stateSpy.restore();
			wrapper.unmount();
		});

		it('getTitle()', () => {
			const wrapper = shallow(<LimitConnReqConstructor />);
			const instance = wrapper.instance();

			expect(instance.getTitle(), 'return value').to.be.a('null');

			wrapper.unmount();
		});

		it('getHeadRow()', () => {
			const wrapper = shallow(<LimitConnReqConstructor />);
			const instance = wrapper.instance();

			expect(instance.getHeadRow(), 'return value').to.be.a('null');

			wrapper.unmount();
		});

		it('getBody()', () => {
			const wrapper = shallow(<LimitConnReqConstructor />);
			const instance = wrapper.instance();

			expect(instance.getBody(), 'return value').to.be.a('null');

			wrapper.unmount();
		});

		describe('render()', () => {
			it('no data', () => {
				const wrapper = shallow(<LimitConnReqConstructor />);
				const instance = wrapper.instance();

				expect(wrapper, 'no data').to.have.lengthOf(0);

				wrapper.unmount();
			});

			it('with data', () => {
				const wrapper = shallow(<LimitConnReqConstructor data={{}} />);
				const instance = wrapper.instance();

				stub(instance, 'getTitle').callsFake(() => 'test__title');
				stub(instance, 'getHeadRow').callsFake(() => 'test__headRow');
				stub(instance, 'getBody').callsFake(() => 'test__body');

				instance.forceUpdate();

				expect(instance.getTitle.calledOnce, 'this.getTitle called once').to.be.true;
				expect(wrapper.find('h1').text(), 'title').to.be.equal('test__title');

				const table = wrapper.find('table');

				expect(table.prop('className'), 'table className').to.be.equal(
					`${ styles['table'] } ${ styles['wide'] }`
				);
				expect(instance.getHeadRow.calledOnce, 'this.getHeadRow called once').to.be.true;
				expect(table.find('thead').text(), 'table head row').to.be.equal('test__headRow');

				const tbody = table.find('tbody');

				expect(instance.getBody.calledOnce, 'this.getBody called once').to.be.true;
				expect(tbody.text(), 'table body').to.be.equal('test__body');
				expect(tbody.prop('className'), 'table body className').to.be.equal(styles['right-align']);

				instance.getTitle.restore();
				instance.getHeadRow.restore();
				instance.getBody.restore();
				wrapper.unmount();
			});
		});
	});
});
