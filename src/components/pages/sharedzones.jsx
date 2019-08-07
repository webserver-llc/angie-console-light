/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import api from '../../api';
import SortableTable from '../table/sortabletable.jsx';
import TableSortControl from '../table/tablesortcontrol.jsx';
import ProgressBar from '../progressbar/progressbar.jsx';
import calculateSharedZones from '../../calculators/sharedzones.js';
import DataBinder from '../databinder/databinder.jsx';
import styles from '../table/style.css';

import { useTooltip } from '../../tooltips/index.jsx';

export class SharedZones extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'sharedZonesSortOrder';
	}

	render() {
		let slabs = Array.from(this.props.data.slabs);

		if (this.state.sortOrder === 'desc') {
			slabs.sort(([nameA, a], [nameB, b]) =>
				a.pages.total > b.pages.total ? -1 : 1
			);
		}

		return (<div>
			<h1>Shared zones</h1>

			<table styleName="table">
				<thead>
					<tr>
						<TableSortControl
							singleRow={true}
							secondSortLabel="Sort by size - large first"
							order={this.state.sortOrder}
							onChange={this.changeSorting}
						/>
						<th>Zone</th>
						<th>Total memory pages</th>
						<th>Used memory pages</th>
						<th>
							<span
								styleName="hinted"
								{...useTooltip('Memory usage = Used memory pages / Total memory pages', 'hint')}
							>Memory usage</span>
						</th>
					</tr>
				</thead>

				<tbody>
					{
						slabs.map(([zoneName, zone]) => {
							return (<tr>
								<td styleName="status" />
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
