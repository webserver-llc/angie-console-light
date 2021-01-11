/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import {
	DEFAULT_UPDATING_PERIOD,
	DEFAULT_4XX_THRESHOLD_PERCENT,
	DEFAULT_CACHE_DATA_INTERVAL,
	DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT,
	DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT
} from '../constants.js';

export class AppSettings {
	constructor(){
		this.SETTINGS_KEY_NAME = '__NGINX_PLUS_DASHBOARD';
		this.defaults = {
			updatingPeriod: DEFAULT_UPDATING_PERIOD,
			warnings4xxThresholdPercent: DEFAULT_4XX_THRESHOLD_PERCENT,
			cacheDataInterval: DEFAULT_CACHE_DATA_INTERVAL,
			zonesyncPendingThreshold: DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT,
			resolverErrorsThreshold: DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT
		};
		this.settingChangeCallbacks = new Map();
		this.currentSettings = null;
		this.subscribeCounter = 0;
	}

	saveSettings(){
		localStorage.setItem(
			this.SETTINGS_KEY_NAME,
			JSON.stringify(this.currentSettings)
		);
	}

	setSetting(propertyName, value, silent = false){
		this.currentSettings[propertyName] = value;
		this.saveSettings();

		if (!silent) {
			this.settingChangeCallbacks.forEach(cb => {
				cb(propertyName, value);
			});
		}
	}

	getSetting(propertyName, defaultValue){
		if (!(propertyName in this.currentSettings)) {
			this.setSetting(propertyName, defaultValue, true);
		}

		return this.currentSettings[propertyName];
	}

	subscribe(callback, propertyName){
		let id;

		if (
			typeof callback === 'function' &&
			propertyName &&
			typeof propertyName === 'string'
		) {
			id = `${ this.subscribeCounter++ }`;

			this.settingChangeCallbacks.set(id, (_propertyName, newValue) => {
				if (_propertyName === propertyName) {
					callback(newValue);
				}
			});
		}

		return id;
	}

	unsubscribe(id){
		if (this.settingChangeCallbacks.has(id)) {
			this.settingChangeCallbacks.delete(id);
		}
	}

	init(){
		try {
			this.currentSettings = JSON.parse(
				localStorage.getItem(this.SETTINGS_KEY_NAME)
			);
		} catch(e) {}

		if (this.currentSettings === null) {
			this.currentSettings = Object.assign({}, this.defaults);
			this.saveSettings();
		}
	}
};

const appsettings = new AppSettings();

export default appsettings;
