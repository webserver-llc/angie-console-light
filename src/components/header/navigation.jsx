/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import DataBinder from '../databinder/databinder.jsx';
import api from '../../api';

import Settings from '../settings/index.jsx';
import AmplifyButton from './amplify.jsx';

import Icon from '../icon/icon.jsx';
import calculateServerZones from '../../calculators/serverzones.js';
import calculateUpstreams from '../../calculators/upstreams.js';
import { zones as calculateStreamZones, upstreams as calculateStreamUpstreams } from '../../calculators/stream.js';
import calculateCaches from '../../calculators/caches.js';
import calculateSharedZones from '../../calculators/sharedzones.js';

import styles from './style.css';

const SECTIONS = [
	{
		title: 'Server zones',
		hash: '#server_zones',
		statusKey: 'server_zones'
	},
	{
		title: 'Upstreams',
		hash: '#upstreams',
		statusKey: 'upstreams'
	},
	{
		title: 'TCP/UDP Zones',
		hash: '#tcp_zones',
		statusKey: 'tcp_zones'
	},
	{
		title: 'TCP/UDP Upstreams',
		hash: '#tcp_upstreams',
		statusKey: 'tcp_upstreams'
	},
	{
		title: 'Caches',
		hash: '#caches',
		statusKey: 'caches'
	},
	{
		title: 'Shared zones',
		hash: '#shared_zones',
		statusKey: 'shared_zones'
	}
];

export class Navigation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			settings: false
		};

		this.openSettings = this.openSettings.bind(this);
		this.closeSettings = this.closeSettings.bind(this);
	}

	openSettings() {
		if (this.state.settings) {
			this.closeSettings();
			return;
		}

		this.setState({
			settings: true
		});
	}

	closeSettings() {
		this.setState({
			settings: false
		});
	}

	render() {
		const { statuses } = this.props;

		return (<div styleName="nav">
			{
				SECTIONS.map(section => {
					if (!statuses[section.statusKey].ready) {
						return null;
					}

					return (
						<a
							styleName={this.props.hash === section.hash ? 'navlinkactive' : 'navlink'}
							href={section.hash}
						>
							{
								'status' in statuses[section.statusKey] ?
									<Icon styleName="status" type={statuses[section.statusKey].status} />
								: null
							}

							<span styleName="anchor">{section.title}</span>
						</a>
					);
				})
			}

			{
				this.props.withAmplifyBtn ?
					<AmplifyButton />
				: null
			}

			<span styleName="settings" onClick={this.openSettings}>
				<Icon type="gear" />
			</span>

			{this.state.settings ? <Settings close={this.closeSettings} /> : null}
		</div>);
	}
}

export default DataBinder(Navigation, [
	api.http.server_zones.process(calculateServerZones),
	api.http.upstreams.process(calculateUpstreams),
	api.stream.server_zones.process(calculateStreamZones),
	api.stream.upstreams.process(calculateStreamUpstreams),
	api.http.caches.process(calculateCaches),
	api.slabs.process(calculateSharedZones)
], {
	ignoreEmpty: true
});
