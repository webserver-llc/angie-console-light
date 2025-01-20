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
import { shallow } from 'enzyme';
import Settings from '../index.jsx';
import appsettings from '../../../appsettings';
import {
	VERSION,
	MIN_CACHE_DATA_INTERVAL,
	MAX_CACHE_DATA_INTERVAL,
	DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT,
	DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT
} from '../../../constants.js';
import styles from '../style.css';

describe('<Settings />', () => {
	const props = {
		statuses: {}
	};

	it('constructor()', () => {
		const getSettingStub = jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(a => `${a}_test`);
		const changeUpdatePeriodSpy = jest.spyOn(Settings.prototype.changeUpdatePeriod, 'bind').mockClear();
		const changeCacheHitRatioIntevalSpy = jest.spyOn(Settings.prototype.changeCacheHitRatioInteval, 'bind').mockClear();
		const saveSpy = jest.spyOn(Settings.prototype.save, 'bind').mockClear();
		const wrapper = shallow(<Settings {...props} />);

		// this.state
		expect(wrapper.state()).toEqual({
			updatingPeriod: 'updatingPeriod_test',
			warnings4xxThresholdPercent: 'warnings4xxThresholdPercent_test',
			cacheDataInterval: 'cacheDataInterval_test',
			zonesyncPendingThreshold: 'zonesyncPendingThreshold_test',
			resolverErrorsThreshold: 'resolverErrorsThreshold_test'
		});

		expect(getSettingStub).toHaveBeenCalledTimes(5);
		// getSetting call 1 arg 1
		expect(getSettingStub.mock.calls[0][0]).toBe('updatingPeriod');
		// getSetting call 2 arg 1
		expect(getSettingStub.mock.calls[1][0]).toBe('warnings4xxThresholdPercent');
		// getSetting call 3 arg 1
		expect(getSettingStub.mock.calls[2][0]).toBe('cacheDataInterval');
		// getSetting call 4 arg 1
		expect(getSettingStub.mock.calls[3][0]).toBe('zonesyncPendingThreshold');
		// getSetting call 4 arg 2
		expect(getSettingStub.mock.calls[3][1]).toBe(DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT);
		// getSetting call 5 arg 1
		expect(getSettingStub.mock.calls[4][0]).toBe('resolverErrorsThreshold');
		// getSetting call 5 arg 2
		expect(getSettingStub.mock.calls[4][1]).toBe(DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT);

		// this.changeUpdatePeriod.bind called
		expect(changeUpdatePeriodSpy).toHaveBeenCalledTimes(1);
		// this.changeUpdatePeriod.bind call arg
		expect(changeUpdatePeriodSpy.mock.calls[0][0] instanceof Settings).toBe(true);
		// this.changeCacheHitRatioInteval.bind called
		expect(changeCacheHitRatioIntevalSpy).toHaveBeenCalledTimes(1);
		// this.changeCacheHitRatioInteval.bind call arg
		expect(changeCacheHitRatioIntevalSpy.mock.calls[0][0] instanceof Settings).toBe(true);
		// this.save.bind called
		expect(saveSpy).toHaveBeenCalledTimes(1);
		// this.save.bind call arg
		expect(saveSpy.mock.calls[0][0] instanceof Settings).toBe(true);

		saveSpy.mockRestore();
		changeCacheHitRatioIntevalSpy.mockRestore();
		changeUpdatePeriodSpy.mockRestore();
		getSettingStub.mockRestore();
	});

	it('save()', () => {
		const closeSpy = jest.fn();
		const wrapper = shallow(
			<Settings
				{...props}
				close={closeSpy}
			/>
		);
		const instance = wrapper.instance();
		const setSettingStub = jest.spyOn(appsettings, 'setSetting').mockClear().mockImplementation(() => { });

		wrapper.setState({
			updatingPeriod: 'updatingPeriod_test',
			warnings4xxThresholdPercent: 'warnings4xxThresholdPercent_test',
			cacheDataInterval: 'cacheDataInterval_test',
			zonesyncPendingThreshold: 'zonesyncPendingThreshold_test',
			resolverErrorsThreshold: 'resolverErrorsThreshold_test'
		});

		instance.save();

		expect(setSettingStub).toHaveBeenCalledTimes(5);
		// setSetting called for "updatingPeriod"
		expect(setSettingStub).toHaveBeenCalledWith('updatingPeriod', 'updatingPeriod_test');
		// setSetting called for "warnings4xxThresholdPercent"
		expect(setSettingStub).toHaveBeenCalledWith('warnings4xxThresholdPercent', 'warnings4xxThresholdPercent_test');
		// setSetting called for "cacheDataInterval"
		expect(setSettingStub).toHaveBeenCalledWith('cacheDataInterval', 'cacheDataInterval_test');
		// setSetting called for "zonesyncPendingThreshold"
		expect(setSettingStub).toHaveBeenCalledWith('zonesyncPendingThreshold', 'zonesyncPendingThreshold_test');
		// setSetting called for "resolverErrorsThreshold"
		expect(setSettingStub).toHaveBeenCalledWith('resolverErrorsThreshold', 'resolverErrorsThreshold_test');
		// props.close called
		expect(closeSpy).toHaveBeenCalledTimes(1);

		setSettingStub.mockRestore();
		wrapper.unmount();
	});

	it('changeUpdatePeriod()', () => {
		const wrapper = shallow(<Settings {...props} />);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.changeUpdatePeriod();

		// [no period] this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// [no period] this.setState args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			updatingPeriod: 1000
		});

		setStateSpy.mockReset();
		instance.changeUpdatePeriod(2000);

		// [with period] this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// [with period] this.setState args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			updatingPeriod: 2000
		});

		setStateSpy.mockRestore();
		wrapper.unmount();
	});

	it('changePercentThreshold()', () => {
		const wrapper = shallow(<Settings {...props} />);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.changePercentThreshold('test_prop', { target: { value: 34 } });

		// this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// this.setState call arg
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			test_prop: 34
		});

		setStateSpy.mockReset();
		instance.changePercentThreshold('test_prop', { target: { value: 101 } });

		// [MAX reached] this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// [MAX reached] this.setState call arg
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			test_prop: 100
		});

		setStateSpy.mockReset();
		instance.changePercentThreshold('test_prop', { target: { value: -1 } });

		// [MIN reached] this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// [MIN reached] this.setState call arg
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			test_prop: 0
		});

		setStateSpy.mockRestore();
		wrapper.unmount();
	});

	it('changeCacheHitRatioInteval()', () => {
		const wrapper = shallow(<Settings {...props} />);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.changeCacheHitRatioInteval({ target: { value: 45 } });

		// this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// this.setState call arg
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			cacheDataInterval: 45000
		});

		setStateSpy.mockReset();
		instance.changeCacheHitRatioInteval({ target: { value: 4000 } });

		// [MAX reached] this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// [MAX reached] this.setState call arg
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			cacheDataInterval: 3600000
		});

		setStateSpy.mockReset();
		instance.changeCacheHitRatioInteval({ target: { value: 25 } });

		// [MIN reached] this.setState called
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// [MIN reached] this.setState call arg
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			cacheDataInterval: 30000
		});

		setStateSpy.mockRestore();
		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(
			<Settings
				{...props}
				statuses={{
					zone_sync: { ready: true },
					resolvers: { ready: true }
				}}
				close="close_test"
			/>
		);
		const instance = wrapper.instance();

		wrapper.setState({
			updatingPeriod: 'updatingPeriod_test',
			warnings4xxThresholdPercent: 'warnings4xxThresholdPercent_test',
			cacheDataInterval: 15000,
			zonesyncPendingThreshold: 'zonesyncPendingThreshold_test',
			resolverErrorsThreshold: 'resolverErrorsThreshold_test'
		});

		const changePercentThresholdBindSpy = jest.spyOn(instance.changePercentThreshold, 'bind').mockClear();

		instance.render();

		// wrapper className
		expect(wrapper.prop('className')).toBe(styles.settings);
		// wrapper children size
		expect(wrapper.children()).toHaveLength(9);
		// title
		expect(wrapper.childAt(0).type()).toBe('h2');
		// title className
		expect(wrapper.childAt(0).prop('className')).toBe(styles.title);
		// updatingPeriod className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.section);
		// updatingPeriod, NumberControl
		expect(wrapper.childAt(1).childAt(1).name()).toBe('NumberControl');
		// updatingPeriod, NumberControl prop value
		expect(wrapper.childAt(1).childAt(1).prop('value')).toBe('updatingPeriod_test');
		expect(wrapper.childAt(1).childAt(1).prop('onChange')).toBeInstanceOf(Function);
		// updatingPeriod, NumberControl prop onChange
		expect(wrapper.childAt(1).childAt(1).prop('onChange').name).toBe('bound changeUpdatePeriod');
		// 4xxThreshold className
		expect(wrapper.childAt(2).prop('className')).toBe(styles.section);
		// 4xxThreshold, NumberInput
		expect(wrapper.childAt(2).childAt(1).name()).toBe('NumberInput');
		// 4xxThreshold, NumberInput prop defaultValue
		expect(wrapper.childAt(2).childAt(1).prop('defaultValue')).toBe('warnings4xxThresholdPercent_test');
		expect(wrapper.childAt(2).childAt(1).prop('onChange')).toBeInstanceOf(Function);
		// 4xxThreshold, NumberInput prop onChange
		expect(wrapper.childAt(2).childAt(1).prop('onChange').name).toBe('bound changePercentThreshold');
		// 4xxThreshold, NumberInput className
		expect(wrapper.childAt(2).childAt(1).prop('className')).toBe(styles.input);
		// hit ratio className
		expect(wrapper.childAt(3).prop('className')).toBe(styles.section);
		// hit ratio, NumberInput
		expect(wrapper.childAt(3).childAt(1).name()).toBe('NumberInput');
		// hit ratio, NumberInput prop defaultValue
		expect(wrapper.childAt(3).childAt(1).prop('defaultValue')).toBe(15);
		expect(wrapper.childAt(3).childAt(1).prop('onChange')).toBeInstanceOf(Function);
		// hit ratio, NumberInput prop onChange
		expect(wrapper.childAt(3).childAt(1).prop('onChange').name).toBe('bound changeCacheHitRatioInteval');
		// hit ratio, NumberInput className
		expect(wrapper.childAt(3).childAt(1).prop('className')).toBe(styles['wide-input']);
		// zoneSync threshold className
		expect(wrapper.childAt(4).prop('className')).toBe(styles.section);
		// zoneSync threshold, NumberInput
		expect(wrapper.childAt(4).childAt(1).name()).toBe('NumberInput');
		// zoneSync threshold, NumberInput prop defaultValue
		expect(wrapper.childAt(4).childAt(1).prop('defaultValue')).toBe('zonesyncPendingThreshold_test');
		expect(wrapper.childAt(4).childAt(1).prop('onChange')).toBeInstanceOf(Function);
		// zoneSync threshold, NumberInput prop onChange
		expect(wrapper.childAt(4).childAt(1).prop('onChange').name).toBe('bound changePercentThreshold');
		// zoneSync threshold, NumberInput className
		expect(wrapper.childAt(4).childAt(1).prop('className')).toBe(styles.input);
		// resolver errors threshold className
		expect(wrapper.childAt(5).prop('className')).toBe(styles.section);
		// resolver errors threshold, NumberInput
		expect(wrapper.childAt(5).childAt(1).name()).toBe('NumberInput');
		// resolver errors threshold, NumberInput prop defaultValue
		expect(wrapper.childAt(5).childAt(1).prop('defaultValue')).toBe('resolverErrorsThreshold_test');
		expect(wrapper.childAt(5).childAt(1).prop('onChange')).toBeInstanceOf(Function);
		// resolver errors threshold, NumberInput prop onChange
		expect(wrapper.childAt(5).childAt(1).prop('onChange').name).toBe('bound changePercentThreshold');
		// resolver errors threshold, NumberInput className
		expect(wrapper.childAt(5).childAt(1).prop('className')).toBe(styles.input);
		// controls className
		expect(wrapper.childAt(6).prop('className')).toBe(styles.section);
		// LanguageControl
		expect(wrapper.childAt(6).childAt(1).name()).toBe('LanguageControl');
		// controls className
		expect(wrapper.childAt(7).prop('className')).toBe(styles.section);
		// save className
		expect(wrapper.childAt(7).childAt(0).prop('className')).toBe(styles.save);
		expect(wrapper.childAt(7).childAt(0).prop('onClick')).toBeInstanceOf(Function);
		// save onClick name
		expect(wrapper.childAt(7).childAt(0).prop('onClick').name).toBe('bound save');
		// cancel className
		expect(wrapper.childAt(7).childAt(1).prop('className')).toBe(styles.cancel);
		// cancel onClick
		expect(wrapper.childAt(7).childAt(1).prop('onClick')).toBe('close_test');
		// version className
		expect(wrapper.childAt(8).prop('className')).toBe(styles.version);
		// version text
		expect(wrapper.childAt(8).text()).toBe(`v${VERSION}`);

		expect(changePercentThresholdBindSpy).toHaveBeenCalledTimes(3);
		// this.changePercentThreshold.bind call 1, arg 1
		expect(changePercentThresholdBindSpy.mock.calls[0][0]).toEqual(instance);
		// this.changePercentThreshold.bind call 1, arg 2
		expect(changePercentThresholdBindSpy.mock.calls[0][1]).toBe('warnings4xxThresholdPercent');
		// this.changePercentThreshold.bind call 2, arg 1
		expect(changePercentThresholdBindSpy.mock.calls[1][0]).toEqual(instance);
		// this.changePercentThreshold.bind call 2, arg 2
		expect(changePercentThresholdBindSpy.mock.calls[1][1]).toBe('zonesyncPendingThreshold');
		// this.changePercentThreshold.bind call 3, arg 1
		expect(changePercentThresholdBindSpy.mock.calls[2][0]).toEqual(instance);
		// this.changePercentThreshold.bind call 3, arg 2
		expect(changePercentThresholdBindSpy.mock.calls[2][1]).toBe('resolverErrorsThreshold');

		changePercentThresholdBindSpy.mockReset();
		wrapper.setProps({ statuses: {} });

		// [no statuses.zone_sync, no statuses.resolvers] wrapper children size
		expect(wrapper.children()).toHaveLength(7);
		expect(changePercentThresholdBindSpy).toHaveBeenCalledTimes(1);
		// this.changePercentThreshold.bind call 1, arg 2
		expect(changePercentThresholdBindSpy.mock.calls[0][1]).toBe('warnings4xxThresholdPercent');

		changePercentThresholdBindSpy.mockRestore();
		wrapper.unmount();
	});
});
