/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import api from '../../api';
import DataBinder from '../databinder/databinder.jsx';
import calculateStreamLimitConn from '../../calculators/streamlimitconn.js';
import LimitConn from './serverzones/limitconn.jsx';
import { formatReadableBytes } from '../../utils';
import styles from '../table/style.css';

export class StreamZones extends React.Component {
	render() {
		const { data: {
			server_zones,
			limit_conns
		} } = this.props;

		return (<div>
			<h1>TCP/UDP Zones</h1>

			<table styleName="table">
				<thead>
					<tr>
						<th>Zone</th>
						<th colSpan={3}>Connections</th>
						<th colSpan={4}>Sessions</th>
						<th colSpan={4}>Traffic</th>
					</tr>
					<tr styleName="right-align sub-header">
						<th styleName="bdr" />
						<th>Current</th>
						<th>Total</th>
						<th styleName="bdr">Conn/s</th>
						<th>2xx</th>
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
						Array.from(server_zones).map(([name, zone]) =>
							(<tr>
								<td styleName="left-align bold bdr">{ name }</td>
								<td>{ zone.processing }</td>
								<td>{ zone.connections }</td>
								<td styleName="bdr">{ zone.zone_conn_s }</td>
								<td>{ zone.sessions['2xx'] }</td>
								<td styleName={`flash ${zone['4xxChanged'] ? 'red-flash' : ''}`}>{ zone.sessions['4xx'] }</td>
								<td styleName={`flash ${zone['5xxChanged'] ? 'red-flash' : ''}`}>{ zone.sessions['5xx'] }</td>
								<td styleName="bdr">{ zone.sessions.total }</td>
								<td styleName="px60">{ formatReadableBytes(zone.sent_s) }</td>
								<td styleName="px60">{ formatReadableBytes(zone.rcvd_s) }</td>
								<td styleName="px60">{ formatReadableBytes(zone.sent) }</td>
								<td styleName="px60">{ formatReadableBytes(zone.received) }</td>
							</tr>)
						)
					}
				</tbody>
			</table>
			<br/>

			{
				limit_conns ?
					<LimitConn data={ limit_conns } />
				: null
			}
		</div>);
	}
}

export default DataBinder(StreamZones, [
	api.stream.server_zones,
	api.stream.limit_conns.process(calculateStreamLimitConn),
]);
