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
import ChartsTable from '../../charts-table/index.jsx';
import Chart from '../../chart/index.jsx';
import styles from '../../table/style.css';

export const Colors = new Map([
	['passed', '#4FA932'],
	['rejected', '#FF2323'],
	['exhausted', '#861DE3'],
	['skipped', '#000ADD'],
]);
export const Labels = new Map([
	['passed', 'Passed'],
	['rejected', 'Rejected'],
	['exhausted', 'Exhausted'],
	['skipped', 'Skipped'],
]);

export default class LimitConn extends ChartsTable {
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
				<th>Exhausted</th>
				<th>Skipped</th>
			</tr>
		);
	}

	getBody(){
		const { activeCharts } = this.state;

		return Array.from(this.props.data).map(
			([name, { obj: zone, history }]) => {
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
								colspan="5"
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
						<td className={ styles.bdr }>{ zone.rejected }</td>
						<td className={ styles.bdr }>{ zone.exhausted }</td>
						<td>{ zone.skipped }</td>
					</tr>,
					chart
				];
			}
		);
	}
};
