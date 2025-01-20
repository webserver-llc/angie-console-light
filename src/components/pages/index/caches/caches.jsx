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
import IndexBox from '../indexbox/indexbox.jsx';
import AlertsCount from '../alertscount/alertscount.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import Icon from '../../../icon/icon.jsx';

import api from '../../../../api';
import calculateCaches from '../../../../calculators/caches.js';
import styles from './style.css';

export class Caches extends React.Component {
	render() {
		const { props: { t, data, store } } = this;
		const stats = data.caches.__STATS;

		return (
			<IndexBox
				title={t('Caches')}
				status={store.__STATUSES.caches.status}
				href="#caches"
			>
				<AlertsCount
					total={stats.total}
					warnings={stats.warnings}
					alerts={stats.alerts}
					href="#caches"
				/>

				<h4>{t('State')}</h4>
				<p>
					<Icon type="sun" className={styles.icon} />
					{t('Warm')}
					:
					{' '}
					{stats.states.warm}
				</p>
				<p>
					<Icon type="snowflake" className={`${styles.icon} ${styles.snowflakeIcon}`} />
					{t('Cold')}
					:
					{' '}
					{stats.states.cold}
				</p>
			</IndexBox>
		);
	}
}

export default DataBinder(withNamespaces('pages.caches')(Caches), [
	api.http.caches.process(calculateCaches)
]);
