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

import IndexBox from '../indexbox/indexbox.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '#/api';
import mapperStreamServerZones from '../../../../api/mappers/streamServerZones.js';
import utils from '#/utils.js';
import { zones } from '#/calculators/stream.js';

export class StreamZones extends React.Component {
	render() {
		const { props: { data, store } } = this;
		const stats = data.server_zones.__STATS;

		return (
			<IndexBox
				title="TCP/UDP-зоны"
				status={store.__STATUSES.tcp_zones.status}
				href="#tcp_zones"
			>
				<p>
					Соед. всего:
					{' '}
					{stats.conn_total}
				</p>
				<p>
					Соед. текущие:
					{' '}
					{stats.conn_current}
				</p>
				<p>
					Соед./сек.:
					{' '}
					{stats.conn_s}
				</p>

				<h4>Трафик</h4>
				<p>
					Входящий:
					{' '}
					{stats.traffic.in ? `${utils.formatReadableBytes(stats.traffic.in)}/сек.` : 0}
				</p>
				<p>
					Исходящий:
					{' '}
					{stats.traffic.out ? `${utils.formatReadableBytes(stats.traffic.out)}/сек.` : 0}
				</p>
			</IndexBox>
		);
	}
}

export default DataBinder(StreamZones, [
	api.stream.server_zones.setMapper(mapperStreamServerZones).process(zones)
]);
