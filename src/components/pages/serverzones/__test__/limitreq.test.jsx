/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import ChartsTable from '../../../charts-table/index.jsx';
import LimitReq, {
	Colors,
	Labels
} from '../limitreq.jsx';
import styles from '../../../table/style.css';

describe('<LimitReq />', () => {
	it('extends ChartsTable', () => {
		expect(LimitReq.prototype).to.be.an.instanceOf(ChartsTable);
	});

	it('getTitle()', () => {
		const wrapper = shallow(<LimitReq />);

		expect(wrapper.instance().getTitle(), 'return value').to.be.equal('Limit Req');

		wrapper.unmount();
	});

	it('getHeadRow()', () => {
		const wrapper = shallow(<LimitReq />);
		const headRow = wrapper.instance().getHeadRow();

		expect(headRow.type, 'html tag').to.be.equal('tr');
		expect(headRow.props.children, 'cells count').to.have.lengthOf(7);

		wrapper.unmount();
	});

	it('getBody()', () => {
		const wrapper = shallow(
			<LimitReq data={ new Map([
				['test', {
					obj: {
						passed: 78,
						delayed: 55,
						rejected: 9,
						delayed_dry_run: 11,
						rejected_dry_run: 13
					},
					history: 'test__history'
				}], ['test_1', {
					obj: {
						passed: 1,
						delayed: 5,
						rejected: 0,
						delayed_dry_run: 1,
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

		expect(row.type, '[group 1, row 1] html tag').to.be.equal('tr');
		expect(row.key, '[group 1, row 1] attr key').to.be.equal('data_test');
		expect(row.props.className, '[group 1, row 1] attr className').to.be.equal(
			`${ styles['chart-container'] } ${ styles['chart-container_active'] }`
		);
		expect(row.props.title, '[group 1, row 1] attr title').to.be.equal('Click to hide rate graph');
		expect(row.props.onClick, '[group 1, row 1] attr onClick').to.be.equal('toggleChart_bind_test');
		expect(row.props.children, '[group 1, row 1] children length').to.have.lengthOf(7);
		expect(row.props.children[0].type, '[group 1, row 1] child 1, nodeName').to.be.equal('td');
		expect(row.props.children[0].props.className, '[group 1, row 1] child 1, className').to.be.equal(
			`${ styles['center-align'] } ${ styles['bdr'] } ${ styles['chart-icon'] }`
		);
		expect(row.props.children[0].props.children.type, '[group 1, row 1] child 1, child nodeName').to.be.equal('div');
		expect(
			row.props.children[0].props.children.props.className,
			'[group 1, row 1] child 1, child className'
		).to.be.equal(styles['chart-icon__icon']);
		expect(row.props.children[1].type, '[group 1, row 1] child 2, nodeName').to.be.equal('td');
		expect(row.props.children[1].props.className, '[group 1, row 1] child 2, className').to.be.equal(
			`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
		);
		expect(row.props.children[1].props.children, '[group 1, row 1] child 2, child').to.be.equal('test');
		expect(row.props.children[2].type, '[group 1, row 1] child 3, nodeName').to.be.equal('td');
		expect(row.props.children[2].props.className, '[group 1, row 1] child 3, className')
			.to.be.equal(styles['bdr']);
		expect(row.props.children[2].props.children, '[group 1, row 1] child 3, child').to.be.equal(78);
		expect(row.props.children[3].type, '[group 1, row 1] child 4, nodeName').to.be.equal('td');
		expect(row.props.children[3].props.className, '[group 1, row 1] child 4, className')
			.to.be.equal(styles['bdr']);
		expect(row.props.children[3].props.children, '[group 1, row 1] child 4, child').to.be.equal(55);
		expect(row.props.children[4].type, '[group 1, row 1] child 5, nodeName').to.be.equal('td');
		expect(row.props.children[4].props.className, '[group 1, row 1] child 5, className')
			.to.be.equal(styles['bdr']);
		expect(row.props.children[4].props.children, '[group 1, row 1] child 5, child').to.be.equal(9);
		expect(row.props.children[5].type, '[group 1, row 1] child 6, nodeName').to.be.equal('td');
		expect(row.props.children[5].props.className, '[group 1, row 1] child 6, className')
			.to.be.equal(styles['bdr']);
		expect(row.props.children[5].props.children, '[group 1, row 1] child 6, child').to.be.equal(11);
		expect(row.props.children[6].type, '[group 1, row 1] child 7, nodeName').to.be.equal('td');
		expect(row.props.children[6].props.children, '[group 1, row 1] child 7, child').to.be.equal(13);

		row = body[0][1];

		expect(row.type, '[group 1, row 2] html tag').to.be.equal('tr');
		expect(row.key, '[group 1, row 2] attr key').to.be.equal('chart_test');
		expect(row.props.className, '[group 1, row 2] attr className').to.be.equal(
			styles['chart-row']
		);
		expect(row.props.children.type, '[group 1, row 2] child nodeName').to.be.equal('td');
		expect(row.props.children.props.colspan, '[group 1, row 2] child colspan').to.be.equal('7');
		expect(
			row.props.children.props.className,
			'[group 1, row 2] child className'
		).to.be.equal(styles['left-align']);
		expect(row.props.children.props.children.type.name, '[group 1, row 2] Chart in open row').to.be.equal('Chart');
		expect(row.props.children.props.children.props.data, '[group 1, row 2] Chart attr data')
			.to.be.equal('test__history');
		expect(row.props.children.props.children.props.colors, '[group 1, row 2] Chart attr colors')
			.to.be.deep.equal(Colors);
		expect(row.props.children.props.children.props.labels, '[group 1, row 2] Chart attr labels')
			.to.be.deep.equal(Labels);

		row = body[1][0];

		expect(row.type, '[group 2, row 1] html tag').to.be.equal('tr');
		expect(row.key, '[group 2, row 1] attr key').to.be.equal('data_test_1');
		expect(row.props.className, '[group 2, row 1] attr className')
			.to.be.equal(styles['chart-container']);
		expect(row.props.title, '[group 2, row 1] attr title').to.be.equal('Click to view rate graph');

		expect(row.props.onClick, '[group 2, row 1] attr onClick').to.be.equal('toggleChart_bind_test');
		expect(row.props.children, '[group 2, row 1] children length').to.have.lengthOf(7);
		expect(row.props.children[0].type, '[group 2, row 1] child 1, nodeName').to.be.equal('td');
		expect(row.props.children[0].props.className, '[group 2, row 1] child 1, className').to.be.equal(
			`${ styles['center-align'] } ${ styles['bdr'] } ${ styles['chart-icon'] }`
		);
		expect(row.props.children[0].props.children.type, '[group 2, row 1] child 1, child nodeName').to.be.equal('div');
		expect(
			row.props.children[0].props.children.props.className,
			'[group 2, row 1] child 1, child className'
		).to.be.equal(styles['chart-icon__icon']);
		expect(row.props.children[1].type, '[group 2, row 1] child 2, nodeName').to.be.equal('td');
		expect(row.props.children[1].props.className, '[group 2, row 1] child 2, className').to.be.equal(
			`${ styles['left-align'] } ${ styles['bold'] } ${ styles['bdr'] }`
		);
		expect(row.props.children[1].props.children, '[group 2, row 1] child 2, child').to.be.equal('test_1');
		expect(row.props.children[2].type, '[group 2, row 1] child 3, nodeName').to.be.equal('td');
		expect(row.props.children[2].props.className, '[group 2, row 1] child 3, className')
			.to.be.equal(styles['bdr']);
		expect(row.props.children[2].props.children, '[group 2, row 1] child 3, child').to.be.equal(1);
		expect(row.props.children[3].type, '[group 2, row 1] child 4, nodeName').to.be.equal('td');
		expect(row.props.children[3].props.className, '[group 2, row 1] child 4, className')
			.to.be.equal(styles['bdr']);
		expect(row.props.children[3].props.children, '[group 2, row 1] child 4, child').to.be.equal(5);
		expect(row.props.children[4].type, '[group 2, row 1] child 5, nodeName').to.be.equal('td');
		expect(row.props.children[4].props.className, '[group 2, row 1] child 5, className')
			.to.be.equal(styles['bdr']);
		expect(row.props.children[4].props.children, '[group 2, row 1] child 5, child').to.be.equal(0);
		expect(row.props.children[5].type, '[group 2, row 1] child 6, nodeName').to.be.equal('td');
		expect(row.props.children[5].props.className, '[group 2, row 1] child 6, className')
			.to.be.equal(styles['bdr']);
		expect(row.props.children[5].props.children, '[group 2, row 1] child 6, child').to.be.equal(1);
		expect(row.props.children[6].type, '[group 2, row 1] child 7, nodeName').to.be.equal('td');
		expect(row.props.children[6].props.children, '[group 2, row 1] child 7, child').to.be.equal(0);

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
