/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import 'babel-polyfill';
import React from 'react';
import AboutNginx from './aboutnginx/aboutnginx.jsx';
import Connections from './connections/connections.jsx';
import Requests from './requests/requests.jsx';
import ServerZones from './serverzones/serverzones.jsx';
import Upstreams from './upstreams/upstreams.jsx';
import StreamZones from './streamzones/streamzones.jsx';
import StreamUpstreams from './streamupstreams/streamupstreams.jsx';
import Caches from './caches/caches.jsx';
import styles from './style.css';

export default class Index extends React.Component {
	componentDidMount() {}

	render() {
		return (
			<div>
				<div styleName="row">
					<AboutNginx />
					<Connections styleName="connections" />
					<Requests />
				</div>

				<div styleName="row">
					<ServerZones />
					<Upstreams />
					<StreamZones />
					<StreamUpstreams />
					<Caches />
				</div>
			</div>
		);
	}
};
