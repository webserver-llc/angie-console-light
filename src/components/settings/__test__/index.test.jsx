/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';
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
		const getSettingStub = stub(appsettings, 'getSetting').callsFake(a => `${ a }_test`);
		const changeUpdatePeriodSpy = spy(Settings.prototype.changeUpdatePeriod, 'bind');
		const changeCacheHitRatioIntevalSpy = spy(Settings.prototype.changeCacheHitRatioInteval, 'bind');
		const saveSpy = spy(Settings.prototype.save, 'bind');
		const wrapper = shallow(<Settings { ...props } />);

		expect(wrapper.state(), 'this.state').to.be.deep.equal({
			updatingPeriod: 'updatingPeriod_test',
			warnings4xxThresholdPercent: 'warnings4xxThresholdPercent_test',
			cacheDataInterval: 'cacheDataInterval_test',
			zonesyncPendingThreshold: 'zonesyncPendingThreshold_test',
			resolverErrorsThreshold: 'resolverErrorsThreshold_test'
		});

		expect(getSettingStub.callCount, 'getSetting call count').to.be.equal(5);
		expect(
			getSettingStub.args[0][0],
			'getSetting call 1 arg 1'
		).to.be.equal('updatingPeriod');
		expect(
			getSettingStub.args[1][0],
			'getSetting call 2 arg 1'
		).to.be.equal('warnings4xxThresholdPercent');
		expect(
			getSettingStub.args[2][0],
			'getSetting call 3 arg 1'
		).to.be.equal('cacheDataInterval');
		expect(
			getSettingStub.args[3][0],
			'getSetting call 4 arg 1'
		).to.be.equal('zonesyncPendingThreshold');
		expect(
			getSettingStub.args[3][1],
			'getSetting call 4 arg 2'
		).to.be.equal(DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT);
		expect(
			getSettingStub.args[4][0],
			'getSetting call 5 arg 1'
		).to.be.equal('resolverErrorsThreshold');
		expect(
			getSettingStub.args[4][1],
			'getSetting call 5 arg 2'
		).to.be.equal(DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT);

		expect(
			changeUpdatePeriodSpy.calledOnce,
			'this.changeUpdatePeriod.bind called'
		).to.be.true;
		expect(
			changeUpdatePeriodSpy.args[0][0] instanceof Settings,
			'this.changeUpdatePeriod.bind call arg'
		).to.be.true;
		expect(
			changeCacheHitRatioIntevalSpy.calledOnce,
			'this.changeCacheHitRatioInteval.bind called'
		).to.be.true;
		expect(
			changeCacheHitRatioIntevalSpy.args[0][0] instanceof Settings,
			'this.changeCacheHitRatioInteval.bind call arg'
		).to.be.true;
		expect(
			saveSpy.calledOnce,
			'this.save.bind called'
		).to.be.true;
		expect(
			saveSpy.args[0][0] instanceof Settings,
			'this.save.bind call arg'
		).to.be.true;

		saveSpy.restore();
		changeCacheHitRatioIntevalSpy.restore();
		changeUpdatePeriodSpy.restore();
		getSettingStub.restore();
	});

	it('save()', () => {
		const closeSpy = spy();
		const wrapper = shallow(
			<Settings
				{ ...props }
				close={ closeSpy }
			/>
		);
		const instance = wrapper.instance();
		const setSettingStub = stub(appsettings, 'setSetting').callsFake(() => {});

		wrapper.setState({
			updatingPeriod: 'updatingPeriod_test',
			warnings4xxThresholdPercent: 'warnings4xxThresholdPercent_test',
			cacheDataInterval: 'cacheDataInterval_test',
			zonesyncPendingThreshold: 'zonesyncPendingThreshold_test',
			resolverErrorsThreshold: 'resolverErrorsThreshold_test'
		});

		instance.save();

		expect(setSettingStub.callCount, 'setSetting call count').to.be.equal(5);
		expect(
			setSettingStub.calledWith('updatingPeriod', 'updatingPeriod_test'),
			'setSetting called for "updatingPeriod"'
		).to.be.true;
		expect(
			setSettingStub.calledWith('warnings4xxThresholdPercent', 'warnings4xxThresholdPercent_test'),
			'setSetting called for "warnings4xxThresholdPercent"'
		).to.be.true;
		expect(
			setSettingStub.calledWith('cacheDataInterval', 'cacheDataInterval_test'),
			'setSetting called for "cacheDataInterval"'
		).to.be.true;
		expect(
			setSettingStub.calledWith('zonesyncPendingThreshold', 'zonesyncPendingThreshold_test'),
			'setSetting called for "zonesyncPendingThreshold"'
		).to.be.true;
		expect(
			setSettingStub.calledWith('resolverErrorsThreshold', 'resolverErrorsThreshold_test'),
			'setSetting called for "resolverErrorsThreshold"'
		).to.be.true;
		expect(closeSpy.calledOnce, 'props.close called').to.be.true;

		setSettingStub.restore();
		wrapper.unmount();
	});

	it('changeUpdatePeriod()', () => {
		const wrapper = shallow(<Settings { ...props } />);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		instance.changeUpdatePeriod();

		expect(
			setStateSpy.calledOnce,
			'[no period] this.setState called'
		).to.be.true;
		expect(
			setStateSpy.args[0][0],
			'[no period] this.setState args'
		).to.be.deep.equal({
			updatingPeriod: 1000
		});

		setStateSpy.resetHistory();
		instance.changeUpdatePeriod(2000);

		expect(
			setStateSpy.calledOnce,
			'[with period] this.setState called'
		).to.be.true;
		expect(
			setStateSpy.args[0][0],
			'[with period] this.setState args'
		).to.be.deep.equal({
			updatingPeriod: 2000
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('changePercentThreshold()', () => {
		const wrapper = shallow(<Settings { ...props } />);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		instance.changePercentThreshold('test_prop', { target: { value: 34 } });

		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call arg').to.be.deep.equal({
			test_prop: 34
		});

		setStateSpy.resetHistory();
		instance.changePercentThreshold('test_prop', { target: { value: 101 } });

		expect(setStateSpy.calledOnce, '[MAX reached] this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], '[MAX reached] this.setState call arg').to.be.deep.equal({
			test_prop: 100
		});

		setStateSpy.resetHistory();
		instance.changePercentThreshold('test_prop', { target: { value: -1 } });

		expect(setStateSpy.calledOnce, '[MIN reached] this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], '[MIN reached] this.setState call arg').to.be.deep.equal({
			test_prop: 0
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('changeCacheHitRatioInteval()', () => {
		const wrapper = shallow(<Settings { ...props } />);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		instance.changeCacheHitRatioInteval({ target: { value: 45 } });

		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call arg').to.be.deep.equal({
			cacheDataInterval: 45000
		});

		setStateSpy.resetHistory();
		instance.changeCacheHitRatioInteval({ target: { value: 4000 } });

		expect(setStateSpy.calledOnce, '[MAX reached] this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], '[MAX reached] this.setState call arg').to.be.deep.equal({
			cacheDataInterval: 3600000
		});

		setStateSpy.resetHistory();
		instance.changeCacheHitRatioInteval({ target: { value: 25 } });

		expect(setStateSpy.calledOnce, '[MIN reached] this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], '[MIN reached] this.setState call arg').to.be.deep.equal({
			cacheDataInterval: 30000
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(
			<Settings
				{ ...props }
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

		const changePercentThresholdBindSpy = spy(instance.changePercentThreshold, 'bind');

		instance.render();

		expect(wrapper.prop('className'), 'wrapper className').to.be.equal(styles['settings']);
		expect(wrapper.children(), 'wrapper children size').to.have.lengthOf(9);
		expect(wrapper.childAt(0).type(), 'title').to.be.equal('h2');
		expect(
			wrapper.childAt(0).prop('className'),
			'title className'
		).to.be.equal(styles['title']);
		expect(
			wrapper.childAt(1).prop('className'),
			'updatingPeriod className'
		).to.be.equal(styles['section']);
		expect(
			wrapper.childAt(1).childAt(1).name(),
			'updatingPeriod, NumberControl'
		).to.be.equal('NumberControl');
		expect(
			wrapper.childAt(1).childAt(1).prop('value'),
			'updatingPeriod, NumberControl prop value'
		).to.be.equal('updatingPeriod_test');
		expect(
			wrapper.childAt(1).childAt(1).prop('onChange'),
			'updatingPeriod, NumberControl prop onChange'
		).to.be.a('function');
		expect(
			wrapper.childAt(1).childAt(1).prop('onChange').name,
			'updatingPeriod, NumberControl prop onChange'
		).to.be.equal('bound changeUpdatePeriod');
		expect(
			wrapper.childAt(2).prop('className'),
			'4xxThreshold className'
		).to.be.equal(styles['section']);
		expect(
			wrapper.childAt(2).childAt(1).name(),
			'4xxThreshold, NumberInput'
		).to.be.equal('NumberInput');
		expect(
			wrapper.childAt(2).childAt(1).prop('defaultValue'),
			'4xxThreshold, NumberInput prop defaultValue'
		).to.be.equal('warnings4xxThresholdPercent_test');
		expect(
			wrapper.childAt(2).childAt(1).prop('onChange'),
			'4xxThreshold, NumberInput prop onChange'
		).to.be.a('function');
		expect(
			wrapper.childAt(2).childAt(1).prop('onChange').name,
			'4xxThreshold, NumberInput prop onChange'
		).to.be.equal('bound changePercentThreshold');
		expect(
			wrapper.childAt(2).childAt(1).prop('className'),
			'4xxThreshold, NumberInput className'
		).to.be.equal(styles['input']);
		expect(
			wrapper.childAt(3).prop('className'),
			'hit ratio className'
		).to.be.equal(styles['section']);
		expect(
			wrapper.childAt(3).childAt(1).name(),
			'hit ratio, NumberInput'
		).to.be.equal('NumberInput');
		expect(
			wrapper.childAt(3).childAt(1).prop('defaultValue'),
			'hit ratio, NumberInput prop defaultValue'
		).to.be.equal(15);
		expect(
			wrapper.childAt(3).childAt(1).prop('onChange'),
			'hit ratio, NumberInput prop onChange'
		).to.be.a('function');
		expect(
			wrapper.childAt(3).childAt(1).prop('onChange').name,
			'hit ratio, NumberInput prop onChange'
		).to.be.equal('bound changeCacheHitRatioInteval');
		expect(
			wrapper.childAt(3).childAt(1).prop('className'),
			'hit ratio, NumberInput className'
		).to.be.equal(styles['wide-input']);
		expect(
			wrapper.childAt(4).prop('className'),
			'zoneSync threshold className'
		).to.be.equal(styles['section']);
		expect(
			wrapper.childAt(4).childAt(1).name(),
			'zoneSync threshold, NumberInput'
		).to.be.equal('NumberInput');
		expect(
			wrapper.childAt(4).childAt(1).prop('defaultValue'),
			'zoneSync threshold, NumberInput prop defaultValue'
		).to.be.equal('zonesyncPendingThreshold_test');
		expect(
			wrapper.childAt(4).childAt(1).prop('onChange'),
			'zoneSync threshold, NumberInput prop onChange'
		).to.be.a('function');
		expect(
			wrapper.childAt(4).childAt(1).prop('onChange').name,
			'zoneSync threshold, NumberInput prop onChange'
		).to.be.equal('bound changePercentThreshold');
		expect(
			wrapper.childAt(4).childAt(1).prop('className'),
			'zoneSync threshold, NumberInput className'
		).to.be.equal(styles['input']);
		expect(
			wrapper.childAt(5).prop('className'),
			'resolver errors threshold className'
		).to.be.equal(styles['section']);
		expect(
			wrapper.childAt(5).childAt(1).name(),
			'resolver errors threshold, NumberInput'
		).to.be.equal('NumberInput');
		expect(
			wrapper.childAt(5).childAt(1).prop('defaultValue'),
			'resolver errors threshold, NumberInput prop defaultValue'
		).to.be.equal('resolverErrorsThreshold_test');
		expect(
			wrapper.childAt(5).childAt(1).prop('onChange'),
			'resolver errors threshold, NumberInput prop onChange'
		).to.be.a('function');
		expect(
			wrapper.childAt(5).childAt(1).prop('onChange').name,
			'resolver errors threshold, NumberInput prop onChange'
		).to.be.equal('bound changePercentThreshold');
		expect(
			wrapper.childAt(5).childAt(1).prop('className'),
			'resolver errors threshold, NumberInput className'
		).to.be.equal(styles['input']);
		expect(
			wrapper.childAt(6).prop('className'),
			'controls className'
		).to.be.equal(styles['section']);
		expect(
			wrapper.childAt(6).childAt(0).prop('className'),
			'save className'
		).to.be.equal(styles['save']);
		expect(
			wrapper.childAt(6).childAt(0).prop('onClick'),
			'save onClick'
		).to.be.a('function');
		expect(
			wrapper.childAt(6).childAt(0).prop('onClick').name,
			'save onClick name'
		).to.be.equal('bound save');
		expect(
			wrapper.childAt(6).childAt(1).prop('className'),
			'cancel className'
		).to.be.equal(styles['cancel']);
		expect(
			wrapper.childAt(6).childAt(1).prop('onClick'),
			'cancel onClick'
		).to.be.equal('close_test');
		expect(
			wrapper.childAt(7).prop('className'),
			'help className'
		).to.be.equal(`${ styles['section'] } ${ styles['help'] }`);
		expect(
			wrapper.childAt(8).prop('className'),
			'version className'
		).to.be.equal(styles['version']);
		expect(
			wrapper.childAt(8).text(),
			'version text'
		).to.be.equal(`v${ VERSION }`);

		expect(
			changePercentThresholdBindSpy.callCount,
			'this.changePercentThreshold.bind call count'
		).to.be.equal(3);
		expect(
			changePercentThresholdBindSpy.args[0][0],
			'this.changePercentThreshold.bind call 1, arg 1'
		).to.be.deep.equal(instance);
		expect(
			changePercentThresholdBindSpy.args[0][1],
			'this.changePercentThreshold.bind call 1, arg 2'
		).to.be.equal('warnings4xxThresholdPercent');
		expect(
			changePercentThresholdBindSpy.args[1][0],
			'this.changePercentThreshold.bind call 2, arg 1'
		).to.be.deep.equal(instance);
		expect(
			changePercentThresholdBindSpy.args[1][1],
			'this.changePercentThreshold.bind call 2, arg 2'
		).to.be.equal('zonesyncPendingThreshold');
		expect(
			changePercentThresholdBindSpy.args[2][0],
			'this.changePercentThreshold.bind call 3, arg 1'
		).to.be.deep.equal(instance);
		expect(
			changePercentThresholdBindSpy.args[2][1],
			'this.changePercentThreshold.bind call 3, arg 2'
		).to.be.equal('resolverErrorsThreshold');

		changePercentThresholdBindSpy.resetHistory();
		wrapper.setProps({ statuses: {} });

		expect(
			wrapper.children(),
			'[no statuses.zone_sync, no statuses.resolvers] wrapper children size'
		).to.have.lengthOf(7);
		expect(
			changePercentThresholdBindSpy.callCount,
			'[no statuses.zone_sync, no statuses.resolvers] this.changePercentThreshold.bind call count'
		).to.be.equal(1);
		expect(
			changePercentThresholdBindSpy.args[0][1],
			'this.changePercentThreshold.bind call 1, arg 2'
		).to.be.equal('warnings4xxThresholdPercent');

		changePercentThresholdBindSpy.restore();
		wrapper.unmount();
	});
});
