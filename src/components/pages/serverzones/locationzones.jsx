/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import api from '../../../api';
import DataBinder from '../../databinder/databinder.jsx';
import calculateLocationZones from '../../../calculators/locationzones.js';
import { formatReadableBytes } from '../../../utils';
import SortableTable from '../../table/sortabletable.jsx';
import TableSortControl from '../../table/tablesortcontrol.jsx';
import { useTooltip } from '../../../tooltips/index.jsx';
import styles from '../../table/style.css';

export class Locations extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'locationsSortOrder';
	}

	render(){
		const { data: { location_zones } } = this.props;
		let component = null;

		if (location_zones) {
			const locations = Array.from(location_zones);

			if (this.state.sortOrder === 'desc') {
				locations.sort( ([nameA, a], [nameB, b]) =>
					a.alert || a.warning ? - 1 : 1
				);
			}

			component = (<div>
				<h1>Location zones</h1>

				<table styleName="table wide">
					<thead>
						<tr>
							<TableSortControl order={this.state.sortOrder} onChange={this.changeSorting} />
							<th>Zone</th>
							<th colSpan="2">Requests</th>
							<th colSpan="6">Responses</th>
							<th colSpan="4">Traffic</th>
						</tr>
						<tr styleName="right-align sub-header">
							<th styleName="bdr" />
							<th>Total</th>
							<th styleName="bdr">Req/s</th>
							<th>1xx</th>
							<th>2xx</th>
							<th>3xx</th>
							<th>4xx</th>
							<th>5xx</th>
							<th styleName="bdr">Total</th>
							<th>Sent/s</th>
							<th>Rcvd/s</th>
							<th>Sent</th>
							<th>Rcvd</th>
						</tr>
					</thead>
					<tbody styleName="right-align">
						{
							locations.map(([name, location]) => {
								let status = 'ok';

								if (location.warning) {
									status = 'warning';
								} else if (location['5xxChanged']) {
									status = 'alert';
								}

								return (<tr>
									<td styleName={ status } />
									<td styleName="left-align bold bdr">{ name }</td>
									<td>{ location.requests }</td>
									<td styleName="bdr">{ location.zone_req_s }</td>
									<td>{ location.responses['1xx'] }</td>
									<td>{ location.responses['2xx'] }</td>
									<td>{ location.responses['3xx'] }</td>
									<td styleName={`flash ${location['4xxChanged'] ? 'red-flash' : ''}`}>
										<span
											styleName="hinted"
											{ ... useTooltip(<div>4xx: { location.responses['4xx'] } <br /> 499/444/408: { location.discarded }</div>, 'hint') }
										>
											{ location.responses['4xx'] + location.discarded }
										</span>
									</td>
									<td styleName={`flash ${location['5xxChanged'] ? 'red-flash' : ''}`}>{ location.responses['5xx'] }</td>
									<td styleName="bdr">{ location.responses.total }</td>
									<td styleName="px60">{ formatReadableBytes(location.sent_s) }</td>
									<td styleName="px60">{ formatReadableBytes(location.rcvd_s) }</td>
									<td styleName="px60">{ formatReadableBytes(location.sent) }</td>
									<td styleName="px60">{ formatReadableBytes(location.received) }</td>
								</tr>);
							})
						}
					</tbody>
				</table>
			</div>);
		}

		return component;
	}
}

export default DataBinder(Locations, [
	api.http.location_zones.process(calculateLocationZones)
]);
