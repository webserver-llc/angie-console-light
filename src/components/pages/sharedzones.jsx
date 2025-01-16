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
import { withNamespaces } from 'react-i18next';
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
		const { t } = this.props;
		const slabs = Array.from(this.props.data.slabs);

		if (this.state.sortOrder === 'desc') {
			slabs.sort(([nameA, a], [nameB, b]) =>
				a.pages.total > b.pages.total ? -1 : 1
			);
		}

		return (
			<div>
				<h1>{t('Shared Zones')}</h1>

				<table className={styles.table}>
					<thead>
						<tr>
							<TableSortControl
								singleRow
								firstSortLabel={t('Sort by zone - asc')}
								secondSortLabel={t('Sort by conf order')}
								order={this.state.sortOrder}
								onChange={this.changeSorting}
							/>
							<th>{t('Zone')}</th>
							<th>{t('Total memory pages')}</th>
							<th>{t('Used memory pages')}</th>
							<th>
								<span
									className={styles.hinted}
									{...tooltips.useTooltip(t('Memory usage = Used memory pages / Total memory pages'), 'hint')}
								>
									{t('Memory usage')}
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

SharedZones.defaultProps = {
	// i18n for testing
	t: key => key,
};

export default DataBinder(withNamespaces('pages.sharedzones')(SharedZones), [
	api.slabs.process(calculateSharedZones)
]);
