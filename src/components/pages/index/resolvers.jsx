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
import { withNamespaces } from 'react-i18next';
import IndexBox from './indexbox/indexbox.jsx';
import AlertsCount from './alertscount/alertscount.jsx';
import DataBinder from '../../databinder/databinder.jsx';
import api from '../../../api';
import mapperResolvers from '../../../api/mappers/resolvers.js';
import calculateResolvers from '../../../calculators/resolvers.js';

export class Resolvers extends React.Component {
	render() {
		const { props: { t, data, store } } = this;
		const stats = data.resolvers.__STATS;

		return (
			<IndexBox
				title={t('Resolvers')}
				status={store.__STATUSES.resolvers.status}
				href="#resolvers"
			>
				<AlertsCount
					href="#resolvers"
					total={stats.total}
					alerts={stats.alerts}
				/>

				<h4>{t('Traffic')}</h4>
				<p>
					{t('Req/s')}
					:
					{' '}
					{stats.traffic.in ? stats.traffic.in : 0}
				</p>
				<p>
					{t('Resp/s')}
					:
					{' '}
					{stats.traffic.out ? stats.traffic.out : 0}
				</p>
			</IndexBox>
		);
	}
}

export default DataBinder(withNamespaces('pages.resolvers')(Resolvers), [
	api.resolvers.setMapper(mapperResolvers).process(calculateResolvers)
]);
