/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import React from 'react';
import {
	VERSION,
	MIN_CACHE_DATA_INTERVAL,
	MAX_CACHE_DATA_INTERVAL,
	DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT,
	DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT
} from '../../constants.js';
import appsettings from '../../appsettings';
import NumberControl from './NumberControl.jsx';
import NumberInput from '../numberinput/numberinput.jsx';

import styles from './style.css';

export default class Settings extends React.Component {
	constructor() {
		super();

		this.state = {
			updatingPeriod: appsettings.getSetting('updatingPeriod'),
			warnings4xxThresholdPercent: appsettings.getSetting('warnings4xxThresholdPercent'),
			cacheDataInterval: appsettings.getSetting('cacheDataInterval'),
			zonesyncPendingThreshold: appsettings.getSetting('zonesyncPendingThreshold', DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT),
			resolverErrorsThreshold: appsettings.getSetting('resolverErrorsThreshold', DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT)
		};

		this.changeUpdatePeriod = this.changeUpdatePeriod.bind(this);
		this.changeCacheHitRatioInteval = this.changeCacheHitRatioInteval.bind(this);

		this.save = this.save.bind(this);
	}

	save() {
		Object.keys(this.state).forEach((key) => {
			appsettings.setSetting(key, this.state[key]);
		});

		this.props.close();
	}

	changeUpdatePeriod(updatingPeriod) {
		this.setState({ updatingPeriod: updatingPeriod || 1000 });
	}

	changePercentThreshold(prop, evt){
		let value = evt.target.value;

		if (value >= 100) {
			value = 100;
		} else if (value < 0) {
			value = 0;
		}

		this.setState({
			[prop]: value
		});
	}

	changeCacheHitRatioInteval(evt) {
		let cacheDataInterval = evt.target.value * 1000;

		cacheDataInterval = Math.max(MIN_CACHE_DATA_INTERVAL, cacheDataInterval);
		cacheDataInterval = Math.min(MAX_CACHE_DATA_INTERVAL, cacheDataInterval);

		this.setState({
			cacheDataInterval
		});
	}

	render() {
		const { statuses } = this.props;

		return (<div styleName="settings">
			<h2 styleName="title">Options</h2>

			<div styleName="section">
				Update every <NumberControl value={this.state.updatingPeriod} onChange={this.changeUpdatePeriod} /> sec
			</div>

			<div styleName="section">4xx warnings threshold
				<NumberInput
					defaultValue={this.state.warnings4xxThresholdPercent}
					onChange={this.changePercentThreshold.bind(this, 'warnings4xxThresholdPercent')}
					styleName="input"
				/> %
			</div>

			<div styleName="section">
				Calculate hit ratio for the past

				<NumberInput
					defaultValue={this.state.cacheDataInterval / 1000}
					styleName="wide-input"
					onChange={this.changeCacheHitRatioInteval}
				/> sec
			</div>

			{
				statuses.zone_sync && statuses.zone_sync.ready ?
					<div styleName="section">
						Non synced data threshold

						<NumberInput
							defaultValue={this.state.zonesyncPendingThreshold}
							onChange={this.changePercentThreshold.bind(this, 'zonesyncPendingThreshold')}
							styleName="input"
						/> %
					</div>
				: null
			}

			{
				statuses.resolvers && statuses.resolvers.ready ?
					<div styleName="section">
						Resolver errors threshold

						<NumberInput
							defaultValue={this.state.resolverErrorsThreshold}
							onChange={this.changePercentThreshold.bind(this, 'resolverErrorsThreshold')}
							styleName="input"
						/> %
					</div>
				: null
			}

			<div styleName="section">
				<button onClick={this.save} styleName="save">Save</button>
				<button onClick={this.props.close} styleName="cancel">Cancel</button>
			</div>

			<div styleName="section help">
				For more information, please check
				<br />
				<a
					target="_blank"
					href="https://docs.nginx.com/nginx/admin-guide/monitoring/live-activity-monitoring/#dashboard"
					styleName="help-link"
				>NGINX Admin Guide</a>
			</div>

			<span styleName="version">v{ VERSION }</span>
		</div>);
	}
}