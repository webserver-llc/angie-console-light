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
import { zones } from '#/calculators/stream.js';

import HumanReadableBytes from '../../../human-readable-bytes/human-readable-bytes.jsx';

export class StreamZones extends React.Component {
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
					<HumanReadableBytes value={stats.traffic.in} postfix={`/${t('sec', { ns: 'common' })}`} />
				</p>
				<p>
					{t('Out', { ns: 'common' })}
					:
					{' '}
					<HumanReadableBytes value={stats.traffic.out} postfix={`/${t('sec', { ns: 'common' })}`} />
				</p>
			</IndexBox>
		);
	}
}

export default DataBinder(withNamespaces('pages.streamzones')(StreamZones), [
	api.stream.server_zones.setMapper(mapperStreamServerZones).process(zones)
]);
