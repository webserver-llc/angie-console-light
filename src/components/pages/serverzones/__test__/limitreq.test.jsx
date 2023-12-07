/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import React from 'react';
import { shallow } from 'enzyme';
import ChartsTable from '../../../charts-table/index.jsx';
import LimitReq, {
	Colors,
	Labels
} from '../limitreq.jsx';
import styles from '../../../table/style.css';

describe('<LimitReq />', () => {
	it('extends ChartsTable', () => {
		expect(LimitReq.prototype).toBeInstanceOf(ChartsTable);
	});

	it('getTitle()', () => {
		const wrapper = shallow(<LimitReq />);

		// return value
		expect(wrapper.instance().getTitle()).toBe('Limit Req');

		wrapper.unmount();
	});

	it('getHeadRow()', () => {
		const wrapper = shallow(<LimitReq />);
		const headRow = wrapper.instance().getHeadRow();

		// html tag
		expect(headRow.type).toBe('tr');
		// cells count
		expect(headRow.props.children).toHaveLength(7);

		wrapper.unmount();
	});

	it('getBody()', () => {
		const wrapper = shallow(
			<LimitReq data={new Map([
				['test', {
					obj: {
						passed: 78,
						delayed: 55,
						rejected: 9,
						exhausted: 11,
						skipped: 13
					},
					history: 'test__history'
				}], ['test_1', {
					obj: {
						passed: 1,
						delayed: 5,
						rejected: 0,
						exhausted: 1,
						skipped: 0
					},
					history: 'test__history_1'
				}]
			])}
			/>);
		const instance = wrapper.instance();

		wrapper.setState({ activeCharts: ['test'] });
		jest.spyOn(instance.toggleChart, 'bind').mockClear().mockImplementation(() => 'toggleChart_bind_test');

		const body = wrapper.instance().getBody();

		// rows length
		expect(body).toHaveLength(2);

		let row = body[0][0];

		// [group 1, row 1] html tag
		expect(row.type).toBe('tr');
		// [group 1, row 1] attr key
		expect(row.key).toBe('data_test');
		// [group 1, row 1] attr className
		expect(row.props.className).toBe(`${ styles['chart-container'] } ${ styles['chart-container_active'] }`);
		// [group 1, row 1] attr title
		expect(row.props.title).toBe('Click to hide rate graph');
		// [group 1, row 1] attr onClick
		expect(row.props.onClick).toBe('toggleChart_bind_test');
		// [group 1, row 1] children length
		expect(row.props.children).toHaveLength(7);
		// [group 1, row 1] child 1, nodeName
		expect(row.props.children[0].type).toBe('td');
		// [group 1, row 1] child 1, className
		expect(row.props.children[0].props.className).toBe(`${ styles['center-align'] } ${ styles.bdr } ${ styles['chart-icon'] }`);
		// [group 1, row 1] child 1, child nodeName
		expect(row.props.children[0].props.children.type).toBe('div');
		// [group 1, row 1] child 1, child className
		expect(row.props.children[0].props.children.props.className).toBe(styles['chart-icon__icon']);
		// [group 1, row 1] child 2, nodeName
		expect(row.props.children[1].type).toBe('td');
		// [group 1, row 1] child 2, className
		expect(row.props.children[1].props.className).toBe(`${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }`);
		// [group 1, row 1] child 2, child
		expect(row.props.children[1].props.children).toBe('test');
		// [group 1, row 1] child 3, nodeName
		expect(row.props.children[2].type).toBe('td');
		// [group 1, row 1] child 3, className
		expect(row.props.children[2].props.className).toBe(styles.bdr);
		// [group 1, row 1] child 3, child
		expect(row.props.children[2].props.children).toBe(78);
		// [group 1, row 1] child 4, nodeName
		expect(row.props.children[3].type).toBe('td');
		// [group 1, row 1] child 4, className
		expect(row.props.children[3].props.className).toBe(styles.bdr);
		// [group 1, row 1] child 4, child
		expect(row.props.children[3].props.children).toBe(55);
		// [group 1, row 1] child 5, nodeName
		expect(row.props.children[4].type).toBe('td');
		// [group 1, row 1] child 5, className
		expect(row.props.children[4].props.className).toBe(styles.bdr);
		// [group 1, row 1] child 5, child
		expect(row.props.children[4].props.children).toBe(9);
		// [group 1, row 1] child 6, nodeName
		expect(row.props.children[5].type).toBe('td');
		// [group 1, row 1] child 6, className
		expect(row.props.children[5].props.className).toBe(styles.bdr);
		// [group 1, row 1] child 6, child
		expect(row.props.children[5].props.children).toBe(11);
		// [group 1, row 1] child 7, nodeName
		expect(row.props.children[6].type).toBe('td');
		// [group 1, row 1] child 7, child
		expect(row.props.children[6].props.children).toBe(13);

		row = body[0][1];

		// [group 1, row 2] html tag
		expect(row.type).toBe('tr');
		// [group 1, row 2] attr key
		expect(row.key).toBe('chart_test');
		// [group 1, row 2] attr className
		expect(row.props.className).toBe(styles['chart-row']);
		// [group 1, row 2] child nodeName
		expect(row.props.children.type).toBe('td');
		// [group 1, row 2] child colspan
		expect(row.props.children.props.colspan).toBe('7');
		// [group 1, row 2] child className
		expect(row.props.children.props.className).toBe(styles['left-align']);
		// [group 1, row 2] Chart in open row
		expect(row.props.children.props.children.type.name).toBe('Chart');
		// [group 1, row 2] Chart attr data
		expect(row.props.children.props.children.props.data).toBe('test__history');
		// [group 1, row 2] Chart attr colors
		expect(row.props.children.props.children.props.colors).toEqual(Colors);
		// [group 1, row 2] Chart attr labels
		expect(row.props.children.props.children.props.labels).toEqual(Labels);

		row = body[1][0];

		// [group 2, row 1] html tag
		expect(row.type).toBe('tr');
		// [group 2, row 1] attr key
		expect(row.key).toBe('data_test_1');
		// [group 2, row 1] attr className
		expect(row.props.className).toBe(styles['chart-container']);
		// [group 2, row 1] attr title
		expect(row.props.title).toBe('Click to view rate graph');

		// [group 2, row 1] attr onClick
		expect(row.props.onClick).toBe('toggleChart_bind_test');
		// [group 2, row 1] children length
		expect(row.props.children).toHaveLength(7);
		// [group 2, row 1] child 1, nodeName
		expect(row.props.children[0].type).toBe('td');
		// [group 2, row 1] child 1, className
		expect(row.props.children[0].props.className).toBe(`${ styles['center-align'] } ${ styles.bdr } ${ styles['chart-icon'] }`);
		// [group 2, row 1] child 1, child nodeName
		expect(row.props.children[0].props.children.type).toBe('div');
		// [group 2, row 1] child 1, child className
		expect(row.props.children[0].props.children.props.className).toBe(styles['chart-icon__icon']);
		// [group 2, row 1] child 2, nodeName
		expect(row.props.children[1].type).toBe('td');
		// [group 2, row 1] child 2, className
		expect(row.props.children[1].props.className).toBe(`${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }`);
		// [group 2, row 1] child 2, child
		expect(row.props.children[1].props.children).toBe('test_1');
		// [group 2, row 1] child 3, nodeName
		expect(row.props.children[2].type).toBe('td');
		// [group 2, row 1] child 3, className
		expect(row.props.children[2].props.className).toBe(styles.bdr);
		// [group 2, row 1] child 3, child
		expect(row.props.children[2].props.children).toBe(1);
		// [group 2, row 1] child 4, nodeName
		expect(row.props.children[3].type).toBe('td');
		// [group 2, row 1] child 4, className
		expect(row.props.children[3].props.className).toBe(styles.bdr);
		// [group 2, row 1] child 4, child
		expect(row.props.children[3].props.children).toBe(5);
		// [group 2, row 1] child 5, nodeName
		expect(row.props.children[4].type).toBe('td');
		// [group 2, row 1] child 5, className
		expect(row.props.children[4].props.className).toBe(styles.bdr);
		// [group 2, row 1] child 5, child
		expect(row.props.children[4].props.children).toBe(0);
		// [group 2, row 1] child 6, nodeName
		expect(row.props.children[5].type).toBe('td');
		// [group 2, row 1] child 6, className
		expect(row.props.children[5].props.className).toBe(styles.bdr);
		// [group 2, row 1] child 6, child
		expect(row.props.children[5].props.children).toBe(1);
		// [group 2, row 1] child 7, nodeName
		expect(row.props.children[6].type).toBe('td');
		// [group 2, row 1] child 7, child
		expect(row.props.children[6].props.children).toBe(0);

		expect(body[1][1]).toBeNull();

		// this.toggleChart.bind called
		expect(instance.toggleChart.bind).toHaveBeenCalledTimes(2);
		// this.toggleChart.bind call 1, arg 1
		expect(instance.toggleChart.bind.mock.calls[0][0]).toEqual(instance);
		// this.toggleChart.bind call 1, arg 2
		expect(instance.toggleChart.bind.mock.calls[0][1]).toBe('test');
		// this.toggleChart.bind call 2, arg 1
		expect(instance.toggleChart.bind.mock.calls[1][0]).toEqual(instance);
		// this.toggleChart.bind call 2, arg 2
		expect(instance.toggleChart.bind.mock.calls[1][1]).toBe('test_1');

		wrapper.unmount();
	});
});
