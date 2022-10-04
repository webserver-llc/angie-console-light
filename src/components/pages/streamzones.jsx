/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';

import api from '#/api';
import DataBinder from '../databinder/databinder.jsx';
import calculateStreamLimitConn from '#/calculators/streamlimitconn.js';
import LimitConn from './serverzones/limitconn.jsx';
import utils from '#/utils.js';
import styles from '../table/style.css';

export class StreamZones extends React.Component {
	render() {
		const { data: {
			server_zones,
			limit_conns
		} } = this.props;

		return (<div>
			<h1>TCP/UDP Zones</h1>

			<table className={ styles.table }>
				<thead>
					<tr>
						<th>Zone</th>
						<th colSpan={3}>Connections</th>
						<th colSpan={4}>Sessions</th>
						<th colSpan={4}>Traffic</th>
					</tr>
					<tr className={ `${ styles['right-align'] } ${ styles['sub-header'] }` }>
						<th className={ styles.bdr } />
						<th>Current</th>
						<th>Total</th>
						<th className={ styles.bdr }>Conn/s</th>
						<th>2xx</th>
						<th>4xx</th>
						<th>5xx</th>
						<th className={ styles.bdr }>Total</th>
						<th>Sent/s</th>
						<th>Rcvd/s</th>
						<th>Sent</th>
						<th>Rcvd</th>
					</tr>
				</thead>
				<tbody className={ styles['right-align'] }>
					{
						Array.from(server_zones).map(([name, zone]) =>
							(<tr>
								<td className={ `${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }` }>{ name }</td>
								<td>{ zone.processing }</td>
								<td>{ zone.connections }</td>
								<td className={ styles.bdr }>{ zone.zone_conn_s }</td>
								<td>{ zone.sessions['2xx'] }</td>
								<td className={`${ styles.flash }${zone['4xxChanged'] ? (' ' + styles['red-flash']) : ''}`}>
									{ zone.sessions['4xx'] }
								</td>
								<td className={`${ styles.flash }${zone['5xxChanged'] ? (' ' + styles['red-flash']) : ''}`}>
									{ zone.sessions['5xx'] }
								</td>
								<td className={ styles.bdr }>{ zone.sessions.total }</td>
								<td className={ styles.px60 }>{ utils.formatReadableBytes(zone.sent_s) }</td>
								<td className={ styles.px60 }>{ utils.formatReadableBytes(zone.rcvd_s) }</td>
								<td className={ styles.px60 }>{ utils.formatReadableBytes(zone.sent) }</td>
								<td className={ styles.px60 }>{ utils.formatReadableBytes(zone.received) }</td>
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
