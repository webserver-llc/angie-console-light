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
import api from '../../api';
import SortableTable from '../table/sortabletable.jsx';
import TableSortControl from '../table/tablesortcontrol.jsx';
import ProgressBar from '../progressbar/progressbar.jsx';
import calculateSharedZones from '../../calculators/sharedzones.js';
import DataBinder from '../databinder/databinder.jsx';
import styles from '../table/style.css';

import tooltips from '../../tooltips/index.jsx';

export class SharedZones extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'sharedZonesSortOrder';
	}

	render() {
		const slabs = Array.from(this.props.data.slabs);

		if (this.state.sortOrder === 'desc') {
			slabs.sort(([nameA, a], [nameB, b]) =>
				a.pages.total > b.pages.total ? -1 : 1
			);
		}

		return (
			<div>
				<h1>Общие зоны</h1>

				<table className={styles.table}>
					<thead>
						<tr>
							<TableSortControl
								singleRow
								secondSortLabel="Sort by size - large first"
								order={this.state.sortOrder}
								onChange={this.changeSorting}
							/>
							<th>Зона</th>
							<th>Всего страниц памяти</th>
							<th>Использовано страниц памяти</th>
							<th>
								<span
									className={styles.hinted}
									{...tooltips.useTooltip('Использовано памяти = Использовано страниц / Всего страниц памяти', 'hint')}
								>
									Использовано памяти
								</span>
							</th>
						</tr>
					</thead>

					<tbody>
						{
							slabs.map(([zoneName, zone]) => (
								<tr>
									<td className={styles.status} />
									<td className={styles.bold}>{zoneName}</td>
									<td>{zone.pages.total}</td>
									<td>{zone.pages.used}</td>
									<td>
										<ProgressBar percentage={zone.percentSize} />
									</td>
								</tr>
							))
						}
					</tbody>
				</table>
			</div>
		);
	}
}

export default DataBinder(SharedZones, [
	api.slabs.process(calculateSharedZones)
]);
