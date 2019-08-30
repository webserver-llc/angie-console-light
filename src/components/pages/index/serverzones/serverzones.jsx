/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import IndexBox from '../indexbox/indexbox.jsx';
import AlertsCount from '../alertscount/alertscount.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '../../../../api';
import calculateServerZones from '../../../../calculators/serverzones.js';
import calculateLocationZones from '../../../../calculators/locationzones.js';
import { formatReadableBytes } from '../../../../utils.js';

export class ServerZones extends React.Component {
	render() {
		const { props: { data, store } } = this;
		const statuses = [];
		let total = 0;
		let warnings = 0;
		let alerts = 0;
		let trafficBlock = null;

		if (data.server_zones) {
			const stats = data.server_zones.__STATS;

			total += stats.total;
			warnings += stats.warnings;
			alerts += stats.alerts;

			trafficBlock = (
				<div>
					<h4>Traffic</h4>
					<p>In: { stats.traffic.in ? `${formatReadableBytes(stats.traffic.in)}/s` : 0 }</p>
					<p>Out: { stats.traffic.out ? `${formatReadableBytes(stats.traffic.out)}/s` : 0 }</p>
				</div>
			);

			statuses.push(store.__STATUSES.server_zones.status);
		}

		if (data.location_zones) {
			const stats = data.location_zones.__STATS;

			total += stats.total;
			warnings += stats.warnings;
			alerts += stats.alerts;

			statuses.push(store.__STATUSES.location_zones.status);
		}

		return (
			<IndexBox
				title="HTTP Zones"
				status={
					statuses.includes('danger') ?
						'danger'
					: statuses.includes('warning') ?
						'warning'
					: 'ok'
				}
				href="#server_zones"
			>
				<AlertsCount
					href="#server_zones"
					total={total}
					warnings={warnings}
					alerts={alerts}
				/>

				{ trafficBlock }
			</IndexBox>
		);
	}
}

export default DataBinder(ServerZones, [
	api.http.server_zones.process(calculateServerZones),
	api.http.location_zones.process(calculateLocationZones)
]);
