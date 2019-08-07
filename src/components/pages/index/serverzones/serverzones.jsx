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
		const stats = data.server_zones.__STATS;
		let { warnings, alerts } = stats;

		if (data.location_zones) {
			const locationsStats = data.location_zones.__STATS;

			warnings += locationsStats.warnings;
			alerts += locationsStats.alerts;
		}

		return (
			<IndexBox
				title="Server zones"
				status={store.__STATUSES.server_zones.status}
				href="#server_zones"
			>
				<AlertsCount
					href="#server_zones"
					total={stats.total}
					warnings={warnings}
					alerts={alerts}
				/>

				<h4>Traffic</h4>
				<p>In: { stats.traffic.in ? `${formatReadableBytes(stats.traffic.in)}/s` : 0 }</p>
				<p>Out: { stats.traffic.out ? `${formatReadableBytes(stats.traffic.out)}/s` : 0 }</p>
			</IndexBox>
		);
	}
}

export default DataBinder(ServerZones, [
	api.http.server_zones.process(calculateServerZones),
	api.http.location_zones.process(calculateLocationZones)
]);
