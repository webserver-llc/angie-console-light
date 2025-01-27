/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
/* global __ENV__ */

import React from 'react';
import { createBrowserHistory as createHistory } from 'history';
import { withNamespaces } from 'react-i18next';

import styles from './style.css';
import Header from './components/header/header.jsx';
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
import Workers from './components/pages/workers.jsx';
import Disclaimer from './components/demo/disclaimer.jsx';
import ConfigFiles from './components/pages/configfiles/configfiles.jsx';
import FaviconManager from './components/favicon-manager/index.js';
import datastore, { STORE, startObserve, play, pause } from './datastore';
import { apiUtils } from './api';
import envUtils from './env';
import { SECTIONS as NAVIGATION_SECTIONS } from './components/header/navigation.jsx';
import { ymService } from './services/yandex-metrica';

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
	'#resolvers': Resolvers,
	'#workers': Workers,
	'#config_files': ConfigFiles,
};

export class App extends React.Component {
	static sendAnalytics(hash) {
		if (hash === '#') {
			ymService.sendHit(hash, 'Index');
			return;
		}

		const currentSection = NAVIGATION_SECTIONS.find(s => s.hash === hash);
		if (currentSection) {
			ymService.sendHit(currentSection.hash, currentSection.title);
		} else {
			console.warn('Route not found. Check Navigation component');
		}
	}

	constructor(props) {
		super(props);

		this.state = {
			hash: history.location.hash || '#',
			loading: true,
			error: undefined,
		};

		const { t } = props;
		this.errors = {
			basic_auth: t('Access to /api/ location is forbidden. Check Angie configuration.'),
			old_status_found: t('No data received from /api/ location, but found deprecated /status/ location. Check Angie configuration.'),
			api_not_found: t('No data received from /api/ location. Check Angie configuration.')
		};
	}

	componentDidMount() {
		history.listen(({ hash }) => {
			hash = hash || '#';

			this.setState({
				hash
			});

			App.sendAnalytics(hash);
		});

		apiUtils.checkApiAvailability().then(() =>
			apiUtils.initialLoad(datastore)
		).then(() => {
			this.setState({ loading: false });
			datastore.startObserve();
		}).catch((err) => {
			this.setState({ loading: false, error: err.type });
		});

		App.sendAnalytics(location.hash || '#');
	}

	render() {
		const { t } = this.props;
		const { error, loading } = this.state;

		if (loading) {
			return (
				<div className={styles.splash}>
					<span className={styles.logo} />
					<Loader className={styles.loader} />
					<span className={styles.loading}>{t('Loading')}</span>
				</div>
			);
		}

		let content;

		if (error) {
			let subContent = null;

			if (error in this.errors) {
				subContent = <p>{this.errors[error]}</p>;
			}

			content = (
				<div className={styles['error-block']}>
					{subContent}
					<p>
						{t('For more information please refer to')}
						{' '}
						<a href="https://angie.software/en/">
							{t('documentation')}
							.
						</a>
					</p>
				</div>
			);
		} else {
			const Page = SECTIONS[this.state.hash];

			content = <Page />;
		}

		return (
			<div className={styles.console}>
				<FaviconManager statuses={STORE.__STATUSES} />

				{
					envUtils.isDemoEnv() ?
						<Disclaimer />
						: null
				}

				<Header hash={this.state.hash} navigation={!error} statuses={STORE.__STATUSES} />

				<div className={styles.content}>
					{
						!this.state.error ?
							<UpdatingControl play={play} pause={pause} update={startObserve} />
							: null
					}

					{content}
				</div>
			</div>
		);
	}
}

export default {
	Component: withNamespaces('app')(App),
};
