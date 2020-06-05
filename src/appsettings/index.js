/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
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

const SETTINGS_KEY_NAME = '__NGINX_PLUS_DASHBOARD';

const defaults = {
	updatingPeriod: DEFAULT_UPDATING_PERIOD,
	warnings4xxThresholdPercent: DEFAULT_4XX_THRESHOLD_PERCENT,
	cacheDataInterval: DEFAULT_CACHE_DATA_INTERVAL,
	zonesyncPendingThreshold: DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT,
	resolverErrorsThreshold: DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT
};

const settingChangeCallbacks = new Map();

let currentSettings = null;

export const saveSettings = () => {
	localStorage.setItem(SETTINGS_KEY_NAME, JSON.stringify(currentSettings));
};

export const setSetting = (propertyName, value, silent = false) => {
	currentSettings[propertyName] = value;
	saveSettings();

	if (!silent) {
		settingChangeCallbacks.forEach(cb => {
			cb(propertyName, value);
		});
	}
};

export const getSetting = (propertyName, defaultValue) => {
	if (!(propertyName in currentSettings)) {
		setSetting(propertyName, defaultValue, true);
	}

	return currentSettings[propertyName];
};

export const subscribe = (() => {
	let subscribeCounter = 0;

	return (callback, propertyName) => {
		let id;

		if (
			typeof callback === 'function' &&
			propertyName &&
			typeof propertyName === 'string'
		) {
			id = `${ subscribeCounter++ }`;

			settingChangeCallbacks.set(id, (_propertyName, newValue) => {
				if (_propertyName === propertyName) {
					callback(newValue);
				}
			});
		}

		return id;
	};
})();

export const unsubscribe = id => {
	if (settingChangeCallbacks.has(id)) {
		settingChangeCallbacks.delete(id);
	}
};

export const init = () => {
	try {
		currentSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY_NAME));
	} catch(e) {}

	if (currentSettings === null) {
		currentSettings = defaults;
		saveSettings();
	}
};
