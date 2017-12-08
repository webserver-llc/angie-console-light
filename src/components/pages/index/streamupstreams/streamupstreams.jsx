/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import { UpstreamsBox } from '../upstreams/upstreams.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '../../../../api';
import { upstreams } from '../../../../calculators/stream.js';

export class StreamUpstreams extends React.Component {
	render() {
		const { props: { data, store } } = this;
		const stats = data.upstreams.__STATS;

		return (
			<UpstreamsBox
				title="TCP/UDP Upstreams"
				stats={stats}
				status={store.__STATUSES.tcp_upstreams.status}
				href="#tcp_upstreams"
			/>
		);
	}
}

export default DataBinder(StreamUpstreams, [
	api.stream.upstreams.process(upstreams)
]);
