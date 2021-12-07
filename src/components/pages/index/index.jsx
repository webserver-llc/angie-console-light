/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import "core-js/stable";
import "regenerator-runtime/runtime";
import React from 'react';
import AboutNginx from './aboutnginx/aboutnginx.jsx';
import Connections from './connections/connections.jsx';
import Requests from './requests/requests.jsx';
import ServerZones from './serverzones/serverzones.jsx';
import Upstreams from './upstreams/upstreams.jsx';
import StreamZones from './streamzones/streamzones.jsx';
import StreamUpstreams from './streamupstreams/streamupstreams.jsx';
import Caches from './caches/caches.jsx';
import ZoneSync from './zonesync.jsx';
import Resolvers from './resolvers.jsx';
import styles from './style.css';

export default class Index extends React.Component {
	componentDidMount() {}

	render() {
		return (
			<div>
				<div className={ styles.row }>
					<AboutNginx className={ styles.box } />
					<Connections className={ styles.connections } />
					<Requests className={ styles.box } />
				</div>

				<div className={ `${ styles.row } ${ styles['row-wrap'] }` }>
					<ServerZones />
					<Upstreams />
					<StreamZones />
					<StreamUpstreams />
					<Caches />
					<ZoneSync />
					<Resolvers />
				</div>
			</div>
		);
	}
};
