/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import {
	DEFAULT_UPDATING_PERIOD,
	DEFAULT_4XX_THRESHOLD_PERCENT,
	DEFAULT_CACHE_DATA_INTERVAL
} from '../constants.js';

const SETTINGS_KEY_NAME = '__NGINX_PLUS_DASHBOARD';

const defaults = {
	updatingPeriod: DEFAULT_UPDATING_PERIOD,
	warnings4xxThresholdPercent: DEFAULT_4XX_THRESHOLD_PERCENT,
	cacheDataInterval: DEFAULT_CACHE_DATA_INTERVAL
};

let currentSettings = null;

export const saveSettings = () => {
	localStorage.setItem(SETTINGS_KEY_NAME, JSON.stringify(currentSettings));
};

export const setSetting = (propertyName, value) => {
	currentSettings[propertyName] = value;
	saveSettings();
};

export const getSetting = (propertyName, defaultValue) => {
	if (!(propertyName in currentSettings)) {
		setSetting(propertyName, defaultValue);
	}

	return currentSettings[propertyName];
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
