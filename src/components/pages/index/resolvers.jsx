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
import mapperResolvers from '../../../api/mappers/resolvers.js';
import calculateResolvers from '../../../calculators/resolvers.js';

export class Resolvers extends React.Component {
	render() {
		const { props: { data, store } } = this;
		const stats = data.resolvers.__STATS;

		return (
			<IndexBox
				title="DNS Резолверы"
				status={store.__STATUSES.resolvers.status}
				href="#resolvers"
			>
				<AlertsCount
					href="#resolvers"
					total={stats.total}
					alerts={stats.alerts}
				/>

				<h4>Трафик</h4>
				<p>
					Зпр/сек:
					{' '}
					{stats.traffic.in ? stats.traffic.in : 0}
				</p>
				<p>
					Отв/сек:
					{' '}
					{stats.traffic.out ? stats.traffic.out : 0}
				</p>
			</IndexBox>
		);
	}
}

export default DataBinder(Resolvers, [
	api.resolvers.setMapper(mapperResolvers).process(calculateResolvers)
]);
