/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import React from 'react';
import {VERSION, MIN_CACHE_DATA_INTERVAL, MAX_CACHE_DATA_INTERVAL} from '../../constants.js';
import {getSetting, setSetting} from '../../appsettings'
import NumberControl from './NumberControl.jsx';
import NumberInput from '../numberinput/numberinput.jsx';

import styles from './style.css';

export default class Settings extends React.Component {
	constructor() {
		super();

		this.state = {
			updatingPeriod: getSetting('updatingPeriod'),
			warnings4xxThresholdPercent: getSetting('warnings4xxThresholdPercent'),
			cacheDataInterval: getSetting('cacheDataInterval')
		};

		this.changeUpdatePeriod = this.changeUpdatePeriod.bind(this);
		this.change4xxThreshold = this.change4xxThreshold.bind(this);
		this.changeCacheHitRatioInteval = this.changeCacheHitRatioInteval.bind(this);

		this.save = this.save.bind(this);
	}

	save() {
		Object.keys(this.state).forEach((key) => {
			setSetting(key, this.state[key]);
		});

		this.props.close();
	}

	changeUpdatePeriod(updatingPeriod) {
		this.setState({ updatingPeriod: updatingPeriod || 1000 });
	}

	change4xxThreshold(evt) {
		let warnings4xxThresholdPercent = evt.target.value;

		if (warnings4xxThresholdPercent >= 100) {
			warnings4xxThresholdPercent = 100;
		} else if (warnings4xxThresholdPercent < 0) {
			warnings4xxThresholdPercent = 0;
		}

		this.setState({
			warnings4xxThresholdPercent
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
		return (<div styleName="settings">
			<h2 styleName="title">Options</h2>

			<div styleName="section">
				Update every <NumberControl value={this.state.updatingPeriod} onChange={this.changeUpdatePeriod} /> sec
			</div>

			<div styleName="section">4xx warnings threshold
				<NumberInput
					defaultValue={this.state.warnings4xxThresholdPercent}
					onChange={this.change4xxThreshold}
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

			<div styleName="section">
				<button onClick={this.save} styleName="save">Save</button>
				<button onClick={this.props.close} styleName="cancel">Cancel</button>
			</div>

			<h3 styleName="help">Help</h3>

			<div styleName="section">
				For more information, please check
				<br />
				<a href="http://nginx.com/resources/admin-guide/?from-dashboard">NGINX Admin Guide</a>
			</div>

			<span styleName="version">v{ VERSION }</span>
		</div>);
	}
}