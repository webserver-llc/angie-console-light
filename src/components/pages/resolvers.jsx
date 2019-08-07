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

			<table styleName="table wide">
				<thead>
					<tr>
						<TableSortControl order={this.state.sortOrder} onChange={this.changeSorting} />
						<th>Zone</th>
						<th colSpan={3}>Requests</th>
						<th colSpan={8}>Responses</th>
					</tr>
					<tr styleName="right-align sub-header">
						<th styleName="bdr" />
						<th>Name</th>
						<th>SRV</th>
						<th styleName="bdr">Address</th>
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
				<tbody styleName="right-align">
					{
						resolvers.map(([resolver, { requests, responses, alert }]) =>
							<tr>
								<td styleName={ alert ? 'alert' : 'ok' } />
								<td styleName="left-align bold bdr">{ resolver }</td>
								<td>{ requests.name }</td>
								<td>{ requests.srv }</td>
								<td styleName="bdr">{ requests.addr }</td>
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
	api.resolvers.process(calculateResolvers)
]);
