/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import React from 'react';
import IndexBox from './indexbox/indexbox.jsx';
import AlertsCount from './alertscount/alertscount.jsx';
import DataBinder from '../../databinder/databinder.jsx';
import api from '../../../api';
import calculateZoneSync from '../../../calculators/zonesync.js';

export class ZoneSync extends React.Component {
	render() {
		const { props: { data, store } } = this;
		const stats = data.zone_sync.__STATS;

		return (
			<IndexBox
				title="Cluster"
				status={store.__STATUSES.zone_sync.status}
				href="#cluster"
			>
				<AlertsCount
					href="#cluster"
					total={stats.total}
					alerts={stats.alerts}
					warnings={stats.warnings}
				/>

				<h4>Сообщ./сек</h4>
				<p>Вхд: { stats.traffic.in ? stats.traffic.in : 0 }</p>
				<p>Исх: { stats.traffic.out ? stats.traffic.out : 0 }</p>
			</IndexBox>
		);
	}
}

export default DataBinder(ZoneSync, [
	api.stream.zone_sync.process(calculateZoneSync)
]);
