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

	changePercentThreshold(prop, evt) {
		let { value } = evt.target;

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

		return (
			<div className={styles.settings}>
				<h2 className={styles.title}>Параметры</h2>

				<div className={styles.section}>
					Обновлять каждые

					<NumberControl value={this.state.updatingPeriod} onChange={this.changeUpdatePeriod} />

					сек
				</div>

				<div className={styles.section}>
					Пороговое значение ошибок для 4xx
					<NumberInput
						defaultValue={this.state.warnings4xxThresholdPercent}
						onChange={this.changePercentThreshold.bind(this, 'warnings4xxThresholdPercent')}
						className={styles.input}
					/>
					{' '}
					%
				</div>

				<div className={styles.section}>
					Вычислять за последние
					<NumberInput
						defaultValue={this.state.cacheDataInterval / 1000}
						className={styles['wide-input']}
						onChange={this.changeCacheHitRatioInteval}
					/>
					{' '}
					сек
				</div>

				{
					statuses.zone_sync && statuses.zone_sync.ready ? (
						<div className={styles.section}>
							Пороговое значение для несинхронизированных данных

							<NumberInput
								defaultValue={this.state.zonesyncPendingThreshold}
								onChange={this.changePercentThreshold.bind(this, 'zonesyncPendingThreshold')}
								className={styles.input}
							/>
							{' '}
							%
						</div>
					)
						: null
				}

				{
					statuses.resolvers && statuses.resolvers.ready ? (
						<div className={styles.section}>
							Пороговое значение ошибок DNS

							<NumberInput
								defaultValue={this.state.resolverErrorsThreshold}
								onChange={this.changePercentThreshold.bind(this, 'resolverErrorsThreshold')}
								className={styles.input}
							/>
							{' '}
							%
						</div>
					)
						: null
				}

				<div className={styles.section}>
					<button onClick={this.save} className={styles.save}>Сохранить</button>
					<button onClick={this.props.close} className={styles.cancel}>Закрыть</button>
				</div>

				<span className={styles.version}>
					v
					{VERSION}
				</span>
			</div>
		);
	}
}
