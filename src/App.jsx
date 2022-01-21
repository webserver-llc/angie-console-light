/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
/* global __ENV__ */

import React from 'react';
import createHistory from 'history/createBrowserHistory';
import styles from './style.css';
import Header from './components/header/header.jsx';
import Footer from './components/footer/footer.jsx';
import Loader from './components/loader/loader.jsx';
import Index from './components/pages/index/index.jsx';
import ServerZones from './components/pages/serverzones/index.jsx';
import Upstreams from './components/pages/upstreams/index.jsx';
import StreamZones from './components/pages/streamzones.jsx';
import StreamUpstreams from './components/pages/streamupstreams/index.jsx';
import Caches from './components/pages/caches/index.jsx';
import SharedZones from './components/pages/sharedzones.jsx';
import UpdatingControl from './components/updating-controll/updating-control.jsx';
import ZoneSync from './components/pages/zonesync.jsx';
import Resolvers from './components/pages/resolvers.jsx';

import Disclaimer from './components/demo/disclaimer.jsx';
import { STORE, startObserve, play, pause } from './datastore';

export const history = createHistory();

export const SECTIONS = {
	'#': Index,
	'#server_zones': ServerZones,
	'#upstreams': Upstreams,
	'#tcp_zones': StreamZones,
	'#tcp_upstreams': StreamUpstreams,
	'#caches': Caches,
	'#shared_zones': SharedZones,
	'#cluster': ZoneSync,
	'#resolvers': Resolvers
};

export const Errors = {
	'basic_auth': 'Access to /api/ location is forbidden. Check NGINX configuration.',
	'old_status_found': 'No data received from /api/ location, but found deprecated /status/ location. Сheck NGINX configuration.',
	'api_not_found': 'No data received from /api/ location. Check NGINX configuration.'
};

export default class App extends React.Component {
	constructor() {
		super();

		this.state = {
			hash: history.location.hash || '#'
		};
	}

	componentDidMount() {
		history.listen(({ hash }) => {
			this.setState({
				hash: hash || '#'
			});
		});
	}

	render() {
		const { error, loading } = this.props;

		if (loading) {
			return (
				<div className={ styles.splash }>
					<span className={ styles.logo } />
					<Loader className={ styles.loader } />
					<span className={ styles.loading }>Loading...</span>
				</div>
			);
		}

		let content;

		if (error) {
			let subContent = null;

			if (error in Errors) {
				subContent = <p>{ Errors[error] }</p>;
			}

			content = (
				<div className={ styles['error-block'] }>
					{ subContent }
					<p>For&nbsp;more information please refer to&nbsp;the&nbsp;following <a href="https://www.nginx.com/resources/admin-guide/monitoring/">documentation.</a></p>
				</div>
			);
		} else {
			const Page = SECTIONS[this.state.hash];

			content = <Page />;
		}

		return (
			<div className={ styles.dashboard }>

				{
					__ENV__ === 'demo' ?
						<Disclaimer />
					: null
				}

				<Header hash={this.state.hash} navigation={!error} statuses={STORE.__STATUSES} />

				<div className={ styles.content }>
					{
						!this.props.error ?
							<UpdatingControl play={play} pause={pause} update={startObserve} />
						: null
					}

					{ content }
				</div>

				<Footer />
			</div>
		);
	}
}
