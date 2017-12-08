/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import api from '../../api';
import ProgressBar from '../progressbar/progressbar.jsx';
import calculateSharedZones from '../../calculators/sharedzones.js';
import DataBinder from '../databinder/databinder.jsx';
import styles from '../table/style.css';

export class SharedZones extends React.Component {
	render() {
		const { slabs } = this.props.data;

		return (<div>
			<h1>Shared zones</h1>

			<table styleName="table">
				<thead>
					<tr>
						<th>Zone</th>
						<th>Total memory pages</th>
						<th>Used memory pages</th>
						<th>Memory usage</th>
					</tr>
				</thead>

				<tbody>
					{
						Array.from(slabs).map(([zoneName, zone]) => {
							return (<tr>
								<td styleName="bold">{ zoneName }</td>
								<td>{ zone.pages.total }</td>
								<td>{ zone.pages.used }</td>
								<td>
									<ProgressBar percentage={zone.percentSize} />
								</td>
							</tr>);
						})
					}
				</tbody>
			</table>
		</div>);
	}
}

export default DataBinder(SharedZones, [
	api.slabs.process(calculateSharedZones)
]);
