/**
 * Copyright 2023-present, Nginx, Inc.
 * Copyright 2023-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import IndexBox from './indexbox/indexbox.jsx';
import AlertsCount from './alertscount/alertscount.jsx';
import DataBinder from '../../databinder/databinder.jsx';
import api from '../../../api';
import calculateWorkers from '../../../calculators/workers.js';

export class Workers extends React.Component {
	render() {
		const { props: { data, store } } = this;
		const stats = data.workers.__STATS;

		return (
			<IndexBox
				title="Workers"
				status={store.__STATUSES.workers.status}
				href="#workers"
			>
				<AlertsCount
					href="#workers"
					total={stats.total}
				/>
			</IndexBox>
		);
	}
}

export default DataBinder(Workers, [
	api.workers.process(calculateWorkers)
]);
