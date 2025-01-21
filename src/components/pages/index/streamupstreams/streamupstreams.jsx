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
import { UpstreamsBox } from '../upstreams/upstreams.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import { apiStreamUpstreams } from '../../../../api';

export class StreamUpstreams extends React.Component {
	render() {
		const { props: { t, data, store } } = this;
		const stats = data.upstreams.__STATS;

		return (
			<UpstreamsBox
				title={t('TCP/UDP Upstreams')}
				stats={stats}
				status={store.__STATUSES.tcp_upstreams.status}
				href="#tcp_upstreams"
				t={t}
			/>
		);
	}
}

export default DataBinder(withNamespaces('pages.streamupstreams')(StreamUpstreams), [
	apiStreamUpstreams
]);
