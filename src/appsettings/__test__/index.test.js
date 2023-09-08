/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import appsettings, { AppSettings } from '../index.js';
import {
	DEFAULT_UPDATING_PERIOD,
	DEFAULT_4XX_THRESHOLD_PERCENT,
	DEFAULT_CACHE_DATA_INTERVAL,
	DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT,
	DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT
} from '../../constants.js';

describe('AppSettings', () => {
	it('constructor()', () => {
		expect(appsettings instanceof AppSettings).toBeTruthy();

		const appset = new AppSettings();

		expect(appset.SETTINGS_KEY_NAME).toBe('__ANGIE_CONSOLE');
		expect(appset.defaults.updatingPeriod === DEFAULT_UPDATING_PERIOD).toBeTruthy();
		expect(
			appset.defaults.warnings4xxThresholdPercent === DEFAULT_4XX_THRESHOLD_PERCENT
		).toBeTruthy();
		expect(appset.defaults.cacheDataInterval === DEFAULT_CACHE_DATA_INTERVAL).toBeTruthy();
		expect(
			appset.defaults.zonesyncPendingThreshold === DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT
		).toBeTruthy();
		expect(
			appset.defaults.resolverErrorsThreshold === DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT
		).toBeTruthy();
		expect(appset.settingChangeCallbacks instanceof Map).toBeTruthy();
		expect(appset.settingChangeCallbacks.size === 0).toBeTruthy();
		expect(appset.currentSettings === null).toBeTruthy();
		expect(appset.subscribeCounter === 0).toBeTruthy();
	});

	it('saveSettings()', () => {
		const originSettings = appsettings.currentSettings;
		const customSettings = {
			saveSettings_test: true,
			should_be_written: 'to localStorage'
		};

		appsettings.currentSettings = customSettings;
		appsettings.saveSettings();

		// write test value
		expect(localStorage.getItem(appsettings.SETTINGS_KEY_NAME)).toBe(JSON.stringify(customSettings));

		appsettings.currentSettings = originSettings;
		appsettings.saveSettings();

		// write test value
		expect(localStorage.getItem(appsettings.SETTINGS_KEY_NAME)).toBe(JSON.stringify(originSettings));
	});

	it('setSetting()', () => {
		const key = 'test_setting';
		let value = 1;
		const callbackID = 1234;
		const callback = jest.fn();

		const appset = new AppSettings();
		appset.init();

		appset.settingChangeCallbacks.set(callbackID, callback);
		const spyAppSettingsSaveSettings = jest.spyOn(appset, 'saveSettings').mockClear().mockImplementation(() => {});

		appset.setSetting(key, value, true);

		expect(appset.currentSettings[key] === value).toBeTruthy();
		expect(spyAppSettingsSaveSettings).toHaveBeenCalled();
		expect(callback).not.toHaveBeenCalled();

		appset.setSetting(key, ++value);

		expect(appset.currentSettings[key] === value).toBeTruthy();
		expect(spyAppSettingsSaveSettings).toHaveBeenCalledTimes(2);
		expect(callback).toHaveBeenCalled();

		delete appset.currentSettings[key];
		appset.settingChangeCallbacks.delete(callbackID);
		appset.saveSettings.mockRestore();
	});

	it('getSetting()', () => {
		const existingKey = 'updatingPeriod';
		const missedKey = 'test_get_settings_method';
		const defaultValue = 'default';
		const newValue = 'new';
		let value;

		const appset = new AppSettings();
		appset.init();

		const spyAppSettingsSet = jest.spyOn(appset, 'setSetting').mockClear();
		jest.spyOn(appset, 'saveSettings').mockClear().mockImplementation(() => {});

		value = appset.getSetting(existingKey);

		expect(value === DEFAULT_UPDATING_PERIOD).toBeTruthy();
		expect(spyAppSettingsSet).not.toHaveBeenCalled();
		expect(missedKey in appset.currentSettings === false).toBeTruthy();

		value = appset.getSetting(missedKey, defaultValue);

		expect(spyAppSettingsSet).toHaveBeenCalled();
		expect(appset.setSetting.mock.calls[0][0] === missedKey).toBeTruthy();
		expect(appset.setSetting.mock.calls[0][1] === defaultValue).toBeTruthy();
		expect(appset.setSetting.mock.calls[0][2] === true).toBeTruthy();
		expect(value === defaultValue).toBeTruthy();

		appset.setSetting(missedKey, newValue);
		value = appset.getSetting(missedKey, defaultValue);

		expect(spyAppSettingsSet).toHaveBeenCalledTimes(2);
		expect(value === newValue).toBeTruthy();

		delete appset.currentSettings[missedKey];
		appset.setSetting.mockRestore();
		appset.saveSettings.mockRestore();
	});

	it('subscribe()', () => {
		const cb = jest.fn();
		const key = 'updatingPeriod';
		const expectedId = '0';
		const value = 312;

		const spyAppSettingsSet = jest.spyOn(appsettings.settingChangeCallbacks, 'set').mockClear();

		expect(appsettings.subscribe() === undefined).toBeTruthy();
		expect(appsettings.subscribe(null) === undefined).toBeTruthy();
		expect(appsettings.subscribe(cb) === undefined).toBeTruthy();
		expect(appsettings.subscribe(cb, 123) === undefined).toBeTruthy();
		expect(spyAppSettingsSet).not.toHaveBeenCalled();

		expect(appsettings.subscribe(cb, key) === expectedId).toBeTruthy();
		expect(appsettings.subscribeCounter === 1).toBeTruthy();
		expect(spyAppSettingsSet).toHaveBeenCalled();
		expect(spyAppSettingsSet.mock.calls[0][0] === expectedId).toBeTruthy();
		expect(
			typeof spyAppSettingsSet.mock.calls[0][1] === 'function'
		).toBeTruthy();

		const changesCb = appsettings.settingChangeCallbacks.get(expectedId);

		changesCb('any_other_prop', value);

		expect(cb).not.toHaveBeenCalled();

		changesCb(key, value);

		expect(cb).toHaveBeenCalled();
		expect(cb.mock.calls[0][0] === value).toBeTruthy();

		appsettings.settingChangeCallbacks.set.mockRestore();
	});

	it('unsubscribe()', () => {
		const spyAppSettingsDel = jest.spyOn(appsettings.settingChangeCallbacks, 'delete').mockClear();

		const key = 'updatingPeriod';
		const wrongId = '100500';
		const id = appsettings.subscribe(() => {}, key);

		appsettings.unsubscribe(wrongId);

		expect(spyAppSettingsDel).not.toHaveBeenCalled();

		appsettings.unsubscribe(id);

		expect(spyAppSettingsDel).toHaveBeenCalled();
		expect(spyAppSettingsDel.mock.calls[0][0] === id).toBeTruthy();
		expect(appsettings.settingChangeCallbacks.has(id) === false).toBeTruthy();

		appsettings.settingChangeCallbacks.delete.mockRestore();
	});

	it('init()', () => {
		const originSettings = appsettings.currentSettings;
		const settings = { abc: 123, asd: '321' };

		const spyAppSettingsSaveSettings = jest.spyOn(appsettings, 'saveSettings').mockClear().mockImplementation(() => {});

		localStorage.removeItem(appsettings.SETTINGS_KEY_NAME);
		appsettings.init();

		expect(
			Object.keys(appsettings.defaults).length === Object.keys(appsettings.currentSettings).length
		).toBeTruthy();
		Object.keys(appsettings.defaults).forEach(key => {
			expect(key in appsettings.currentSettings).toBeTruthy();
			expect(appsettings.currentSettings[key] === appsettings.defaults[key]).toBeTruthy();
		});
		expect(spyAppSettingsSaveSettings).toHaveBeenCalled();

		localStorage.setItem(appsettings.SETTINGS_KEY_NAME, JSON.stringify(settings));
		appsettings.init();

		expect(appsettings.currentSettings).toEqual(settings);
		expect(spyAppSettingsSaveSettings).toHaveBeenCalled();

		appsettings.currentSettings = originSettings;
		localStorage.setItem(appsettings.SETTINGS_KEY_NAME, JSON.stringify(originSettings));

		appsettings.saveSettings.mockRestore();
	});
});
