/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import { LimitConnReqConstructor } from '../constructors.jsx';
import LimitConn, {
	Colors,
	Labels
} from '../limitconn.jsx';
import styles from '../../../table/style.css';

describe('<LimitConn />', () => {
	it('extends LimitConnReqConstructor', () => {
		expect(LimitConn.prototype).to.be.an.instanceOf(LimitConnReqConstructor);
	});

	it('getTitle()', () => {
		const wrapper = shallow(<LimitConn />);

		expect(wrapper.instance().getTitle(), 'return value').to.be.equal('Limit Conn');

		wrapper.unmount();
	});

	it('getHeadRow()', () => {
		const wrapper = shallow(<LimitConn />);
		const headRow = wrapper.instance().getHeadRow();

		expect(headRow.nodeName, 'html tag').to.be.equal('tr');
		expect(headRow.children, 'cells count').to.have.lengthOf(5);

		wrapper.unmount();
	});

	it('getBody()', () => {
		const wrapper = shallow(
			<LimitConn data={ new Map([
				['test', {
					zone: {
						passed: 78,
						rejected: 9,
						rejected_dry_run: 13
					},
					history: 'test__history'
				}], ['test_1', {
					zone: {
						passed: 1,
						rejected: 0,
						rejected_dry_run: 0
					},
					history: 'test__history_1'
				}]
			]) }
		/>);
		const instance = wrapper.instance();

		wrapper.setState({ activeCharts: ['test'] });
		stub(instance.toggleChart, 'bind').callsFake(() => 'toggleChart_bind_test');

		const body = wrapper.instance().getBody();

		expect(body, 'rows length').to.have.lengthOf(2);

		let row = body[0][0];

		expect(row.nodeName, '[group 1, row 1] html tag').to.be.equal('tr');
		expect(row.attributes.key, '[group 1, row 1] attr key').to.be.equal('data_test');
		expect(row.attributes.className, '[group 1, row 1] attr className').to.be.equal(
			`${ styles['chart-container'] } ${ styles['chart-container_active'] }`
		);
		expect(row.attributes.title, '[group 1, row 1] attr title').to.be.equal('Click to hide rate graph');
		expect(row.attributes.onClick, '[group 1, row 1] attr onClick').to.be.equal('toggleChart_bind_test');
		expect(row.children, '[group 1, row 1] children length').to.have.lengthOf(5);
		expect(row.children[0].nodeName, '[group 1, row 1] child 1, nodeName').to.be.equal('td');
		expect(row.children[0].attributes.className, '[group 1, row 1] child 1, className').to.be.equal(
			`${ styles['center-align'] } ${ styles['bdr'] } ${ styles['chart-icon'] }`
		);
		expect(row.children[0].children[0].nodeName, '[group 1, row 1] child 1, child nodeName').to.be.equal('div');
		expect(
			row.children[0].children[0].attributes.className,
			'[group 1, row 1] child 1, child className'
		).to.be.equal(styles['chart-icon__icon']);
		expect(row.children[1].nodeName, '[group 1, row 1] child 2, nodeName').to.be.equal('td');
		expect(row.children[1].attributes.className, '[group 1, row 1] child 2, className').to.be.equal(
			`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
		);
		expect(row.children[1].children[0], '[group 1, row 1] child 2, child').to.be.equal('test');
		expect(row.children[2].nodeName, '[group 1, row 1] child 3, nodeName').to.be.equal('td');
		expect(row.children[2].attributes.className, '[group 1, row 1] child 3, className')
			.to.be.equal(styles['bdr']);
		expect(row.children[2].children[0], '[group 1, row 1] child 3, child').to.be.equal('78');
		expect(row.children[3].nodeName, '[group 1, row 1] child 4, nodeName').to.be.equal('td');
		expect(row.children[3].attributes.className, '[group 1, row 1] child 4, className')
			.to.be.equal(styles['bdr']);
		expect(row.children[3].children[0], '[group 1, row 1] child 4, child').to.be.equal('9');
		expect(row.children[4].nodeName, '[group 1, row 1] child 5, nodeName').to.be.equal('td');
		expect(row.children[4].children[0], '[group 1, row 1] child 5, child').to.be.equal('13');

		row = body[0][1];

		expect(row.nodeName, '[group 1, row 2] html tag').to.be.equal('tr');
		expect(row.attributes.key, '[group 1, row 2] attr key').to.be.equal('chart_test');
		expect(row.attributes.className, '[group 1, row 2] attr className').to.be.equal(
			styles['chart-row']
		);
		expect(row.children[0].nodeName, '[group 1, row 2] child nodeName').to.be.equal('td');
		expect(row.children[0].attributes.colspan, '[group 1, row 2] child colspan').to.be.equal('5');
		expect(
			row.children[0].attributes.className,
			'[group 1, row 2] child className'
		).to.be.equal(styles['left-align']);
		expect(row.children[0].children[0].nodeName.name, '[group 1, row 2] Chart in open row').to.be.equal('Chart');
		expect(row.children[0].children[0].attributes.data, '[group 1, row 2] Chart attr data')
			.to.be.equal('test__history');
		expect(row.children[0].children[0].attributes.colors, '[group 1, row 2] Chart attr colors')
			.to.be.deep.equal(Colors);
		expect(row.children[0].children[0].attributes.labels, '[group 1, row 2] Chart attr labels')
			.to.be.deep.equal(Labels);

		row = body[1][0];

		expect(row.nodeName, '[group 2, row 1] html tag').to.be.equal('tr');
		expect(row.attributes.key, '[group 2, row 1] attr key').to.be.equal('data_test_1');
		expect(row.attributes.className, '[group 2, row 1] attr className')
			.to.be.equal(styles['chart-container']);
		expect(row.attributes.title, '[group 2, row 1] attr title').to.be.equal('Click to view rate graph');

		expect(row.attributes.onClick, '[group 2, row 1] attr onClick').to.be.equal('toggleChart_bind_test');
		expect(row.children, '[group 2, row 1] children length').to.have.lengthOf(5);
		expect(row.children[0].nodeName, '[group 2, row 1] child 1, nodeName').to.be.equal('td');
		expect(row.children[0].attributes.className, '[group 2, row 1] child 1, className').to.be.equal(
			`${ styles['center-align'] } ${ styles['bdr'] } ${ styles['chart-icon'] }`
		);
		expect(row.children[0].children[0].nodeName, '[group 2, row 1] child 1, child nodeName').to.be.equal('div');
		expect(
			row.children[0].children[0].attributes.className,
			'[group 2, row 1] child 1, child className'
		).to.be.equal(styles['chart-icon__icon']);
		expect(row.children[1].nodeName, '[group 2, row 1] child 2, nodeName').to.be.equal('td');
		expect(row.children[1].attributes.className, '[group 2, row 1] child 2, className').to.be.equal(
			`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
		);
		expect(row.children[1].children[0], '[group 2, row 1] child 2, child').to.be.equal('test_1');
		expect(row.children[2].nodeName, '[group 2, row 1] child 3, nodeName').to.be.equal('td');
		expect(row.children[2].attributes.className, '[group 2, row 1] child 3, className')
			.to.be.equal(styles['bdr']);
		expect(row.children[2].children[0], '[group 2, row 1] child 3, child').to.be.equal('1');
		expect(row.children[3].nodeName, '[group 2, row 1] child 4, nodeName').to.be.equal('td');
		expect(row.children[3].attributes.className, '[group 2, row 1] child 4, className')
			.to.be.equal(styles['bdr']);
		expect(row.children[3].children[0], '[group 2, row 1] child 4, child').to.be.equal('0');
		expect(row.children[4].nodeName, '[group 2, row 1] child 5, nodeName').to.be.equal('td');
		expect(row.children[4].children[0], '[group 2, row 1] child 5, child').to.be.equal('0');

		expect(body[1][1], '[group 2, row 2] Chart in hidden row').to.be.a('null');

		expect(instance.toggleChart.bind.calledTwice, 'this.toggleChart.bind called')
			.to.be.true;
		expect(instance.toggleChart.bind.args[0][0], 'this.toggleChart.bind call 1, arg 1')
			.to.be.deep.equal(instance);
		expect(instance.toggleChart.bind.args[0][1], 'this.toggleChart.bind call 1, arg 2')
			.to.be.equal('test');
		expect(instance.toggleChart.bind.args[1][0], 'this.toggleChart.bind call 2, arg 1')
			.to.be.deep.equal(instance);
		expect(instance.toggleChart.bind.args[1][1], 'this.toggleChart.bind call 2, arg 2')
			.to.be.equal('test_1');

		wrapper.unmount();
	});
});
