/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import api from '../../api';
import DataBinder from '../databinder/databinder.jsx';
import ProgressBar from '../progressbar/progressbar.jsx';
import GaugeIndicator from '../gaugeindicator/gaugeindicator.jsx';
import Icon from '../icon/icon.jsx';

import cacheCalculator from '../../calculators/caches.js';
import sharedZonesCalculator from '../../calculators/sharedzones.js';
import { formatReadableBytes as _formatReadableBytes } from '../../utils.js';

import styles from '../table/style.css';

export const formatReadableBytes = (value, measurementUnit) => _formatReadableBytes(
	value,
	measurementUnit,
	{ 0: 'B', 1: 'KB', 2: 'MB', 3: 'GB', 4: 'TB' }
);

export class Caches extends React.Component {
	render() {
		const { data: { caches } } = this.props;

		return (<div>
			<h1>Caches</h1>

			<table styleName="table">
				<col width="170px" />

				<thead>
					<tr>
						<th>Zone</th>
						<th>State</th>
						<th>Memory usage</th>
						<th>Max size</th>
						<th>Used</th>
						<th>Disk usage</th>
						<th colSpan="3">Traffic</th>
						<th>Hit Ratio</th>
					</tr>

					<tr styleName="right-align sub-header">
						<th styleName="bdr" />
						<th styleName="bdr" />
						<th styleName="bdr" />
						<th styleName="bdr" />
						<th styleName="bdr" />
						<th styleName="bdr" />
						<th>Served</th>
						<th>Written</th>
						<th styleName="bdr">Bypassed</th>
						<th />
					</tr>
				</thead>

				<tbody>
					{
						Array.from(caches).map(([cacheName, cache]) => {
							return (<tr>
								<td styleName="bold bdr">{ cacheName }</td>
								<td styleName="bdr center-align"> { cache.cold ? <Icon type="snowflake" /> : <Icon type="sun" /> }</td>
								<td styleName="bdr"><ProgressBar percentage={cache.zoneSize} /></td>
								<td styleName="bdr">
									{
										typeof cache.max_size === 'number' ?
											formatReadableBytes(cache.max_size, 'GB')
											: '&infin;'
									}
								</td>
								<td styleName="bdr">{ formatReadableBytes(cache.size, 'GB') }</td>
								<td styleName="bdr">
									<ProgressBar
										warning={cache.warning}
										danger={cache.danger}
										percentage={typeof cache.max_size !== 'number' ? -1 : cache.used}
									/>
								</td>
								<td styleName="right-align">{ formatReadableBytes(cache.traffic.s_served) }</td>
								<td styleName="right-align">{ formatReadableBytes(cache.traffic.s_written) }</td>
								<td styleName="bdr right-align">{ formatReadableBytes(cache.traffic.s_bypassed) }</td>
								<td>
									{
										<GaugeIndicator percentage={cache.hit_percents_generic} />
									}
								</td>
							</tr>);
						})
					}
				</tbody>
			</table>
		</div>);
	}
}

export default DataBinder(Caches, [
	api.slabs.process(sharedZonesCalculator),
	api.http.caches.process(cacheCalculator)
]);
