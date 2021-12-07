/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import api from '../../../api';
import DataBinder from '../../databinder/databinder.jsx';
import ProgressBar from '../../progressbar/progressbar.jsx';
import GaugeIndicator from '../../gaugeindicator/gaugeindicator.jsx';
import Icon from '../../icon/icon.jsx';

import cacheCalculator from '../../../calculators/caches.js';
import sharedZonesCalculator from '../../../calculators/sharedzones.js';
import { formatReadableBytes } from '../../../utils.js';
import { useTooltip } from '../../../tooltips/index.jsx';

import { CacheStateTooltip, SharedZoneTooltip } from '../tooltips.jsx';

import styles from '../../table/style.css';
import cachesStyles from './style.css';

export class Caches extends React.Component {
	static formatReadableBytes(value, measurementUnit){
		return formatReadableBytes(
			value,
			measurementUnit,
			{ 0: 'B', 1: 'KB', 2: 'MB', 3: 'GB', 4: 'TB' }
		);
	}

	render() {
		const { data: { caches } } = this.props;

		return (<div>
			<h1>Caches</h1>

			<table className={ styles.table }>
				<col width="170px" />

				<thead>
					<tr>
						<th>Zone</th>
						<th><span className={ styles.hinted } {...useTooltip(<CacheStateTooltip />, 'hint')}>State</span></th>
						<th>
							<span
								className={ styles.hinted }
								{...useTooltip('Memory usage = Used memory pages / Total memory pages', 'hint')}
							>Memory usage</span>
						</th>
						<th>Max size</th>
						<th>Used</th>
						<th>
							<span
								className={ styles.hinted }
								{...useTooltip('Disk usage = Used / Max size', 'hint')}
							>Disk usage</span>
						</th>
						<th colSpan="3">Traffic</th>
						<th>Hit Ratio</th>
					</tr>

					<tr className={ `${ styles['right-align'] } ${ styles['sub-header'] }` }>
						<th className={ styles.bdr } />
						<th className={ styles.bdr } />
						<th className={ styles.bdr } />
						<th className={ styles.bdr } />
						<th className={ styles.bdr } />
						<th className={ styles.bdr } />
						<th>Served</th>
						<th>Written</th>
						<th className={ styles.bdr }>Bypassed</th>
						<th />
					</tr>
				</thead>

				<tbody>
					{
						Array.from(caches).map(([cacheName, cache]) => {
							return (<tr>
								<td className={ `${ styles.bold } ${ styles.bdr }` }>{ cacheName }</td>
								<td className={ `${ styles.bdr } ${ styles['center-align'] }` }>
									{
										cache.cold ?
											<span {...useTooltip('Cold', 'hint')}>
												<Icon type="snowflake" className={ cachesStyles.icon } />
											</span>
										:
											<span {...useTooltip('Warm', 'hint')}>
												<Icon type="sun" className={ cachesStyles.icon } />
											</span>
									}
								</td>
								<td className={ styles.bdr }>
									<span {...useTooltip(<SharedZoneTooltip zone={cache.slab} />, 'hint')}>
										<ProgressBar percentage={cache.zoneSize || 0} />
									</span>
								</td>
								<td className={ styles.bdr }>
									{
										typeof cache.max_size === 'number' ?
											Caches.formatReadableBytes(cache.max_size, 'GB')
											: <span>&infin;</span>
									}
								</td>
								<td className={ styles.bdr }>{ Caches.formatReadableBytes(cache.size, 'GB') }</td>
								<td className={ styles.bdr }>
									<ProgressBar
										warning={cache.warning}
										danger={cache.danger}
										percentage={typeof cache.max_size !== 'number' ? -1 : cache.used}
									/>
								</td>
								<td className={ styles['right-align'] }>{ Caches.formatReadableBytes(cache.traffic.s_served) }</td>
								<td className={ styles['right-align'] }>{ Caches.formatReadableBytes(cache.traffic.s_written) }</td>
								<td className={ `${ styles.bdr } ${ styles['right-align'] }` }>{ Caches.formatReadableBytes(cache.traffic.s_bypassed) }</td>
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
