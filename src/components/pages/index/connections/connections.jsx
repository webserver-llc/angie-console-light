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

	render() {
		const { props: { data: { connections, ssl } }, state: { tab } } = this;

		return (<IndexBox className={this.props.className}>
			{
				this.state.tab === 'conns' ?
					<span styleName="counter">Accepted:{connections.accepted}</span>
				: null
			}

			<div styleName="tabs">
				<div styleName={tab === 'conns' ? 'tab-active' : 'tab'} onClick={() => this.changeTab('conns')}>
					<span>Connections</span>
				</div>
				<div styleName={tab === 'ssl' ? 'tab-active' : 'tab'} onClick={() => this.changeTab('ssl')}>
					<span>SSL</span>
				</div>
			</div>

			{
				this.state.tab === 'conns' ?
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
					<table styleName="table">
						<tr>
							<th>Handshakes</th>
							<th>Handshakes failed</th>
							<th>Session reuses</th>
						</tr>
						<tr>
							<td>{ ssl.handshakes }</td>
							<td>{ ssl.handshakes_failed }</td>
							<td>{ ssl.session_reuses }</td>
						</tr>
					</table>
			}
		</IndexBox>);
	}
}

export default DataBinder(Connections, [
	api.connections.process(calculateConnections),
	api.ssl
]);
