/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
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
		assert(appsettings instanceof AppSettings, 'appsettings should export AppSettings instance by default');

		const appset = new AppSettings();

		assert(appset.SETTINGS_KEY_NAME === '__NGINX_PLUS_DASHBOARD', 'Unexpected "SETTINGS_KEY_NAME" value');
		assert(
			appset.defaults.updatingPeriod === DEFAULT_UPDATING_PERIOD,
			'Unexpected "defaults.updatingPeriod" value'
		);
		assert(
			appset.defaults.warnings4xxThresholdPercent === DEFAULT_4XX_THRESHOLD_PERCENT,
			'Unexpected "defaults.warnings4xxThresholdPercent" value'
		);
		assert(
			appset.defaults.cacheDataInterval === DEFAULT_CACHE_DATA_INTERVAL,
			'Unexpected "defaults.cacheDataInterval" value'
		);
		assert(
			appset.defaults.zonesyncPendingThreshold === DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT,
			'Unexpected "defaults.zonesyncPendingThreshold" value'
		);
		assert(
			appset.defaults.resolverErrorsThreshold === DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT,
			'Unexpected "defaults.resolverErrorsThreshold" value'
		);
		assert(
			appset.settingChangeCallbacks instanceof Map,
			'"settingChangeCallbacks" is expected to be an instance of Map'
		);
		assert(
			appset.settingChangeCallbacks.size === 0,
			'"settingChangeCallbacks" should be empty'
		);
		assert(appset.currentSettings === null, '"currentSettings" should be null');
		assert(appset.subscribeCounter === 0, 'Unexpected value of "subscribeCounter"');
	});

	it('saveSettings()', () => {
		const originSettings = appsettings.currentSettings;
		const customSettings = {
			'saveSettings_test': true,
			'should_be_written': 'to localStorage'
		};

		appsettings.currentSettings = customSettings;
		appsettings.saveSettings();

		expect(localStorage.getItem(appsettings.SETTINGS_KEY_NAME), 'write test value')
			.to.be.equal(JSON.stringify(customSettings));

		appsettings.currentSettings = originSettings;
		appsettings.saveSettings();

		expect(localStorage.getItem(appsettings.SETTINGS_KEY_NAME), 'write test value')
			.to.be.equal(JSON.stringify(originSettings));
	});

	it('setSetting()', () => {
		const key = 'test_setting';
		let value = 1;
		const callbackID = 1234;
		const callback = spy();

		appsettings.settingChangeCallbacks.set(callbackID, callback);
		stub(appsettings, 'saveSettings').callsFake(() => {});

		appsettings.setSetting(key, value, true);

		assert(
			appsettings.currentSettings[key] === value,
			`Unexpected value was added to currentSettings. Should be ${ value }`
		);
		assert(appsettings.saveSettings.calledOnce, 'saveSettings should be called once');
		assert(callback.callCount === 0, 'Callbacks should NOT be called in "silent" mode');

		appsettings.setSetting(key, ++value);

		assert(
			appsettings.currentSettings[key] === value,
			`Unexpected value was added to currentSettings. Should be ${ value }`
		);
		assert(appsettings.saveSettings.calledTwice, 'saveSettings should be called twice');
		assert(callback.calledOnce, 'Callback is expected to be called');

		delete appsettings.currentSettings[key];
		appsettings.settingChangeCallbacks.delete(callbackID);
		appsettings.saveSettings.restore();
	});

	it('getSetting()', () => {
		const existingKey = 'updatingPeriod';
		const missedKey = 'test_get_settings_method';
		const defaultValue = 'default';
		const newValue = 'new';
		let value;

		spy(appsettings, 'setSetting');
		stub(appsettings, 'saveSettings').callsFake(() => {});

		value = appsettings.getSetting(existingKey);

		assert(value === DEFAULT_UPDATING_PERIOD, `Unexpected value of "${ existingKey }"`);
		assert(
			appsettings.setSetting.callCount === 0,
			'setSetting should NOT be called when asking for existing property'
		);
		assert(
			missedKey in appsettings.currentSettings === false,
			`Found unexpected property "${ missedKey }" in currentSettings`
		);

		value = appsettings.getSetting(missedKey, defaultValue);

		assert(appsettings.setSetting.calledOnce, 'setSetting should be called once');
		assert(appsettings.setSetting.args[0][0] === missedKey, 'Unexpected key argument was provided to setSetting');
		assert(appsettings.setSetting.args[0][1] === defaultValue, 'Unexpected value argument was provided to setSetting');
		assert(appsettings.setSetting.args[0][2] === true, 'Unexpected "silent" argument was provided to setSetting');
		assert(
			value === defaultValue,
			`Unexpected value of new property (added within "getSetting"): ${ value }. Expected: ${ defaultValue }`
		);

		appsettings.setSetting(missedKey, newValue);
		value = appsettings.getSetting(missedKey, defaultValue);

		assert(appsettings.setSetting.calledTwice, 'setSetting should be called twice');
		assert(
			value === newValue,
			`Unexpected value of existing property: ${ value }. Expected: ${ newValue }`
		);

		delete appsettings.currentSettings[missedKey];
		appsettings.setSetting.restore();
		appsettings.saveSettings.restore();
	});

	it('subscribe()', () => {
		const cb = spy();
		const key = 'updatingPeriod';
		const expectedId = '0';
		const value = 312;

		spy(appsettings.settingChangeCallbacks, 'set');

		assert(
			appsettings.subscribe() === undefined,
			'Wrong return value when no callback and no property name were provided'
		);
		assert(appsettings.subscribe(null) === undefined, 'Wrong return value when callback is not a function');
		assert(appsettings.subscribe(cb) === undefined, 'Wrong return value when no property name was provided');
		assert(appsettings.subscribe(cb, 123) === undefined, 'Wrong return value when property name is not a string');
		assert(
			appsettings.settingChangeCallbacks.set.notCalled,
			'Map.set should not be called when no callback and no property name were provided'
		);

		assert(appsettings.subscribe(cb, key) === expectedId, 'Wrong return value');
		assert(appsettings.subscribeCounter === 1, '"subscribeCounter" should be increased');
		assert(appsettings.settingChangeCallbacks.set.calledOnce, 'Callback is expected to be added');
		assert(appsettings.settingChangeCallbacks.set.args[0][0] === expectedId, 'Unexpected first argument of Map.set');
		assert(
			typeof appsettings.settingChangeCallbacks.set.args[0][1] === 'function',
			'Unexpected second argument of Map.set'
		);

		const changesCb = appsettings.settingChangeCallbacks.get(expectedId);

		changesCb('any_other_prop', value);

		assert(cb.notCalled, 'Callback should not be called');

		changesCb(key, value);

		assert(cb.calledOnce, 'Callback is expected to be called once');
		assert(cb.args[0][0] === value, 'Unexpected argument was provided to callback');

		appsettings.settingChangeCallbacks.set.restore();
	});

	it('unsubscribe()', () => {
		spy(appsettings.settingChangeCallbacks, 'delete');

		const key = 'updatingPeriod';
		const wrongId = '100500';
		const id = appsettings.subscribe(() => {}, key);

		appsettings.unsubscribe(wrongId);

		assert(appsettings.settingChangeCallbacks.delete.notCalled, 'Map.delete should not be called');

		appsettings.unsubscribe(id);

		assert(appsettings.settingChangeCallbacks.delete.calledOnce, 'Map.delete should be called once');
		assert(appsettings.settingChangeCallbacks.delete.args[0][0] === id, 'Unexpected argument for Map.delete');
		assert(appsettings.settingChangeCallbacks.has(id) === false, 'Callback is expected to be removed');

		appsettings.settingChangeCallbacks.delete.restore();
	});

	it('init()', () => {
		const originSettings = appsettings.currentSettings;
		const settings = { abc: 123, asd: '321' };

		stub(appsettings, 'saveSettings').callsFake(() => {});

		localStorage.removeItem(appsettings.SETTINGS_KEY_NAME);
		appsettings.init();

		assert(
			Object.keys(appsettings.defaults).length === Object.keys(appsettings.currentSettings).length,
			'"currentSettings" should have same keys length as "defaults"'
		);
		Object.keys(appsettings.defaults).forEach(key => {
			assert(key in appsettings.currentSettings, `"${ key }" prop should be in "currentSettings"`);
			assert(
				appsettings.currentSettings[key] === appsettings.defaults[key],
				`Unexpected "${ key }" prop value in "currentSettings"`
			);
		});
		assert(appsettings.saveSettings.calledOnce, '"saveSettings" is expected to be called');

		localStorage.setItem(appsettings.SETTINGS_KEY_NAME, JSON.stringify(settings));
		appsettings.init();

		expect(appsettings.currentSettings).to.be.deep.equal(settings);
		assert(appsettings.saveSettings.calledOnce, '"saveSettings" should not called');

		appsettings.currentSettings = originSettings;
		localStorage.setItem(appsettings.SETTINGS_KEY_NAME, JSON.stringify(originSettings));

		appsettings.saveSettings.restore();
	});
});
