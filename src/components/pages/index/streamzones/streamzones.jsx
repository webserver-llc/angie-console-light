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
import DataBinder from '../../../databinder/databinder.jsx';
import api from '#/api';
import mapperStreamServerZones from '../../../../api/mappers/streamServerZones.js';
import utils from '#/utils.js';
import { zones } from '#/calculators/stream.js';

export class StreamZones extends React.Component {
	formatReadableBytes(value) {
		const { t } = this.props;
		return utils.formatReadableBytes(value, undefined, utils.translateReadableBytesUnits({ t }));
	}

	render() {
		const { props: { t, data, store } } = this;
		const stats = data.server_zones.__STATS;

		return (
			<IndexBox
				title={t('TCP/UDP Zones')}
				status={store.__STATUSES.tcp_zones.status}
				href="#tcp_zones"
			>
				<p>
					{t('Conn total')}
					:
					{' '}
					{stats.conn_total}
				</p>
				<p>
					{t('Conn current')}
					:
					{' '}
					{stats.conn_current}
				</p>
				<p>
					{t('Conn/s')}
					:
					{' '}
					{stats.conn_s}
				</p>

				<h4>{t('Traffic')}</h4>
				<p>
					{t('In', { ns: 'common' })}
					:
					{' '}
					{stats.traffic.in ? `${this.formatReadableBytes(stats.traffic.in)}/${t('sec', { ns: 'common' })}.` : 0}
				</p>
				<p>
					{t('Out', { ns: 'common' })}
					:
					{' '}
					{stats.traffic.out ? `${this.formatReadableBytes(stats.traffic.out)}/${t('sec', { ns: 'common' })}.` : 0}
				</p>
			</IndexBox>
		);
	}
}

export default DataBinder(withNamespaces('pages.streamzones')(StreamZones), [
	api.stream.server_zones.setMapper(mapperStreamServerZones).process(zones)
]);
