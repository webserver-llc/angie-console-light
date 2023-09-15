/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import AboutAngie from './aboutangie/aboutangie.jsx';
import Connections from './connections/connections.jsx';
import ServerZones from './serverzones/serverzones.jsx';
import Caches from './caches/caches.jsx';
import Upstreams from './upstreams/upstreams.jsx';
import StreamUpstreams from './streamupstreams/streamupstreams.jsx';
import Resolvers from './resolvers.jsx';
import StreamZones from './streamzones/streamzones.jsx';
import styles from './style.css';

export default class Index extends React.Component {
	componentDidMount() {}

	render() {
		return (
			<div>
				<div className={styles.row}>
					<AboutAngie className={styles.box} />
					<Connections className={styles.connections} />
				</div>

				<div className={`${ styles.row } ${ styles['row-wrap'] }`}>
					<ServerZones />
					<Upstreams />
					<StreamZones />
					<StreamUpstreams />
					<Caches />
					<Resolvers />
				</div>
			</div>
		);
	}
}
