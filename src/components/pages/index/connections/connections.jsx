/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import IndexBox from '../indexbox/indexbox.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '../../../../api';
import calculateConnections from '../../../../calculators/connections.js';
import calculateSSL from '../../../../calculators/ssl.js'

import styles from './style.css';

export class Connections extends React.Component {
	constructor() {
		super();

		this.state = {
			tab: 'conns'
		};
	}

	changeTab(tab) {
		this.setState({ tab });
	}

	getCurrentCell(value){
		return (
			<td styleName="current">
				{ value }
				{
					typeof value == 'number' ?
						<span styleName="current__sec">/s</span>
					: null
				}
			</td>
		);
	}

	render() {
		const { props: { data: { connections, ssl } }, state: { tab } } = this;
		let tabsStyleName = 'tabs';
		let isConnsTab = this.state.tab === 'conns';

		if (!isConnsTab) {
			tabsStyleName += ' tabs_ssl';
		}

		return (<IndexBox className={this.props.className}>
			{
				isConnsTab ?
					<span styleName="counter">Accepted:{connections.accepted}</span>
				: null
			}

			<div styleName={ tabsStyleName }>
				<div styleName={isConnsTab ? 'tab-active' : 'tab'} onClick={() => this.changeTab('conns')}>
					<span>Connections</span>
				</div>
				<div styleName={!isConnsTab ? 'tab-active' : 'tab'} onClick={() => this.changeTab('ssl')}>
					<span>SSL</span>
				</div>
			</div>

			{
				isConnsTab ?
					<table styleName="table">
						<tr>
							<th>Current</th>
							<th>Accepted/s</th>
							<th>Active</th>
							<th>Idle</th>
							<th>Dropped</th>
						</tr>
						<tr>
							<td>{ connections.current }</td>
							<td>{ connections.accepted_s }</td>
							<td>{ connections.active }</td>
							<td>{ connections.idle }</td>
							<td>{ connections.dropped }</td>
						</tr>
					</table>
					:
					<table styleName="table ssl">
						<tr>
							<th width="16%"/>
							<th>Handshakes</th>
							<th>Handshakes failed</th>
							<th>Session reuses</th>
						</tr>
						<tr>
							<td>total</td>
							<td>{ ssl.handshakes }</td>
							<td>{ ssl.handshakes_failed }</td>
							<td>{ ssl.session_reuses }</td>
						</tr>
						<tr>
							<td>current</td>
							{ this.getCurrentCell(ssl.handshakes_s) }
							{ this.getCurrentCell(ssl.handshakes_failed_s) }
							{ this.getCurrentCell(ssl.session_reuses_s) }
						</tr>
					</table>
			}
		</IndexBox>);
	}
}

export default DataBinder(Connections, [
	api.connections.process(calculateConnections),
	api.ssl.process(calculateSSL)
]);
