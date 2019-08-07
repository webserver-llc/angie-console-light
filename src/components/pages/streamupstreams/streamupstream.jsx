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
			<table styleName="table wide">
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
					<tr styleName="right-align sub-header">
						<th styleName="left-align">Name</th>
						<th styleName="left-align"><span styleName="hinted" {...useTooltip('Total downtime', 'hint')}>DT</span></th>
						<th styleName="center-align bdr"><span styleName="hinted" {...useTooltip('Weight', 'hint')}>W</span></th>
						<th>Total</th>
						<th>Conn/s</th>
						<th>Active</th>
						<th styleName="bdr">Limit</th>
						<th>Sent/s</th>
						<th>Rcvd/s</th>
						<th>Sent</th>
						<th styleName="bdr">Rcvd</th>
						<th>Fails</th>
						<th styleName="bdr">Unavail</th>
						<th>Checks</th>
						<th>Fails</th>
						<th>Unhealthy</th>
						<th styleName="bdr left-align">Last</th>
						<th>Connect</th>
						<th>First byte</th>
						<th>Response</th>
					</tr>
				</thead>

				<tbody styleName="right-align">
					{
						peers.length === 0 ?
							this.renderEmptyList()
						:
							peers.map(peer => (
								<tr>
									<td styleName={peer.state} />

									{ this.getCheckbox(peer) }

									<td styleName="left-align bold address">
										<span styleName="address-container" {...useTooltip(<PeerTooltip peer={peer} />)}>
											{ peer.backup ? <span>b&nbsp;</span> : null }{ peer.server }
										</span>

										{
											this.state.editMode ?
												<span styleName="edit-peer" onClick={() => this.editSelectedUpstream(peer)} />
											: null
										}
									</td>

									<td>{ formatUptime(peer.downtime, true) }</td>
									<td styleName="bdr">{ peer.weight }</td>
									<td>
										<span styleName="hinted" {...useTooltip(<ConnectionsTooltip peer={peer} />, 'hint')}>
											{ peer.connections }
										</span>
									</td>
									<td>{ peer.server_conn_s }</td>
									<td>{ peer.active }</td>
									<td styleName="bdr">
										{ peer.max_conns === Infinity ? <span>&infin;</span> : peer.max_conns }
									</td>
									<td styleName="px60">
										{ formatReadableBytes(peer.server_sent_s) }
									</td>
									<td styleName="px60">
										{ formatReadableBytes(peer.server_rcvd_s) }
									</td>
									<td>{ formatReadableBytes(peer.sent) }</td>
									<td styleName="bdr">{ formatReadableBytes(peer.received) }</td>
									<td>{ peer.fails }</td>
									<td>{ peer.unavail }</td>
									<td>{ peer.health_checks.checks }</td>
									<td>{ peer.health_checks.fails }</td>
									<td>{ peer.health_checks.unhealthy }</td>
									<td styleName={`left-align bdr flash ${peer.health_status === false ? 'red-flash' : ''}`}>
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