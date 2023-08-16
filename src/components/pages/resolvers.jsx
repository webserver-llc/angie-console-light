/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import api from '../../api';
import DataBinder from '../databinder/databinder.jsx';
import SortableTable from '../table/sortabletable.jsx';
import TableSortControl from '../table/tablesortcontrol.jsx';
import mapperResolvers from '../../api/mappers/resolvers.js';
import calculateResolvers from '../../calculators/resolvers.js';
import styles from '../table/style.css';

export class Resolvers extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'resolversSortOrder';
	}

	render() {
		let resolvers = Array.from(this.props.data.resolvers);

		if (this.state.sortOrder === 'desc') {
			resolvers.sort(([nameA, a], [nameB, b]) => a.alert ? -1 : 1);
		}

		return (<div>
			<h1>Resolvers</h1>

			<table className={ `${ styles.table } ${ styles.wide }` }>
				<thead>
					<tr>
						<TableSortControl order={this.state.sortOrder} onChange={this.changeSorting} />
						<th>Zone</th>
						<th colSpan={3}>Requests</th>
						<th colSpan={8}>Responses</th>
					</tr>
					<tr className={ `${ styles['right-align'] } ${ styles['sub-header'] }` }>
						<th className={ styles.bdr } />
						<th>Name</th>
						<th>SRV</th>
						<th className={ styles.bdr }>Address</th>
						<th>Success</th>
						<th>Format error</th>
						<th>Server failure</th>
						<th>Host not found</th>
						<th>Unimplemented</th>
						<th>Operation refused</th>
						<th>Unknown</th>
						<th>Timed out</th>
					</tr>
				</thead>
				<tbody className={ styles['right-align'] }>
					{
						resolvers.map(([resolver, { requests, responses, alert }]) =>
							<tr>
								<td className={ alert ? styles.alert : styles.ok } />
								<td className={ `${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }` }>{ resolver }</td>
								<td>{ requests.name }</td>
								<td>{ requests.srv }</td>
								<td className={ styles.bdr }>{ requests.addr }</td>
								<td>{ responses.noerror }</td>
								<td>{ responses.formerr }</td>
								<td>{ responses.servfail }</td>
								<td>{ responses.nxdomain }</td>
								<td>{ responses.notimp }</td>
								<td>{ responses.refused }</td>
								<td>{ responses.unknown }</td>
								<td>{ responses.timedout }</td>
							</tr>
						)
					}
				</tbody>
			</table>
		</div>);
	}
}

export default DataBinder(Resolvers, [
	api.resolvers.setMapper(mapperResolvers).process(calculateResolvers)
]);
