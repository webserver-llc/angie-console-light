/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { LimitConnReqConstructor } from './constructors.jsx';
import Chart from '../../chart/index.jsx';
import styles from '../../table/style.css';

const Colors = new Map([
	['passed', '#4FA932'],
	['delayed', '#EBC906'],
	['rejected', '#FF2323'],
	['delayed_dry_run', '#861DE3'],
	['rejected_dry_run', '#000ADD']
]);
const Labels = new Map([
	['passed', 'Passed'],
	['delayed', 'Delayed'],
	['rejected', 'Rejected'],
	['delayed_dry_run', 'Delayed (dry_run)'],
	['rejected_dry_run', 'Rejected (dry_run)']
]);

export default class LimitReq extends LimitConnReqConstructor {
	getTitle(){
		return 'Limit Req';
	}

	getHeadRow(){
		return (
			<tr>
				<th/>
				<th>Zone</th>
				<th>Passed</th>
				<th>Delayed</th>
				<th>Rejected</th>
				<th>Delayed (dry_run)</th>
				<th>Rejected (dry_run)</th>
			</tr>
		);
	}

	getBody(){
		const { activeCharts } = this.state;

		return Array.from(this.props.data).map(
			([name, { zone, history }]) => {
				let styleName = '';
				let chart = null;

				if (activeCharts.includes(name)) {
					styleName = 'chart-active';
					chart = (
						<tr
							key={ `chart_${ name }` }
							styleName="chart-row"
						>
							<td
								colspan="7"
								styleName="left-align"
							>
								<Chart
									data={ history }
									colors={ Colors }
									labels={ Labels }
								/>
							</td>
						</tr>
					);
				}

				return [
					<tr
						key={ `data_${ name }` }
						styleName={ styleName }
					>
						<td
							styleName="center-align bdr chart-icon"
							title="Click to toggle the graph"
							onClick={ this.toggleChart.bind(this, name) }
						>&#x0223F;</td>
						<td styleName="left-align bold bdr">{ name }</td>
						<td styleName="bdr">{ zone.passed }</td>
						<td styleName="bdr">{ zone.delayed }</td>
						<td styleName="bdr">{ zone.rejected }</td>
						<td styleName="bdr">{ zone.delayed_dry_run }</td>
						<td>{ zone.rejected_dry_run }</td>
					</tr>,
					chart
				];
			}
		);
	}
};
