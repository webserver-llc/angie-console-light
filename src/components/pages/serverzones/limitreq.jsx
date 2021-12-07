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

export const Colors = new Map([
	['passed', '#4FA932'],
	['delayed', '#EBC906'],
	['rejected', '#FF2323'],
	['delayed_dry_run', '#861DE3'],
	['rejected_dry_run', '#000ADD']
]);

export const Labels = new Map([
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
				let cn = styles['chart-container'];
				let title = 'Click to view rate graph';
				let chart = null;

				if (activeCharts.includes(name)) {
					cn += ` ${ styles['chart-container_active'] }`;
					title = 'Click to hide rate graph';
					chart = (
						<tr
							key={ `chart_${ name }` }
							className={ styles['chart-row'] }
						>
							<td
								colspan="7"
								className={ styles['left-align'] }
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
						className={ cn }
						title={ title }
						onClick={ this.toggleChart.bind(this, name) }
					>
						<td className={ `${ styles['center-align'] } ${ styles.bdr } ${ styles['chart-icon'] }` }>
							<div className={ styles['chart-icon__icon'] } />
						</td>
						<td className={ `${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }` }>{ name }</td>
						<td className={ styles.bdr }>{ zone.passed }</td>
						<td className={ styles.bdr }>{ zone.delayed }</td>
						<td className={ styles.bdr }>{ zone.rejected }</td>
						<td className={ styles.bdr }>{ zone.delayed_dry_run }</td>
						<td>{ zone.rejected_dry_run }</td>
					</tr>,
					chart
				];
			}
		);
	}
};
