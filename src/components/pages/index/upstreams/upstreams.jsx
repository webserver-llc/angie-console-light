/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import IndexBox from '../indexbox/indexbox.jsx';
import AlertsCount from '../alertscount/alertscount.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '../../../../api';
import calculateUpstreams from '../../../../calculators/upstreams.js';
import styles from './style.css';

export class UpstreamsBox extends React.Component {
	render() {
		const { props: { title, stats, status, href } } = this;

		return (
			<IndexBox
				title={title}
				status={status}
				href={href}
			>
				<AlertsCount
					total={stats.total}
					warnings={stats.warnings}
					alerts={stats.alerts}
					href={href}
				/>

				<h4>Servers</h4>
				<p>All: { stats.servers.all } / Up: { stats.servers.up }</p>
				<p styleName={stats.servers.failed > 0 ? 'red' : ''}>Failed: { stats.servers.failed }</p>
			</IndexBox>
		);
	}
}

export class Upstreams extends React.Component {
	render() {
		const { props: { data, store } } = this;
		const stats = data.upstreams.__STATS;

		return (
			<UpstreamsBox
				title="HTTP Upstreams"
				stats={stats}
				status={store.__STATUSES.upstreams.status}
				href="#upstreams"
			/>
		);
	}
}

export default DataBinder(Upstreams, [
	api.http.upstreams.process(calculateUpstreams)
]);
