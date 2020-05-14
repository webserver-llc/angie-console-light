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
	['rejected', '#FF2323'],
	['rejected_dry_run', '#000ADD']
]);
const Labels = new Map([
	['passed', 'Passed'],
	['rejected', 'Rejected'],
	['rejected_dry_run', 'Rejected (dry_run)']
]);

export default class LimitConn extends LimitConnReqConstructor {
	getTitle(){
		return 'Limit Conn';
	}

	getHeadRow(){
		return (
			<tr>
				<th/>
				<th>Zone</th>
				<th>Passed</th>
				<th>Rejected</th>
				<th>Rejected (dry_run)</th>
			</tr>
		);
	}

	getBody(){
		const { activeCharts } = this.state;

		return Array.from(this.props.data).map(
			([name, { zone, history }]) => {
				let styleName = 'chart-container';
				let title = 'Click to view rate graph';
				let chart = null;

				if (activeCharts.includes(name)) {
					styleName += ' chart-container_active';
					title = 'Click to hide rate graph';
					chart = (
						<tr
							key={ `chart_${ name }` }
							styleName="chart-row"
						>
							<td
								colspan="5"
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
						title={ title }
						onClick={ this.toggleChart.bind(this, name) }
					>
						<td styleName="center-align bdr chart-icon">
							<div styleName="chart-icon__icon" />
						</td>
						<td styleName="left-align bold bdr">{ name }</td>
						<td styleName="bdr">{ zone.passed }</td>
						<td styleName="bdr">{ zone.rejected }</td>
						<td>{ zone.rejected_dry_run }</td>
					</tr>,
					chart
				];
			}
		);
	}
};
