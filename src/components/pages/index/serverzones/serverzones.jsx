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

import mapperHttpResponse from '../../../../api/mappers/httpResponse';
import IndexBox from '../indexbox/indexbox.jsx';
import AlertsCount from '../alertscount/alertscount.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '#/api';
import calculateServerZones from '#/calculators/serverzones.js';
import calculateLocationZones from '#/calculators/locationzones.js';
import utils from '#/utils.js';

export class ServerZones extends React.Component {
	formatReadableBytes(value) {
		const { t } = this.props;
		return utils.formatReadableBytes(value, undefined, utils.translateReadableBytesUnits({ t }));
	}

	render() {
		const { props: { t, data, store } } = this;
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
					<h4>{t('Traffic')}</h4>
					<p>
						{t('In')}
						:
						{' '}
						{stats.traffic.in ? `${this.formatReadableBytes(stats.traffic.in)}/${t('sec', { ns: 'common' })}` : 0}
					</p>
					<p>
						{t('Out')}
						:
						{' '}
						{stats.traffic.out ? `${this.formatReadableBytes(stats.traffic.out)}/${t('sec', { ns: 'common' })}` : 0}
					</p>
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
				title={t('HTTP Zones')}
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

				{trafficBlock}
			</IndexBox>
		);
	}
}

ServerZones.defaultProps = {
	// i18n for testings
	t: (key) => key
};

export default DataBinder(withNamespaces('pages.serverzones.serverzones')(ServerZones), [
	api.http.server_zones.setMapper(mapperHttpResponse).process(calculateServerZones),
	api.http.location_zones.setMapper(mapperHttpResponse).process(calculateLocationZones)
]);
