/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import React from 'react';
import { getSetting, setSetting } from '../../../appsettings';
import TableSortControl from '../../table/tablesortcontrol.jsx';
import UpstreamsList from '../../upstreams/upstreamslist.jsx';
import { formatReadableBytes, formatUptime, formatMs } from '../../../utils.js';
import { useTooltip } from '../../../tooltips/index.jsx';
import PeerTooltip from '../../upstreams/PeerTooltip.jsx';
import styles from '../../table/style.css';

export default class Upstream extends UpstreamsList {
	constructor(props) {
		super(props);

		Object.assign(this.state, {
			hoveredColumns: false,
			columnsExpanded: getSetting(`columns-expanded-http-upstreams-${props.name}`, false)
		});

		this.toggleColumns = this.toggleColumns.bind(this);
		this.hoverColumns = this.hoverColumns.bind(this);
	}

	get SORTING_SETTINGS_KEY() {
		return `sorting-http-upstreams-${this.props.name}`;
	}

	get FILTERING_SETTINGS_KEY() {
		return `filtering-http-upstreams-${this.props.name}`;
	}

	toggleColumns() {
		const columnsExpanded = !this.state.columnsExpanded;

		this.setState({
			columnsExpanded
		});

		setSetting(`columns-expanded-http-upstreams-${this.props.name}`, columnsExpanded);
	}

	hoverColumns(hoveredColumns) {
		if (this.state.columnsExpanded) {
			this.setState({
				hoveredColumns
			});
		}
	}

	renderPeers(peers) {
		return (
			<table styleName={`table wide ${this.state.hoveredColumns ? 'hovered-expander' : ''}`}>
				<col width="10px" />
				{this.state.editMode ? <col width="1%" /> : null}
				<col width="210px" />
				<col width="1%" />

				<col />
				<col />
				<col />

				<col width="20px" />

				{ this.state.columnsExpanded ? [<col key="0" />, <col key="1" />, <col key="2" />] : null }

				<col />
				<col />
				<col width="1%" />
				<col width="1%" />
				<col width="1%" />
				<col width="1%" />
				<col />
				<col />
				<col />
				<col />
				<col />
				<col />
				<col />
				<col />
				<col />
				<col />

				<thead>
					<tr>
						<TableSortControl order={this.state.sortOrder} onChange={this.changeSorting} />

						{ this.getSelectAllCheckbox(peers) }

						<th colSpan="3">Server</th>
						<th colSpan="2">Requests</th>
						<th colSpan={this.state.columnsExpanded ? 6 : 3}>Responses</th>
						<th colSpan="2">Conns</th>
						<th colSpan="4">Traffic</th>
						<th colSpan="2">Server checks</th>
						<th colSpan="4">Health monitors</th>
						<th colSpan="2">Response time</th>
					</tr>
					<tr styleName="right-align sub-header">
						<th styleName="left-align">Name</th>
						<th styleName="left-align">DT</th>
						<th styleName="center-align bdr">W</th>
						<th>Total</th>
						<th styleName="bdr">Req/s</th>

						{
							this.state.columnsExpanded ?
								[
									<th styleName="center-align" key="empty" />,
									<th key="1xx" styleName="responses-column">1xx</th>,
									<th key="2xx" styleName="responses-column">2xx</th>,
									<th key="3xx" styleName="responses-column">3xx</th>
								]
							: <th styleName="center-align">...</th>
						}

						<th>4xx</th>
						<th styleName="bdr">5xx</th>

						<th>A</th>
						<th styleName="bdr">L</th>

						<th>Sent/s</th>
						<th>Rcvd/s</th>
						<th >Sent</th>
						<th styleName="bdr">Rcvd</th>
						<th>Fails</th>
						<th styleName="bdr">Unavail</th>
						<th>Checks</th>
						<th>Fails</th>
						<th>Unhealthy</th>
						<th styleName="bdr left-align">Last</th>
						<th>Headers</th>
						<th>Response</th>
					</tr>
				</thead>

				<tbody styleName="right-align">
					{
						peers.length === 0 ?
							this.renderEmptyList()
						:
							peers.map((peer, i) => (
								<tr>
									<td styleName={peer.state} />

									{ this.getCheckbox(peer) }

									<td styleName="left-align bold address">
										<div styleName="address-container" {...useTooltip(<PeerTooltip peer={peer} />)}>
											{ peer.backup ? <span>b&nbsp;</span> : null }{ peer.server }
										</div>

										{
											this.state.editMode ?
												<span styleName="edit-peer" onClick={() => this.editSelectedUpstream(peer)} />
											: null
										}
									</td>
									<td styleName="left-align">{ formatUptime(peer.downtime, true) }</td>
									<td styleName="center-align bdr">{ peer.weight }</td>
									<td>{ peer.requests }</td>
									<td styleName="bdr">{ peer.server_req_s }</td>

									{
										this.state.columnsExpanded ?
											[
												i === 0 ? <td styleName="collapse-columns"
													rowspan={peers.length}
													onClick={this.toggleColumns}
													onMouseEnter={() => this.hoverColumns(true)}
													onMouseLeave={() => this.hoverColumns(false)}
													key="toggle"
												>◀</td> : null,
												<td styleName="responses-column" key="1xx">{ peer.responses['1xx'] }</td>,
												<td styleName="responses-column" key="2xx">{ peer.responses['2xx'] }</td>,
												<td styleName="responses-column" key="3xx">{ peer.responses['3xx'] }</td>
											]
											: i === 0 ? <td styleName="collapse-columns" rowspan={peers.length} onClick={this.toggleColumns}>▶</td> : null
									}

									<td styleName={`flash ${peer['4xxChanged'] ? 'red-flash' : ''}`}>{ peer.responses['4xx'] }</td>
									<td styleName={`bdr flash ${peer['5xxChanged'] ? 'red-flash' : ''}`}>{ peer.responses['5xx'] }</td>

									<td styleName="center-align">{ peer.active }</td>
									<td styleName="center-align bdr">{ peer.max_conns === Infinity ? <span>&infin;</span> : peer.max_conns }</td>

									<td styleName="traffic-column px60">{ formatReadableBytes(peer.server_sent_s) }</td>
									<td styleName="traffic-column px60">{ formatReadableBytes(peer.server_rcvd_s) }</td>
									<td>{ formatReadableBytes(peer.sent) }</td>
									<td>{ formatReadableBytes(peer.received) }</td>
									<td>{ peer.fails }</td>
									<td styleName="bdr">{ peer.unavail }</td>

									<td>{ peer.health_checks.checks }</td>
									<td>{ peer.health_checks.fails }</td>
									<td>{ peer.health_checks.unhealthy }</td>

									<td styleName={`left-align bdr flash ${peer.health_status === false ? 'red-flash' : null}`}>
										{ peer.health_status === null ? '–' : peer.health_status ? 'passed' : 'failed' }
									</td>

									<td>{ formatMs(peer.header_time) }</td>
									<td>{ formatMs(peer.response_time) }</td>
								</tr>
							))
					}
				</tbody>
			</table>
		);
	}
}