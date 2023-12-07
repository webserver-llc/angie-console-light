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
import DataBinder from '../databinder/databinder.jsx';
import SortableTable from '../table/sortabletable.jsx';
import TableSortControl from '../table/tablesortcontrol.jsx';
import calculateZoneSync from '../../calculators/zonesync.js';
import styles from '../table/style.css';

export class ZoneSync extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'zoneSyncSortOrder';
	}

	render() {
		const {
			data: { zone_sync }
		} = this.props;
		const { status } = zone_sync;
		let zones = Array.from(zone_sync.zones);

		if (this.state.sortOrder === 'desc') {
			zones.sort(([nameA, a], [nameB, b]) =>
				a.alert || a.warning ? -1 : 1
			);
		}

		return (<div>
			<h1>Instance Status</h1>

			<table className={ `${ styles.table } ${ styles.thin }` }>
				<thead>
					<tr>
						<th colSpan={2}>In</th>
						<th colSpan={2}>Out</th>
						<th>Nodes online</th>
					</tr>
					<tr className={ `${ styles['right-align'] } ${ styles['sub-header'] }` }>
						<th>messages</th>
						<th className={ styles.bdr }>bytes</th>
						<th>messages</th>
						<th className={ styles.bdr }>bytes</th>
						<th></th>
					</tr>
				</thead>
				<tbody className={ styles['right-align'] }>
					<tr>
						<td>{ status.msgs_in }</td>
						<td className={ styles.bdr }>{ status.bytes_in }</td>
						<td>{ status.msgs_out }</td>
						<td className={ styles.bdr }>{ status.bytes_out }</td>
						<td>{ status.nodes_online }</td>
					</tr>
				</tbody>
			</table>

			<br/>
			<h1>Zones</h1>

			<table className={ `${ styles.table } ${ styles.thin }` }>
				<thead>
					<tr>
						<TableSortControl order={this.state.sortOrder} onChange={this.changeSorting} />
						<th>Zone</th>
						<th colspan={2}>Records</th>
					</tr>
					<tr className={ `${ styles['right-align'] } ${ styles['sub-header'] }` }>
						<th className={ styles.bdr } />
						<th>Total</th>
						<th>Pending</th>
					</tr>
				</thead>
				<tbody className={ styles['right-align'] }>
					{
						zones.map(([name, zone]) => {
							let zoneStatus = styles.ok;

							if (zone.alert) {
								zoneStatus = styles.alert;
							} else if (zone.warning) {
								zoneStatus = styles.warning;
							}

							return (
								<tr>
									<td className={ zoneStatus } />
									<td className={ `${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }` }>{ name }</td>
									<td>{ zone.records_total }</td>
									<td>{ zone.records_pending }</td>
								</tr>
							);
						})
					}
				</tbody>
			</table>
		</div>);
	}
}

export default DataBinder(ZoneSync, [
	api.stream.zone_sync.process(calculateZoneSync)
]);
