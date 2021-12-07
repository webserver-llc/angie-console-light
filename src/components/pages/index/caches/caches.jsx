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
import Icon from '../../../icon/icon.jsx';

import api from '../../../../api';
import calculateCaches from '../../../../calculators/caches.js';
import styles from './style.css';

export class Caches extends React.Component {
	render() {
		const { props: { data, store } } = this;
		const stats = data.caches.__STATS;

		return (
			<IndexBox
				title="Caches"
				status={store.__STATUSES.caches.status}
				href="#caches"
			>
				<AlertsCount
					total={stats.total}
					warnings={stats.warnings}
					alerts={stats.alerts}
					href="#caches"
				/>

				<h4>Caches states</h4>
				<p><Icon type="sun" className={ styles.icon } />Warm: { stats.states.warm }</p>
				<p><Icon type="snowflake" className={ `${ styles.icon } ${ styles.snowflakeIcon }` } />Cold: { stats.states.cold }</p>
			</IndexBox>
		);
	}
}

export default DataBinder(Caches, [
	api.http.caches.process(calculateCaches)
]);
