/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import React from 'react';
import TableSortControl from '../../table/tablesortcontrol.jsx';
import UpstreamsList from '../../upstreams/upstreamslist.jsx';
import { formatReadableBytes, formatUptime, formatMs } from '../../../utils.js';
import { useTooltip } from '../../../tooltips/index.jsx';
import PeerTooltip from '../../upstreams/PeerTooltip.jsx';
import ConnectionsTooltip from '../../upstreams/ConnectionsTooltip.jsx';

import styles from '../../table/style.css';

export default class StreamUpstream extends UpstreamsList {
	get SORTING_SETTINGS_KEY() {
		return `sorting-stream-upstreams-${this.props.name}`;
	}

	get FILTERING_SETTINGS_KEY() {
		return `filtering-stream-upstreams-${this.props.name}`;
	}

	renderPeers(peers) {
		return (
			<table className={ `${ styles.table } ${ styles.wide }` }>
				<thead>
					<tr>
						<TableSortControl
							secondSortLabel="Sort by status - down first"
							order={this.state.sortOrder}
							onChange={this.changeSorting}
						/>

						{ this.getSelectAllCheckbox(peers) }

						<th colSpan="3">Server</th>
						<th colSpan="4">Connection</th>
						<th colSpan="4">Traffic</th>
						<th colSpan="2">Server checks</th>
						<th colSpan="4">Health monitors</th>
						<th colSpan="3">Response time</th>
					</tr>
					<tr className={ `${ styles['right-align'] } ${ styles['sub-header'] }` }>
						<th className={ styles['left-align'] }>Name</th>
						<th className={ styles['left-align'] }>
							<span className={ styles.hinted } {...useTooltip('Total downtime', 'hint')}>DT</span>
						</th>
						<th className={ `${ styles['center-align'] } ${ styles.bdr }` }>
							<span className={ styles.hinted } {...useTooltip('Weight', 'hint')}>W</span>
						</th>
						<th>Total</th>
						<th>Conn/s</th>
						<th>Active</th>
						<th className={ styles.bdr }>Limit</th>
						<th>Sent/s</th>
						<th>Rcvd/s</th>
						<th>Sent</th>
						<th className={ styles.bdr }>Rcvd</th>
						<th>Fails</th>
						<th className={ styles.bdr }>Unavail</th>
						<th>Checks</th>
						<th>Fails</th>
						<th>Unhealthy</th>
						<th className={ `${ styles.bdr } ${ styles['left-align'] }` }>Last</th>
						<th>Connect</th>
						<th>First byte</th>
						<th>Response</th>
					</tr>
				</thead>

				<tbody className={ styles['right-align'] }>
					{
						peers.length === 0 ?
							this.renderEmptyList()
						:
							peers.map(peer => (
								<tr>
									<td className={ styles[peer.state] } />

									{ this.getCheckbox(peer) }

									<td className={ `${ styles['left-align'] } ${ styles.bold } ${ styles.address }` }>
										<span className={ styles['address-container'] } {...useTooltip(<PeerTooltip peer={peer} />)}>
											{ peer.backup ? <span>b&nbsp;</span> : null }{ peer.server }
										</span>

										{
											this.state.editMode ?
												<span className={ styles['edit-peer'] } onClick={() => this.editSelectedUpstream(peer)} />
											: null
										}
									</td>

									<td>{ formatUptime(peer.downtime, true) }</td>
									<td className={ styles.bdr }>{ peer.weight }</td>
									<td>
										<span className={ styles.hinted } {...useTooltip(<ConnectionsTooltip peer={peer} />, 'hint')}>
											{ peer.connections }
										</span>
									</td>
									<td>{ peer.server_conn_s }</td>
									<td>{ peer.active }</td>
									<td className={ styles.bdr}>
										{ peer.max_conns === Infinity ? <span>&infin;</span> : peer.max_conns }
									</td>
									<td className={ styles.px60}>
										{ formatReadableBytes(peer.server_sent_s) }
									</td>
									<td className={ styles.px60}>
										{ formatReadableBytes(peer.server_rcvd_s) }
									</td>
									<td>{ formatReadableBytes(peer.sent) }</td>
									<td className={ styles.bdr}>{ formatReadableBytes(peer.received) }</td>
									<td>{ peer.fails }</td>
									<td>{ peer.unavail }</td>
									<td>{ peer.health_checks.checks }</td>
									<td>{ peer.health_checks.fails }</td>
									<td>{ peer.health_checks.unhealthy }</td>
									<td className={`${ styles['left-align'] } ${ styles.bdr } ${ styles.flash }${peer.health_status === false ? (' ' + styles['red-flash']) : ''}`}>
										{ peer.health_status === null ? '–' :
											peer.health_status ? 'passed' : 'failed' }
									</td>

									<td>{ formatMs(peer.connect_time) }</td>
									<td>{ formatMs(peer.first_byte_time) }</td>
									<td>{ formatMs(peer.response_time) }</td>
								</tr>
							))
					}
				</tbody>
			</table>
		);
	}
}