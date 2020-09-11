/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow, mount } from 'enzyme';
import { spy, stub } from 'sinon';
import Chart, {
	chartDimensions,
	TimeWindows,
	TimeWindowDefault
} from '../index.jsx';
import * as utils from '../utils.js';
import appsettings from '../../../appsettings';
import { limitConnReqHistoryLimit } from '../../../calculators/utils.js';
import styles from '../style.css';

describe('<Chart />', () => {
	const Colors = new Map([
		['passed', '#4FA932'],
		['delayed', '#EBC906'],
		['rejected', '#FF2323']
	]);
	const Labels = new Map([
		['passed', 'Passed'],
		['delayed', 'Delayed'],
		['rejected', 'Rejected']
	]);
	const props = {
		data: {
			ts: 1598706293,
			data: []
		}
	};

	it('constructor()', () => {
		let timeWindow = null;
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();
		const drawCursorLineSpy = spy(instance.drawCursorLine, 'bind');
		const onMouseMoveSpy = spy(instance.onMouseMove, 'bind');
		const onMouseLeaveSpy = spy(instance.onMouseLeave, 'bind');
		const onMouseDownSpy = spy(instance.onMouseDown, 'bind');
		const onMouseUpSpy = spy(instance.onMouseUp, 'bind');
		const highlightMetricSpy = spy(instance.highlightMetric, 'bind');
		const onSettingsChangeSpy = spy(instance.onSettingsChange, 'bind');
		const redrawStub = stub(instance, 'redraw').callsFake(() => {});
		const redrawSpy = spy(instance.redraw, 'bind');

		stub(appsettings, 'getSetting').callsFake(() => timeWindow);

		instance.constructor(props);

		expect(appsettings.getSetting.calledOnce, 'getSetting called once').to.be.true;
		expect(appsettings.getSetting.args[0][0], 'getSetting 1st arg').to.be.equal('timeWindow');
		expect(wrapper.state(), 'state').to.be.deep.equal({
			disabledMetrics: [],
			highlightedMetric: null,
			mouseOffsetX: null,
			selectedTimeWindow: TimeWindowDefault,
			timeEnd: props.data.ts,
			dndIsInProgress: false,
			dndPointsIndicies: null
		});
		expect(instance.highlightMetricTimer, 'this.highlightMetricTimer').to.be.a('null');
		expect(instance.highlightedMetric, 'this.highlightedMetric').to.be.a('null');
		expect(instance.mouseOffsetX, 'this.mouseOffsetX').to.be.a('null');
		expect(instance.mouseMoveTimer, 'this.mouseMoveTimer').to.be.a('null');
		expect(instance.dndStartX, 'this.dndStartX').to.be.equal(0);
		expect(instance.dndMoveX, 'this.dndMoveX').to.be.equal(0);
		expect(instance.pointsIndicies, 'this.pointsIndicies').to.be.equal('0,0');
		expect(drawCursorLineSpy.calledOnce, 'drawCursorLine binded').to.be.true;
		expect(drawCursorLineSpy.args[0][0], 'drawCursorLine binded to instance').to.be.deep.equal(instance);
		expect(onMouseMoveSpy.calledOnce, 'onMouseMove binded').to.be.true;
		expect(onMouseMoveSpy.args[0][0], 'onMouseMove binded to instance').to.be.deep.equal(instance);
		expect(onMouseLeaveSpy.calledOnce, 'onMouseLeave binded').to.be.true;
		expect(onMouseLeaveSpy.args[0][0], 'onMouseLeave binded to instance').to.be.deep.equal(instance);
		expect(onMouseDownSpy.calledOnce, 'onMouseDown binded').to.be.true;
		expect(onMouseDownSpy.args[0][0], 'onMouseDown binded to instance').to.be.deep.equal(instance);
		expect(onMouseUpSpy.calledOnce, 'onMouseUp binded').to.be.true;
		expect(onMouseUpSpy.args[0][0], 'onMouseUp binded to instance').to.be.deep.equal(instance);
		expect(redrawSpy.calledOnce, 'redraw binded').to.be.true;
		expect(redrawSpy.args[0][0], 'redraw binded to instance').to.be.deep.equal(instance);
		expect(highlightMetricSpy.calledOnce, 'highlightMetric binded').to.be.true;
		expect(highlightMetricSpy.args[0][0], 'highlightMetric binded to instance').to.be.deep.equal(instance);
		expect(onSettingsChangeSpy.calledOnce, 'onSettingsChange binded').to.be.true;
		expect(onSettingsChangeSpy.args[0][0], 'onSettingsChange binded to instance').to.be.deep.equal(instance);
		expect(redrawStub.calledOnce, 'redraw called once').to.be.true;

		drawCursorLineSpy.restore();
		onMouseMoveSpy.restore();
		onMouseLeaveSpy.restore();
		onMouseDownSpy.restore();
		onMouseUpSpy.restore();
		redrawSpy.restore();
		highlightMetricSpy.restore();
		onSettingsChangeSpy.restore();
		redrawStub.restore();

		timeWindow = '0m';
		instance.constructor(props);

		expect(wrapper.state('selectedTimeWindow'), 'selectedTimeWindow state when timeWindow is unknown')
			.to.be.equal(TimeWindowDefault);

		timeWindow = '1m';
		instance.constructor(props);

		expect(wrapper.state('selectedTimeWindow'), 'selectedTimeWindow state with timeWindow set')
			.to.be.equal(timeWindow);

		appsettings.getSetting.restore();
		wrapper.unmount();
	});

	it('componentDidMount()', () => {
		const subscribeResult = 'test_subscribe_result';
		const wrapper = mount(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();

		stub(appsettings, 'subscribe').callsFake(() => subscribeResult);

		instance.componentDidMount();

		expect(appsettings.subscribe.calledOnce, 'appsettings.subscribe called once').to.be.true;
		expect(appsettings.subscribe.args[0][0].name, 'appsettings.subscribe 1st arg')
			.to.be.equal('bound onSettingsChange');
		expect(appsettings.subscribe.args[0][1], 'appsettings.subscribe 2nd arg').to.be.equal('timeWindow');
		expect(instance.settingsListener, 'this.settingsListener').to.be.equal(subscribeResult);

		appsettings.subscribe.restore();
		wrapper.unmount();
	});

	it('componentWillUnmount()', () => {
		const subscribeResult = 'test_subscribe_result';
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();

		stub(appsettings, 'unsubscribe').callsFake(() => {});

		instance.settingsListener = subscribeResult;
		instance.componentWillUnmount();

		expect(appsettings.unsubscribe.calledOnce, 'appsettings.unsubscribe called once').to.be.true;
		expect(appsettings.unsubscribe.args[0][0], 'appsettings.unsubscribe 1st arg').to.be.equal(subscribeResult);

		appsettings.unsubscribe.restore();
		wrapper.unmount();
	});

	it('componentWillReceiveProps()', () => {
		const updatingPeriod = 1000;
		const nextData = {
			data: {
				ts: 1598706290,
				data: []
			}
		};
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();

		stub(appsettings, 'getSetting').callsFake(() => updatingPeriod);
		stub(instance, 'redraw').callsFake(() => {});

		instance.componentWillReceiveProps(nextData);

		expect(appsettings.getSetting.notCalled, 'getSetting not called').to.be.true;
		expect(instance.redraw.notCalled, 'this.redraw not called').to.be.true;

		nextData.data.ts = 1598706296;
		instance.componentWillReceiveProps(nextData);

		expect(appsettings.getSetting.notCalled, 'getSetting not called').to.be.true;
		expect(instance.redraw.callCount, 'this.redraw called').to.be.equal(1);
		expect(instance.redraw.args[0][0], 'this.redraw 1st arg').to.be.deep.equal({
			timeEnd: nextData.data.ts
		});
		expect(instance.redraw.args[0][1], 'this.redraw 2nd arg').to.be.deep.equal(nextData);

		instance.setState({ dndPointsIndicies: '0,100' });
		instance.componentWillReceiveProps(nextData);

		expect(appsettings.getSetting.notCalled, 'getSetting not called').to.be.true;
		expect(instance.redraw.callCount, 'this.redraw called').to.be.equal(2);
		expect(instance.redraw.args[1][0], 'this.redraw 1st arg').to.be.deep.equal({
			timeEnd: nextData.data.ts
		});

		instance.historyLimit = 1;
		nextData.data.data = ['test'];
		instance.componentWillReceiveProps(nextData);

		expect(appsettings.getSetting.calledOnce, 'getSetting called once').to.be.true;
		expect(appsettings.getSetting.args[0][0], 'getSetting 1st arg').to.be.equal('updatingPeriod');
		expect(instance.redraw.callCount, 'this.redraw called').to.be.equal(3);
		expect(instance.redraw.args[2][0], 'this.redraw 1st arg')
		expect(instance.redraw.args[2][0].dndPointsIndicies, 'nextState "dndPointsIndicies"')
			.to.be.equal('0,100');
		expect(instance.redraw.args[2][1], 'this.redraw 2nd arg').to.be.deep.equal(nextData);

		instance.setState({ dndPointsIndicies: '10,110' });
		instance.componentWillReceiveProps(nextData);

		expect(instance.redraw.callCount, 'this.redraw called').to.be.equal(4);
		expect(instance.redraw.args[3][0].dndPointsIndicies, 'nextState "dndPointsIndicies"')
			.to.be.equal('7,107');

		appsettings.getSetting.restore();
		instance.redraw.restore();
		wrapper.unmount();
	});

	it('shouldComponentUpdate()', () => {
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();

		expect(instance.shouldComponentUpdate(), 'default behaviour').to.be.true;

		instance.setState({ dndIsInProgress: true });

		expect(
			instance.shouldComponentUpdate(null, { dndPointsIndicies: '0,100' }),
			'dndIsInProgress = true, dndPointsIndicies changed'
		).to.be.true;

		instance.setState({ dndPointsIndicies: '0,100' });

		expect(
			instance.shouldComponentUpdate(null, { dndPointsIndicies: '0,100' }),
			'dndIsInProgress = true, dndPointsIndicies not changed'
		).to.be.false;

		wrapper.unmount();
	});

	it('onSettingsChange()', () => {
		const value = 'test_value';
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance, 'redraw').callsFake(() => {});

		instance.onSettingsChange(value);

		expect(instance.redraw.calledOnce, 'this.redraw called').to.be.true;
		expect(instance.redraw.args[0][0], 'this.redraw 1st arg').to.be.deep.equal({
			selectedTimeWindow: value,
			dndPointsIndicies: null
		});

		instance.redraw.restore();
		wrapper.unmount();
	});

	it('onMouseLeave()', () => {
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');
		const clearTimeoutSpy = spy(window, 'clearTimeout');

		instance.onMouseLeave();

		expect(window.clearTimeout.notCalled, 'clearTimeout not called').to.be.true;
		expect(instance.setState.callCount, 'this.setState called').to.be.equal(1);
		expect(instance.setState.args[0][0], 'this.setState arg').to.be.deep.equal({
			mouseOffsetX: null,
			dndIsInProgress: false
		});

		instance.mouseMoveTimer = 123;
		instance.onMouseLeave();

		expect(window.clearTimeout.calledOnce, 'clearTimeout called once').to.be.true;
		expect(instance.mouseMoveTimer, 'this.mouseMoveTimer').to.be.a('null');
		expect(instance.setState.callCount, 'this.setState called').to.be.equal(2);
		expect(instance.setState.args[0][0], 'this.setState arg').to.be.deep.equal({
			mouseOffsetX: null,
			dndIsInProgress: false
		});

		stateSpy.restore();
		wrapper.unmount();
	});

	it('drawCursorLine()', () => {
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');

		instance.mouseOffsetX = 'test_offset_x';
		instance.drawCursorLine();

		expect(stateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(stateSpy.args[0][0], 'this.setState arg').to.be.deep.equal({
			mouseOffsetX: 'test_offset_x'
		});

		instance.setState({ dndIsInProgress: true });
		stateSpy.resetHistory();
		instance.drawCursorLine();

		expect(stateSpy.notCalled, 'this.setState not called').to.be.true;

		stateSpy.restore();
		wrapper.unmount();
	});

	it('onMouseDown()', () => {
		const offsetX = 150;
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance, 'redraw').callsFake(() => {});

		instance.onMouseDown({ offsetX });

		expect(instance.dndStartX, 'this.dndStartX').to.be.equal(offsetX);
		expect(instance.dndMoveX, 'this.dndMoveX').to.be.equal(offsetX);
		expect(instance.redraw.calledOnce, 'this.redraw called once').to.be.true;
		expect(instance.redraw.args[0][0], 'this.redraw arg').to.be.deep.equal({
			dndIsInProgress: true,
			mouseOffsetX: null,
			dndPointsIndicies: '0,0'
		});

		instance.setState({ dndPointsIndicies: '0,0' });
		instance.onMouseDown({ offsetX });

		expect(instance.redraw.calledTwice, 'this.redraw called twice').to.be.true;
		expect(instance.redraw.args[1][0], 'this.redraw arg').to.be.deep.equal({
			dndIsInProgress: true,
			mouseOffsetX: null
		});

		instance.redraw.restore();
		wrapper.unmount();
	});

	it('onMouseUp()', () => {
		const wrapper = shallow(
			<Chart data={{
				ts: 1598706293,
				data: [1,2,3]
			}} />
		);
		const instance = wrapper.instance();

		stub(instance, 'redraw').callsFake(() => {});

		instance.onMouseUp();

		expect(instance.redraw.calledOnce, 'this.redraw called once').to.be.true;
		expect(instance.redraw.args[0][0], 'this.redraw arg').to.be.deep.equal({
			dndIsInProgress: false
		});

		instance.setState({ dndPointsIndicies: '0,1' });
		instance.onMouseUp();

		expect(instance.redraw.calledTwice, 'this.redraw called twice').to.be.true;
		expect(instance.redraw.args[1][0], 'this.redraw arg').to.be.deep.equal({
			dndIsInProgress: false
		});

		instance.setState({ dndPointsIndicies: '0,2' });
		instance.onMouseUp();

		expect(instance.redraw.calledThrice, 'this.redraw called thrice').to.be.true;
		expect(instance.redraw.args[2][0], 'this.redraw arg').to.be.deep.equal({
			dndIsInProgress: false,
			dndPointsIndicies: null
		});

		instance.redraw.restore();
		wrapper.unmount();
	});

	it('onMouseMove()', () => {
		const wrapper = shallow(
			<Chart data={{
				ts: 1598706293,
				data: [1,2,3,4,5,6,7,8,9,10]
			}} />
		);
		const instance = wrapper.instance();
		const setTimeoutId = 123;
		let setTimeoutCallback;

		stub(window, 'setTimeout').callsFake(fn => {
			setTimeoutCallback = fn;
			return setTimeoutId;
		});
		stub(instance, 'redraw').callsFake(() => {});
		stub(instance, 'drawCursorLine').callsFake(() => {});

		instance.onMouseMove({ offsetX: 100 });

		expect(instance.mouseOffsetX, 'this.mouseOffsetX').to.be.equal(150);
		expect(window.setTimeout.calledOnce, 'setTimeout called once').to.be.true;
		expect(window.setTimeout.args[0][1], 'setTimeout time value').to.be.equal(100);
		expect(instance.mouseMoveTimer, 'this.mouseMoveTimer').to.be.equal(setTimeoutId);

		instance.onMouseMove({ offsetX: 100 });

		expect(window.setTimeout.calledOnce, 'setTimeout not called').to.be.true;

		setTimeoutCallback();

		expect(instance.drawCursorLine.calledOnce, 'this.drawCursorLine called once').to.be.true;
		expect(instance.mouseMoveTimer, 'this.mouseMoveTimer').to.be.a('null');

		instance.setState({
			dndIsInProgress: true,
			dndPointsIndicies: '0,14'
		});
		instance.dndStartX = 0;
		instance.dndMoveX = 200;
		instance.onMouseMove({ offsetX: 100 });

		expect(instance.dndStartX, 'this.dndStartX').to.be.equal(100);
		expect(instance.dndMoveX, 'this.dndMoveX').to.be.equal(100);

		instance.setState({ selectedTimeWindow: '15m' });
		instance.dndMoveX = 120;
		instance.onMouseMove({ offsetX: 140 });

		expect(instance.dndMoveX, 'this.dndMoveX [selectedTW 15m]').to.be.equal(140);
		expect(instance.dndStartX, 'this.dndStartX [selectedTW 15m]').to.be.equal(260);

		instance.setState({ selectedTimeWindow: '5m' });
		instance.dndMoveX = 280;
		instance.onMouseMove({ offsetX: 200 });

		expect(instance.dndMoveX, 'this.dndMoveX [selectedTW 5m]').to.be.equal(200);
		expect(instance.dndStartX, 'this.dndStartX [selectedTW 5m]').to.be.equal(140);

		instance.setState({ selectedTimeWindow: '1m' });
		instance.dndMoveX = 160;
		instance.onMouseMove({ offsetX: 200 });

		expect(instance.dndMoveX, 'this.dndMoveX [selectedTW 1m]').to.be.equal(200);
		expect(instance.dndStartX, 'this.dndStartX [selectedTW 1m]').to.be.equal(200);

		instance.onMouseMove({ offsetX: 60 });

		expect(instance.dndMoveX, 'this.dndMoveX [path < 0, left border]').to.be.equal(60);
		expect(instance.dndStartX, 'this.dndStartX [path < 0, left border]').to.be.equal(60);
		expect(instance.redraw.notCalled, 'this.redraw not called [path < 0, left border]').to.be.true;

		instance.onMouseMove({ offsetX: 140 });

		expect(instance.dndMoveX, 'this.dndMoveX [path > 0, right border]').to.be.equal(140);
		expect(instance.dndStartX, 'this.dndStartX [path > 0, right border]').to.be.equal(140);
		expect(instance.redraw.notCalled, 'this.redraw not called [path > 0, right border]').to.be.true;

		instance.onMouseMove({ offsetX: 140 });

		expect(instance.redraw.notCalled, 'this.redraw not called [path > 0, right border]').to.be.true;

		instance.setState({ dndPointsIndicies: '0,5' });
		instance.onMouseMove({ offsetX: 100 });

		expect(instance.dndMoveX, 'this.dndMoveX [going forward]').to.be.equal(100);
		expect(instance.dndStartX, 'this.dndStartX [going forward]').to.be.equal(100);
		expect(instance.redraw.calledOnce, 'this.redraw called once').to.be.true;
		expect(instance.redraw.args[0][0], 'this.redraw arg').to.be.deep.equal({
			dndPointsIndicies: '2,7'
		});

		instance.setState({ dndPointsIndicies: '2,7' });
		instance.onMouseMove({ offsetX: 1000 });

		expect(instance.dndMoveX, 'this.dndMoveX [going forward, limit reached]').to.be.equal(1000);
		expect(instance.dndStartX, 'this.dndStartX [going forward, limit reached]').to.be.equal(1000);
		expect(instance.redraw.calledTwice, 'this.redraw called twice').to.be.true;
		expect(instance.redraw.args[1][0], 'this.redraw arg').to.be.deep.equal({
			dndPointsIndicies: '0,5'
		});

		instance.setState({ dndPointsIndicies: '0,5' });
		instance.onMouseMove({ offsetX: 0 });

		expect(instance.dndMoveX, 'this.dndMoveX [going forward, limit reached]').to.be.equal(0);
		expect(instance.dndStartX, 'this.dndStartX [going forward, limit reached]').to.be.equal(0);
		expect(instance.redraw.calledThrice, 'this.redraw called thrice').to.be.true;
		expect(instance.redraw.args[2][0], 'this.redraw arg').to.be.deep.equal({
			dndPointsIndicies: '4,9'
		});

		window.setTimeout.restore();
		instance.redraw.restore();
		instance.drawCursorLine.restore();
		wrapper.unmount();
	});

	it('emulateDnd()', () => {
		const wrapper = shallow(
			<Chart data={{
				ts: 1598706293,
				data: [1,2,3,4,5,6,7,8,9,10]
			}} />
		);
		const instance = wrapper.instance();

		stub(instance, 'redraw').callsFake(() => {});

		instance.pointsIndicies = '1,3';
		instance.emulateDnd(-1);

		expect(instance.redraw.calledOnce, 'this.redraw called').to.be.true;
		expect(instance.redraw.args[0][0], 'this.redraw arg [going back, catching toBorder]')
			.to.be.deep.equal({ dndPointsIndicies: '0,2' });

		instance.pointsIndicies = '6,8';
		instance.emulateDnd(1);

		expect(instance.redraw.args[1][0], 'this.redraw arg [going forward, catching toBorder]')
			.to.be.deep.equal({ dndPointsIndicies: null });

		instance.setState({ dndPointsIndicies: '7,9' });
		instance.emulateDnd(-1);

		expect(instance.redraw.args[2][0], 'this.redraw arg [going back]')
			.to.be.deep.equal({ dndPointsIndicies: '5,7' });

		instance.setState({ dndPointsIndicies: '4,6' });
		instance.emulateDnd(1);

		expect(instance.redraw.args[3][0], 'this.redraw arg [going forward]')
			.to.be.deep.equal({ dndPointsIndicies: '6,8' });

		instance.setState({ dndPointsIndicies: '4,6' });
		instance.emulateDnd(-1, true);

		expect(instance.redraw.args[4][0], 'this.redraw arg [going back, toBorder]')
			.to.be.deep.equal({ dndPointsIndicies: '0,2' });

		instance.setState({ dndPointsIndicies: '4,6' });
		instance.emulateDnd(1, true);

		expect(instance.redraw.args[5][0], 'this.redraw arg [going forward, toBorder]')
			.to.be.deep.equal({ dndPointsIndicies: null });

		instance.redraw.restore();
		wrapper.unmount();
	});

	it('deferredHighlightMetric()', () => {
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();
		let setTimeoutId = 1;

		stub(window, 'setTimeout').callsFake(() => setTimeoutId++);

		instance.deferredHighlightMetric('test_metric');

		expect(instance.highlightedMetric, 'this.highlightedMetric').to.be.equal('test_metric');
		expect(instance.highlightMetricTimer, 'this.highlightMetricTimer').to.be.equal(1);
		expect(window.setTimeout.calledOnce, 'setTimeout called once').to.be.true;
		expect(window.setTimeout.args[0][0].name, 'setTimeout 1st arg').to.be.equal('bound highlightMetric');
		expect(window.setTimeout.args[0][1], 'setTimeout 2nd arg').to.be.equal(200);

		instance.deferredHighlightMetric('another_test_metric');

		expect(instance.highlightedMetric, 'this.highlightedMetric').to.be.equal('another_test_metric');
		expect(instance.highlightMetricTimer, 'this.highlightMetricTimer').to.be.equal(1);
		expect(window.setTimeout.calledOnce, 'setTimeout not called').to.be.true;

		window.setTimeout.restore();
		wrapper.unmount();
	});

	it('highlightMetric()', () => {
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance, 'redraw').callsFake(() => {});

		instance.highlightMetricTimer = 2;
		instance.highlightedMetric = 'test_metric';
		instance.setState({ highlightedMetric: 'test_metric' });
		instance.highlightMetric();

		expect(instance.highlightMetricTimer, 'this.highlightMetricTimer').to.be.a('null');
		expect(instance.redraw.notCalled, 'this.redraw not called').to.be.true;

		instance.highlightedMetric = 'another_test_metric';
		instance.highlightMetric();

		expect(instance.redraw.calledOnce, 'this.redraw called').to.be.true;
		expect(instance.redraw.args[0][0], 'this.redraw arg').to.be.deep.equal({
			highlightedMetric: 'another_test_metric'
		});

		instance.redraw.restore();
		wrapper.unmount();
	});

	it('toggleMetric()', () => {
		const wrapper = shallow(
			<Chart { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance, 'redraw').callsFake(() => {});

		instance.toggleMetric('test_metric');

		expect(instance.redraw.calledOnce, 'this.redraw call 1').to.be.true;
		expect(instance.redraw.args[0][0], 'this.redraw call 1, arg').to.be.deep.equal({
			disabledMetrics: ['test_metric'],
			highlightedMetric: null
		});

		instance.setState({ disabledMetrics: ['test_metric'] });
		instance.toggleMetric('test_metric');

		expect(instance.redraw.calledTwice, 'this.redraw call 2').to.be.true;
		expect(instance.redraw.args[1][0], 'this.redraw call 2, arg').to.be.deep.equal({
			disabledMetrics: [],
			highlightedMetric: null
		});

		instance.redraw.restore();
		wrapper.unmount();
	});

	describe('redraw()', () => {
		it('no data', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598706293,
						data: []
					}}
					colors={ Colors }
					labels={ Labels }
				/>
			);
			const instance = wrapper.instance();
			const stateSpy = spy(instance, 'setState');
			const selectTWBindSpy = spy(instance.selectTimeWindow, 'bind');
			const selectedTimeWindow = wrapper.state('selectedTimeWindow');

			instance.redraw();

			expect(instance.ticks, 'this.ticks').to.be.deep.equal([]);
			expect(instance.points, 'this.points').to.be.deep.equal([]);
			expect(instance.toRender, 'this.toRender').to.be.deep.equal({
				yMax: null,
				yMid: null,
				charts: [],
				areas: [],
				legend: [],
				tooltipPoints: []
			});
			expect(instance.dndAllowed, 'this.dndAllowed').to.be.false;
			expect(instance.timeWindowControls, 'this.timeWindowControls').to.have.lengthOf(3);

			let i = 0;

			TimeWindows.forEach((tw, key) => {
				const el = instance.timeWindowControls[i];

				expect(el.nodeName, `[el ${ i }] nodeName`).to.be.equal('div');
				expect(el.attributes.key, `[el ${ i }] key attr`).to.be.equal(key);

				if (key === selectedTimeWindow) {
					expect(el.attributes.className, `[el ${ i }] className attr`)
						.to.be.equal(`${ styles['timewindow__item'] } ${ styles['timewindow__item_selected'] }`);
					expect(el.attributes.onClick, `[el ${ i }] onClick attr`).to.be.a('null');
				} else {
					expect(el.attributes.className, `[el ${ i }] className attr`).to.be.equal(styles['timewindow__item']);
					expect(el.attributes.onClick.name, `[el ${ i }] onClick attr`).to.be.equal('bound selectTimeWindow');
				}

				expect(el.attributes.children, `[el ${ i }] children attr`).to.be.deep.equal([key]);

				i++;
			});

			expect(selectTWBindSpy.calledTwice, 'selectTimeWindow.bind called twice').to.be.true;
			expect(selectTWBindSpy.args[0][0], 'selectTimeWindow.bind call 1, arg 1').to.be.a('null');
			expect(selectTWBindSpy.args[0][1], 'selectTimeWindow.bind call 1, arg 2').to.be.equal('1m');
			expect(selectTWBindSpy.args[1][0], 'selectTimeWindow.bind call 2, arg 1').to.be.a('null');
			expect(selectTWBindSpy.args[1][1], 'selectTimeWindow.bind call 2, arg 2').to.be.equal('15m');

			expect(stateSpy.notCalled, 'this.setState not called').to.be.true;

			stateSpy.restore();
			selectTWBindSpy.restore();
			wrapper.unmount();
		});

		it('firstPointIndex < 0', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598706293,
						data: [{ _ts: 0 }]
					}}
					colors={ Colors }
					labels={ Labels }
				/>
			);
			const instance = wrapper.instance();

			instance.redraw();

			expect(instance.pointsIndicies, 'this.pointsIndicies').to.be.equal('-1,0');

			wrapper.unmount();
		});

		it('firstPointIndex = 0, dndPointsIndicies = null', () => {
			const data = [{
				_ts: 1598706700,
				zone: {
					passed: 10,
					delayed: 1,
					rejected: 0
				}
			}, {
				_ts: 1598706800,
				zone: {
					passed: 20,
					delayed: 2,
					rejected: 1
				}
			}, {
				_ts: 1598706900,
				zone: {
					passed: 30,
					delayed: 3,
					rejected: 2
				}
			}];
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data
					}}
					colors={ Colors }
					labels={ Labels }
				/>
			);
			const instance = wrapper.instance();
			let yMax = 0;
			const toggleMetricBindSpy = spy(instance.toggleMetric, 'bind');
			const deferredHighlightMetricBindSpy = spy(instance.deferredHighlightMetric, 'bind');

			stub(utils, 'getYMax').callsFake(() => yMax);

			instance.setState({ highlightedMetric: 'passed' });
			instance.redraw();

			expect(utils.getYMax.calledOnce, 'getYMax called once').to.be.true;
			expect(utils.getYMax.args[0][0], 'getYMax 1st arg').to.be.deep.equal(data);
			expect(utils.getYMax.args[0][1], 'getYMax 2nd arg').to.be.deep.equal(
				[ 'passed', 'delayed', 'rejected' ]
			);
			expect(utils.getYMax.args[0][2], 'getYMax 3rd arg').to.be.deep.equal([]);
			expect(instance.points[0]._ts, 'this.points[0]._ts').to.be.equal(1598706700);
			expect(instance.points[0].values, 'this.points[0].values').to.be.deep.equal({
				passed: 10,
				delayed: 1,
				rejected: 0
			});
			expect(instance.points[0].x, 'this.points[0].x').to.be.equal(50.719520491333824);
			expect(instance.points[1]._ts, 'this.points[1]._ts').to.be.equal(1598706800);
			expect(instance.points[1].values, 'this.points[1].values').to.be.deep.equal({
				passed: 20,
				delayed: 2,
				rejected: 1
			});
			expect(instance.points[1].x, 'this.points[1].x').to.be.equal(410.47968038473823);
			expect(instance.points[2]._ts, 'this.points[2]._ts').to.be.equal(1598706900);
			expect(instance.points[2].values, 'this.points[2].values').to.be.deep.equal({
				passed: 30,
				delayed: 3,
				rejected: 2
			});
			expect(instance.points[2].x, 'this.points[2].x').to.be.equal(770.2398402781427);
			expect(instance.toRender.charts[0].nodeName, 'this.toRender.charts[0] nodeName')
				.to.be.equal('path');
			expect(instance.toRender.charts[0].attributes.key, 'this.toRender.charts[0] key')
				.to.be.equal('chart_rejected');
			expect(instance.toRender.charts[0].attributes.className, 'this.toRender.charts[0] className')
				.to.be.equal(`${ styles['line'] } ${ styles['faded'] }`);
			expect(instance.toRender.charts[0].attributes.style, 'this.toRender.charts[0] style')
				.to.be.deep.equal({ stroke: '#FF2323' });
			expect(instance.toRender.charts[0].attributes.d, 'this.toRender.charts[0] d')
				.to.be.equal('M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220');
			expect(instance.toRender.charts[1].nodeName, 'this.toRender.charts[1] nodeName')
				.to.be.equal('path');
			expect(instance.toRender.charts[1].attributes.key, 'this.toRender.charts[1] key')
				.to.be.equal('chart_delayed');
			expect(instance.toRender.charts[1].attributes.className, 'this.toRender.charts[1] className')
				.to.be.equal(`${ styles['line'] } ${ styles['faded'] }`);
			expect(instance.toRender.charts[1].attributes.style, 'this.toRender.charts[1] style')
				.to.be.deep.equal({ stroke: '#EBC906' });
			expect(instance.toRender.charts[1].attributes.d, 'this.toRender.charts[1] d')
				.to.be.equal('M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220');
			expect(instance.toRender.charts[2].nodeName, 'this.toRender.charts[2] nodeName')
				.to.be.equal('path');
			expect(instance.toRender.charts[2].attributes.key, 'this.toRender.charts[2] key')
				.to.be.equal('chart_passed');
			expect(instance.toRender.charts[2].attributes.className, 'this.toRender.charts[2] className')
				.to.be.equal(styles['line']);
			expect(instance.toRender.charts[2].attributes.style, 'this.toRender.charts[2] style')
				.to.be.deep.equal({ stroke: '#4FA932' });
			expect(instance.toRender.charts[2].attributes.d, 'this.toRender.charts[2] d')
				.to.be.equal('M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220');

			expect(instance.toRender.areas[0].nodeName, 'this.toRender.areas[0] nodeName')
				.to.be.equal('path');
			expect(instance.toRender.areas[0].attributes.key, 'this.toRender.areas[0] key')
				.to.be.equal('chart-area_rejected');
			expect(instance.toRender.areas[0].attributes.className, 'this.toRender.areas[0] className')
				.to.be.equal(`${ styles['area'] } ${ styles['faded'] }`);
			expect(instance.toRender.areas[0].attributes.style, 'this.toRender.areas[0] style')
				.to.be.deep.equal({ fill: '#FF2323' });
			expect(instance.toRender.areas[0].attributes.d, 'this.toRender.areas[0] d')
				.to.be.equal('M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220 V 220 H 50.719520491333824 V 220');
			expect(instance.toRender.areas[1].nodeName, 'this.toRender.areas[1] nodeName')
				.to.be.equal('path');
			expect(instance.toRender.areas[1].attributes.key, 'this.toRender.areas[1] key')
				.to.be.equal('chart-area_delayed');
			expect(instance.toRender.areas[1].attributes.className, 'this.toRender.areas[1] className')
				.to.be.equal(`${ styles['area'] } ${ styles['faded'] }`);
			expect(instance.toRender.areas[1].attributes.style, 'this.toRender.areas[1] style')
				.to.be.deep.equal({ fill: '#EBC906' });
			expect(instance.toRender.areas[1].attributes.d, 'this.toRender.areas[1] d')
				.to.be.equal('M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220 V 220L 770.2398402781427 220 L 410.47968038473823 220 L 50.719520491333824 220  V 220');
			expect(instance.toRender.areas[2].nodeName, 'this.toRender.areas[2] nodeName')
				.to.be.equal('path');
			expect(instance.toRender.areas[2].attributes.key, 'this.toRender.areas[2] key')
				.to.be.equal('chart-area_passed');
			expect(instance.toRender.areas[2].attributes.className, 'this.toRender.areas[2] className')
				.to.be.equal(styles['area']);
			expect(instance.toRender.areas[2].attributes.style, 'this.toRender.areas[2] style')
				.to.be.deep.equal({ fill: '#4FA932' });
			expect(instance.toRender.areas[2].attributes.d, 'this.toRender.areas[2] d')
				.to.be.equal('M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220 V 220L 770.2398402781427 220 L 410.47968038473823 220 L 50.719520491333824 220  V 220');

			expect(instance.toRender.legend[0].nodeName, 'this.toRender.legend[0] nodeName')
				.to.be.equal('span');
			expect(instance.toRender.legend[0].attributes.key, 'this.toRender.legend[0] key')
				.to.be.equal('legend_passed');
			expect(instance.toRender.legend[0].attributes.className, 'this.toRender.legend[0] className')
				.to.be.equal(styles['legend__item']);
			expect(instance.toRender.legend[0].attributes.onClick.name, 'this.toRender.legend[0] onClick')
				.to.be.equal('bound toggleMetric');
			expect(instance.toRender.legend[0].attributes.onMouseLeave.name, 'this.toRender.legend[0] onMouseLeave')
				.to.be.equal('bound deferredHighlightMetric');
			expect(instance.toRender.legend[0].attributes.onMouseOver.name, 'this.toRender.legend[0] onMouseOver')
				.to.be.equal('bound deferredHighlightMetric');
			expect(instance.toRender.legend[0].children[0].nodeName, 'this.toRender.legend[0] children 1 nodeName')
				.to.be.equal('span');
			expect(
				instance.toRender.legend[0].children[0].attributes.className,
				'this.toRender.legend[0] children 1 className'
			).to.be.equal(styles['legend__color']);
			expect(
				instance.toRender.legend[0].children[0].attributes.style,
				'this.toRender.legend[0] children 1 style'
			).to.be.deep.equal({
				background: '#4FA932'
			});
			expect(instance.toRender.legend[0].children[1], 'this.toRender.legend[0] children 2')
				.to.be.equal('Passed');
			expect(instance.toRender.legend[1].nodeName, 'this.toRender.legend[1] nodeName')
				.to.be.equal('span');
			expect(instance.toRender.legend[1].attributes.key, 'this.toRender.legend[1] key')
				.to.be.equal('legend_delayed');
			expect(instance.toRender.legend[1].attributes.className, 'this.toRender.legend[1] className')
				.to.be.equal(styles['legend__item']);
			expect(instance.toRender.legend[1].attributes.onClick.name, 'this.toRender.legend[1] onClick')
				.to.be.equal('bound toggleMetric');
			expect(instance.toRender.legend[1].attributes.onMouseLeave.name, 'this.toRender.legend[1] onMouseLeave')
				.to.be.equal('bound deferredHighlightMetric');
			expect(instance.toRender.legend[1].attributes.onMouseOver.name, 'this.toRender.legend[1] onMouseOver')
				.to.be.equal('bound deferredHighlightMetric');
			expect(instance.toRender.legend[1].children[0].nodeName, 'this.toRender.legend[1] children 1 nodeName')
				.to.be.equal('span');
			expect(
				instance.toRender.legend[1].children[0].attributes.className,
				'this.toRender.legend[1] children 1 className'
			).to.be.equal(styles['legend__color']);
			expect(
				instance.toRender.legend[1].children[0].attributes.style,
				'this.toRender.legend[1] children 1 style'
			).to.be.deep.equal({
				background: '#EBC906'
			});
			expect(instance.toRender.legend[1].children[1], 'this.toRender.legend[1] children 2')
				.to.be.equal('Delayed');
			expect(instance.toRender.legend[2].nodeName, 'this.toRender.legend[2] nodeName')
				.to.be.equal('span');
			expect(instance.toRender.legend[2].attributes.key, 'this.toRender.legend[2] key')
				.to.be.equal('legend_rejected');
			expect(instance.toRender.legend[2].attributes.className, 'this.toRender.legend[2] className')
				.to.be.equal(styles['legend__item']);
			expect(instance.toRender.legend[2].attributes.onClick.name, 'this.toRender.legend[2] onClick')
				.to.be.equal('bound toggleMetric');
			expect(instance.toRender.legend[2].attributes.onMouseLeave.name, 'this.toRender.legend[2] onMouseLeave')
				.to.be.equal('bound deferredHighlightMetric');
			expect(instance.toRender.legend[2].attributes.onMouseOver.name, 'this.toRender.legend[2] onMouseOver')
				.to.be.equal('bound deferredHighlightMetric');
			expect(instance.toRender.legend[2].children[0].nodeName, 'this.toRender.legend[2] children 1 nodeName')
				.to.be.equal('span');
			expect(
				instance.toRender.legend[2].children[0].attributes.className,
				'this.toRender.legend[2] children 1 className'
			).to.be.equal(styles['legend__color']);
			expect(
				instance.toRender.legend[2].children[0].attributes.style,
				'this.toRender.legend[2] children 1 style'
			).to.be.deep.equal({
				background: '#FF2323'
			});
			expect(instance.toRender.legend[2].children[1], 'this.toRender.legend[1] children 2')
				.to.be.equal('Rejected');

			expect(toggleMetricBindSpy.calledThrice, 'this.toggleMetric.bind called thrice').to.be.true;
			expect(toggleMetricBindSpy.args[0][0], 'this.toggleMetric.bind call 1, arg 1')
				.to.be.deep.equal(instance);
			expect(toggleMetricBindSpy.args[0][1], 'this.toggleMetric.bind call 1, arg 2')
				.to.be.equal('passed');
			expect(toggleMetricBindSpy.args[1][0], 'this.toggleMetric.bind call 2, arg 1')
				.to.be.deep.equal(instance);
			expect(toggleMetricBindSpy.args[1][1], 'this.toggleMetric.bind call 2, arg 2')
				.to.be.equal('delayed');
			expect(toggleMetricBindSpy.args[2][0], 'this.toggleMetric.bind call 3, arg 1')
				.to.be.deep.equal(instance);
			expect(toggleMetricBindSpy.args[2][1], 'this.toggleMetric.bind call 4, arg 2')
				.to.be.equal('rejected');

			expect(deferredHighlightMetricBindSpy.callCount, 'this.deferredHighlightMetric.bind call count')
				.to.be.equal(6);
			expect(deferredHighlightMetricBindSpy.args[0][0], 'this.deferredHighlightMetric.bind call 1, arg 1')
				.to.be.deep.equal(instance);
			expect(deferredHighlightMetricBindSpy.args[0][1], 'this.deferredHighlightMetric.bind call 1, arg 2')
				.to.be.equal('passed');
			expect(deferredHighlightMetricBindSpy.args[1][0], 'this.deferredHighlightMetric.bind call 2, arg 1')
				.to.be.deep.equal(instance);
			expect(deferredHighlightMetricBindSpy.args[1][1], 'this.deferredHighlightMetric.bind call 2, arg 2')
				.to.be.a('null');
			expect(deferredHighlightMetricBindSpy.args[2][0], 'this.deferredHighlightMetric.bind call 3, arg 1')
				.to.be.deep.equal(instance);
			expect(deferredHighlightMetricBindSpy.args[2][1], 'this.deferredHighlightMetric.bind call 3, arg 2')
				.to.be.equal('delayed');
			expect(deferredHighlightMetricBindSpy.args[3][0], 'this.deferredHighlightMetric.bind call 4, arg 1')
				.to.be.deep.equal(instance);
			expect(deferredHighlightMetricBindSpy.args[3][1], 'this.deferredHighlightMetric.bind call 4, arg 2')
				.to.be.a('null');
			expect(deferredHighlightMetricBindSpy.args[4][0], 'this.deferredHighlightMetric.bind call 5, arg 1')
				.to.be.deep.equal(instance);
			expect(deferredHighlightMetricBindSpy.args[4][1], 'this.deferredHighlightMetric.bind call 5, arg 2')
				.to.be.equal('rejected');
			expect(deferredHighlightMetricBindSpy.args[5][0], 'this.deferredHighlightMetric.bind call 6, arg 1')
				.to.be.deep.equal(instance);
			expect(deferredHighlightMetricBindSpy.args[5][1], 'this.deferredHighlightMetric.bind call 6, arg 2')
				.to.be.a('null');

			expect(instance.ticks, 'this.ticks length').to.be.lengthOf(5);
			expect(instance.ticks[0].x, 'this.ticks[0] x').to.be.equal(122.6715524700147);
			expect(instance.ticks[0].y, 'this.ticks[0] y').to.be.equal(238);
			expect(instance.ticks[1].x, 'this.ticks[1] x').to.be.equal(338.5276484060574);
			expect(instance.ticks[1].y, 'this.ticks[1] y').to.be.equal(238);
			expect(instance.ticks[2].x, 'this.ticks[2] x').to.be.equal(554.3837443421);
			expect(instance.ticks[2].y, 'this.ticks[2] y').to.be.equal(238);
			expect(instance.ticks[3].x, 'this.ticks[3] x').to.be.equal(770.2398402781427);
			expect(instance.ticks[3].y, 'this.ticks[3] y').to.be.equal(238);
			expect(instance.ticks[4].x, 'this.ticks[4] x').to.be.equal(986.0959362141853);
			expect(instance.ticks[4].y, 'this.ticks[4] y').to.be.equal(238);

			expect(instance.pointsIndicies, 'this.pointsIndicies').to.be.equal('0,2');

			instance.setState({ dndPointsIndicies: '0,2' });

			([30, 29]).forEach(y => {
				yMax = y;
				instance.redraw();

				expect(instance.toRender.yMax[0].nodeName, 'this.toRender.yMax[0] nodeName')
					.to.be.equal('text');
				expect(instance.toRender.yMax[0].attributes.key, 'this.toRender.yMax[0] key')
					.to.be.equal('y-max-label');
				expect(instance.toRender.yMax[0].attributes.className, 'this.toRender.yMax[0] className')
					.to.be.equal(styles['y-label']);
				expect(instance.toRender.yMax[0].attributes.x, 'this.toRender.yMax[0] x')
					.to.be.equal(45);
				expect(instance.toRender.yMax[0].attributes.y, 'this.toRender.yMax[0] y')
					.to.be.equal(70);
				expect(instance.toRender.yMax[0].children[0], 'this.toRender.yMax[0] children')
					.to.be.equal('30');
				expect(instance.toRender.yMax[1].nodeName, 'this.toRender.yMax[1] nodeName')
					.to.be.equal('line');
				expect(instance.toRender.yMax[1].attributes.key, 'this.toRender.yMax[1] key')
					.to.be.equal('y-max-line');
				expect(instance.toRender.yMax[1].attributes.className, 'this.toRender.yMax[1] className')
					.to.be.equal(styles['x-line']);
				expect(instance.toRender.yMax[1].attributes.x1, 'this.toRender.yMax[1] x1')
					.to.be.equal(50);
				expect(instance.toRender.yMax[1].attributes.x2, 'this.toRender.yMax[1] x2')
					.to.be.equal(1130);
				expect(instance.toRender.yMax[1].attributes.y1, 'this.toRender.yMax[1] y1')
					.to.be.equal(70);
				expect(instance.toRender.yMax[1].attributes.y2, 'this.toRender.yMax[1] y2')
					.to.be.equal(70);

				expect(instance.toRender.yMid[0].nodeName, 'this.toRender.yMid[0] nodeName')
					.to.be.equal('text');
				expect(instance.toRender.yMid[0].attributes.key, 'this.toRender.yMid[0] key')
					.to.be.equal('y-mid-label');
				expect(instance.toRender.yMid[0].attributes.className, 'this.toRender.yMid[0] className')
					.to.be.equal(styles['y-label']);
				expect(instance.toRender.yMid[0].attributes.x, 'this.toRender.yMid[0] x')
					.to.be.equal(45);
				expect(instance.toRender.yMid[0].attributes.y, 'this.toRender.yMid[0] y')
					.to.be.equal(145);
				expect(instance.toRender.yMid[0].children[0], 'this.toRender.yMid[0] children')
					.to.be.equal('15');
				expect(instance.toRender.yMid[1].nodeName, 'this.toRender.yMid[1] nodeName')
					.to.be.equal('line');
				expect(instance.toRender.yMid[1].attributes.key, 'this.toRender.yMid[1] key')
					.to.be.equal('y-mid-line');
				expect(instance.toRender.yMid[1].attributes.className, 'this.toRender.yMid[1] className')
					.to.be.equal(styles['x-line']);
				expect(instance.toRender.yMid[1].attributes.x1, 'this.toRender.yMid[1] x1')
					.to.be.equal(50);
				expect(instance.toRender.yMid[1].attributes.x2, 'this.toRender.yMid[1] x2')
					.to.be.equal(1130);
				expect(instance.toRender.yMid[1].attributes.y1, 'this.toRender.yMid[1] y1')
					.to.be.equal(145);
				expect(instance.toRender.yMid[1].attributes.y2, 'this.toRender.yMid[1] y2')
					.to.be.equal(145);

				expect(instance.toRender.charts[0].attributes.key, 'this.toRender.charts[0] key')
					.to.be.equal('chart_rejected');
				expect(instance.toRender.charts[0].attributes.d, 'this.toRender.charts[0] d')
					.to.be.equal('M 50 220 L 1130 215');
				expect(instance.toRender.charts[1].attributes.key, 'this.toRender.charts[1] key')
					.to.be.equal('chart_delayed');
				expect(instance.toRender.charts[1].attributes.d, 'this.toRender.charts[1] d')
					.to.be.equal('M 50 215 L 1130 205');
				expect(instance.toRender.charts[2].attributes.key, 'this.toRender.charts[2] key')
					.to.be.equal('chart_passed');
				expect(instance.toRender.charts[2].attributes.d, 'this.toRender.charts[2] d')
					.to.be.equal('M 50 165 L 1130 105');

				expect(instance.toRender.areas[0].attributes.key, 'this.toRender.areas[0] key')
					.to.be.equal('chart-area_rejected');
				expect(instance.toRender.areas[0].attributes.d, 'this.toRender.areas[0] d')
					.to.be.equal('M 50 220 L 1130 215 V 220 H 50 V 220');
				expect(instance.toRender.areas[1].attributes.key, 'this.toRender.areas[1] key')
					.to.be.equal('chart-area_delayed');
				expect(instance.toRender.areas[1].attributes.d, 'this.toRender.areas[1] d')
					.to.be.equal('M 50 215 L 1130 205 V 215L 1130 215 L 50 220  V 220');
				expect(instance.toRender.areas[2].attributes.key, 'this.toRender.areas[2] key')
					.to.be.equal('chart-area_passed');
				expect(instance.toRender.areas[2].attributes.d, 'this.toRender.areas[2] d')
					.to.be.equal('M 50 165 L 1130 105 V 205L 1130 205 L 50 215  V 215');
			});

			instance.setState({ selectedTimeWindow: '15m' });
			instance.redraw();

			expect(instance.ticks, 'this.ticks length').to.have.lengthOf(1);
			expect(instance.ticks[0].x, 'this.ticks[0] x').to.be.equal(266);
			expect(instance.ticks[0].y, 'this.ticks[0] y').to.be.equal(238);

			wrapper.setProps({
				data: {
					ts: 1598707000,
					data: data.concat([{
						_ts: 1598707000,
						zone: {
							passed: 100,
							delayed: 0,
							rejected: 0
						}
					}])
				},
				colors: Colors,
				labels: Labels
			});
			instance.setState({ selectedTimeWindow: '1m' });
			instance.redraw();

			expect(instance.ticks, 'this.ticks length').to.have.lengthOf(11);
			expect(instance.ticks[0].x, 'this.ticks[0] x').to.be.equal(50);
			expect(instance.ticks[0].y, 'this.ticks[0] y').to.be.equal(238);
			expect(instance.ticks[1].x, 'this.ticks[1] x').to.be.equal(158);
			expect(instance.ticks[1].y, 'this.ticks[1] y').to.be.equal(238);
			expect(instance.ticks[2].x, 'this.ticks[2] x').to.be.equal(266);
			expect(instance.ticks[2].y, 'this.ticks[2] y').to.be.equal(238);
			expect(instance.ticks[3].x, 'this.ticks[3] x').to.be.equal(374);
			expect(instance.ticks[3].y, 'this.ticks[3] y').to.be.equal(238);
			expect(instance.ticks[4].x, 'this.ticks[4] x').to.be.equal(482);
			expect(instance.ticks[4].y, 'this.ticks[4] y').to.be.equal(238);
			expect(instance.ticks[5].x, 'this.ticks[5] x').to.be.equal(590);
			expect(instance.ticks[5].y, 'this.ticks[5] y').to.be.equal(238);
			expect(instance.ticks[6].x, 'this.ticks[6] x').to.be.equal(698);
			expect(instance.ticks[6].y, 'this.ticks[6] y').to.be.equal(238);
			expect(instance.ticks[7].x, 'this.ticks[7] x').to.be.equal(806);
			expect(instance.ticks[7].y, 'this.ticks[7] y').to.be.equal(238);
			expect(instance.ticks[8].x, 'this.ticks[8] x').to.be.equal(914);
			expect(instance.ticks[8].y, 'this.ticks[8] y').to.be.equal(238);
			expect(instance.ticks[9].x, 'this.ticks[9] x').to.be.equal(1022.0000000000001);
			expect(instance.ticks[9].y, 'this.ticks[9] y').to.be.equal(238);
			expect(instance.ticks[10].x, 'this.ticks[10] x').to.be.equal(1130);
			expect(instance.ticks[10].y, 'this.ticks[10] y').to.be.equal(238);

			toggleMetricBindSpy.restore();
			deferredHighlightMetricBindSpy.restore();
			utils.getYMax.restore();
			wrapper.unmount();
		});

		it('firstPointIndex > 0', () => {
			const data = [{
				_ts: 1598700000,
				zone: {
					passed: 1,
					delayed: 0,
					rejected: 1
				}
			}, {
				_ts: 1598706700,
				zone: {
					passed: 10,
					delayed: 1,
					rejected: 0
				}
			}, {
				_ts: 1598706800,
				zone: {
					passed: 20,
					delayed: 2,
					rejected: 1
				}
			}, {
				_ts: 1598706900,
				zone: {
					passed: 30,
					delayed: 3,
					rejected: 2
				}
			}];
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data
					}}
					colors={ Colors }
					labels={ Labels }
				/>
			);
			const instance = wrapper.instance();
			let updatingPeriod;

			stub(appsettings, 'getSetting').callsFake(() => updatingPeriod);

			([0, 1000]).forEach(ts => {
				updatingPeriod = ts;
				instance.redraw();

				expect(instance.points[0]._ts, `[ts = ${ ts }] this.points[0]._ts`).to.be.equal(1598706700);
				expect(instance.points[0].x, `[ts = ${ ts }] this.points[0].x`).to.be.equal(50);
				expect(instance.points[1]._ts, `[ts = ${ ts }] this.points[1]._ts`).to.be.equal(1598706800);
				expect(instance.points[1].x, `[ts = ${ ts }] this.points[1].x`).to.be.equal(410);
				expect(instance.points[2]._ts, `[ts = ${ ts }] this.points[2]._ts`).to.be.equal(1598706900);
				expect(instance.points[2].x, `[ts = ${ ts }] this.points[2].x`).to.be.equal(770);
			});

			appsettings.getSetting.restore();
			wrapper.unmount();
		});

		it('with disabled metric', () => {
			const data = [{
				_ts: 1598706700,
				zone: {
					passed: 10,
					delayed: 1,
					test: 0,
					rejected: 0
				}
			}, {
				_ts: 1598706800,
				zone: {
					passed: 20,
					delayed: 2,
					test: 0,
					rejected: 1
				}
			}, {
				_ts: 1598706900,
				zone: {
					passed: 30,
					delayed: 3,
					test: 0,
					rejected: 2
				}
			}];
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data
					}}
					colors={ new Map([
						['passed', '#4FA932'],
						['delayed', '#EBC906'],
						['rejected', '#FF2323'],
						['test': '#ffffff']
					]) }
					labels={ Labels }
				/>
			);
			const instance = wrapper.instance();
			const getYMaxSpy = spy(utils, 'getYMax');
			const deferredHighlightMetricBindSpy = spy(instance.deferredHighlightMetric, 'bind');

			instance.setState({ disabledMetrics: ['passed'] });
			instance.redraw();

			expect(getYMaxSpy.calledOnce, 'getYMax called once').to.be.true;
			expect(getYMaxSpy.args[0][2], 'getYMax 3rd arg').to.be.deep.equal(['passed']);
			expect(instance.points[0].values, 'this.points[0].values').to.be.deep.equal({
				delayed: 1,
				test: 0,
				rejected: 0
			});
			expect(instance.points[1].values, 'this.points[1].values').to.be.deep.equal({
				delayed: 2,
				test: 0,
				rejected: 1
			});
			expect(instance.points[2].values, 'this.points[2].values').to.be.deep.equal({
				delayed: 3,
				test: 0,
				rejected: 2
			});
			expect(
				instance.toRender.charts.findIndex(chart => chart.attributes.key === 'chart_passed'),
				'this.toRender.charts'
			).to.be.equal(-1);
			expect(
				instance.toRender.areas.findIndex(area => area.attributes.key === 'chart-area_passed'),
				'this.toRender.areas'
			).to.be.equal(-1);
			expect(deferredHighlightMetricBindSpy.callCount, 'this.deferredHighlightMetric.bind call count')
				.to.be.equal(6);

			const disabledLegendItem = instance.toRender.legend.find(
				legend => legend.attributes.key === 'legend_passed'
			);

			expect(disabledLegendItem.attributes.className, 'legend disabled className').to.be.equal(
				`${ styles['legend__item'] } ${ styles['legend__item_disabled'] }`
			);
			expect(disabledLegendItem.attributes.onMouseOver, 'legend disabled onMouseOver').to.be.a('null');
			expect(disabledLegendItem.attributes.onMouseLeave, 'legend disabled onMouseLeave').to.be.a('null');

			instance.setState({ disabledMetrics: ['rejected'] });
			instance.redraw();

			deferredHighlightMetricBindSpy.restore();
			getYMaxSpy.restore();
			wrapper.unmount();
		});

		it('dndControls', () => {
			const data = [{
				_ts: 1598706700,
				zone: {
					passed: 10,
					delayed: 1,
					rejected: 0
				}
			}, {
				_ts: 1598706800,
				zone: {
					passed: 20,
					delayed: 2,
					rejected: 1
				}
			}, {
				_ts: 1598706900,
				zone: {
					passed: 30,
					delayed: 3,
					rejected: 2
				}
			}];
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data: []
					}}
					colors={ Colors }
					labels={ Labels }
				/>
			);
			const instance = wrapper.instance();
			const emulateDndBindSpy = spy(instance.emulateDnd, 'bind');

			instance.redraw();

			instance.dndControls.forEach((el, i) => {
				expect(el.nodeName, `[no data, el ${ i }] nodeName`).to.be.equal('div');
				expect(el.attributes.key, `[no data, el ${ i }] key attr`).to.be.equal(i);
				expect(el.attributes.className, `[no data, el ${ i }] className attr`)
					.to.be.equal(`${ styles['dnd-controls__control'] } ${ styles['dnd-controls__control_disabled'] }`);
				expect(el.attributes.onClick, `[no data, el ${ i }] onClick attr`).to.be.a('null');
			});

			expect(emulateDndBindSpy.notCalled, 'emulateDnd.bind not called').to.be.true;
			emulateDndBindSpy.resetHistory();

			wrapper.setProps({ data: { ts: 1598707000, data } });
			instance.redraw();

			instance.dndControls.forEach((el, i) => {
				expect(el.nodeName, `[data, el ${ i }] nodeName`).to.be.equal('div');
				expect(el.attributes.key, `[data, el ${ i }] key attr`).to.be.equal(i);
				expect(el.attributes.className, `[data, el ${ i }] className attr`)
					.to.be.equal(`${ styles['dnd-controls__control'] } ${ styles['dnd-controls__control_disabled'] }`);
				expect(el.attributes.onClick, `[data, el ${ i }] onClick attr`).to.be.a('null');
			});

			expect(emulateDndBindSpy.notCalled, 'emulateDnd.bind not called').to.be.true;
			emulateDndBindSpy.resetHistory();

			data.unshift({
				_ts: 1598700000,
				zone: {
					passed: 1,
					delayed: 0,
					rejected: 1
				}
			});
			data.push({
				_ts: 1598707300,
				zone: {
					passed: 100,
					delayed: 10,
					rejected: 9
				}
			});
			wrapper.setProps({ data: { ts: 1598707000, data } });
			instance.setState({ dndPointsIndicies: '1,3' });
			instance.redraw();

			instance.dndControls.forEach((el, i) => {
				expect(el.nodeName, `[many points, el ${ i }] nodeName`).to.be.equal('div');
				expect(el.attributes.key, `[many points, el ${ i }] key attr`).to.be.equal(i);
				expect(el.attributes.className, `[many points, el ${ i }] className attr`).to.be.equal(
					styles['dnd-controls__control']
				);
				expect(el.attributes.onClick.name, `[many points, el ${ i }] onClick attr`).to.be.equal(
					'bound emulateDnd'
				);
			});

			expect(emulateDndBindSpy.callCount, '[many points] emulateDnd.bind call count').to.be.equal(4);
			expect(emulateDndBindSpy.args[0][0], '[many points] emulateDnd.bind call 1, arg 1')
				.to.be.deep.equal(instance);
			expect(emulateDndBindSpy.args[0][1], '[many points] emulateDnd.bind call 1, arg 2').to.be.equal(-1);
			expect(emulateDndBindSpy.args[0][2], '[many points] emulateDnd.bind call 1, arg 3').to.be.true;
			expect(emulateDndBindSpy.args[1][0], '[many points] emulateDnd.bind call 2, arg 1')
				.to.be.deep.equal(instance);
			expect(emulateDndBindSpy.args[1][1], '[many points] emulateDnd.bind call 2, arg 2').to.be.equal(-1);
			expect(emulateDndBindSpy.args[1][2], '[many points] emulateDnd.bind call 2, arg 3').to.be.false;
			expect(emulateDndBindSpy.args[2][0], '[many points] emulateDnd.bind call 3, arg 1')
				.to.be.deep.equal(instance);
			expect(emulateDndBindSpy.args[2][1], '[many points] emulateDnd.bind call 3, arg 2').to.be.equal(1);
			expect(emulateDndBindSpy.args[2][2], '[many points] emulateDnd.bind call 3, arg 3').to.be.false;
			expect(emulateDndBindSpy.args[3][0], '[many points] emulateDnd.bind call 4, arg 1')
				.to.be.deep.equal(instance);
			expect(emulateDndBindSpy.args[3][1], '[many points] emulateDnd.bind call 4, arg 2').to.be.equal(1);
			expect(emulateDndBindSpy.args[3][2], '[many points] emulateDnd.bind call 4, arg 3').to.be.true;

			emulateDndBindSpy.restore();
			wrapper.unmount();
		});

		it('handle the passed state', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data: [{
							_ts: 1598700000,
							zone: {
								passed: 1,
								delayed: 0,
								rejected: 1
							}
						}, {
							_ts: 1598706700,
							zone: {
								passed: 10,
								delayed: 1,
								rejected: 0
							}
						}, {
							_ts: 1598706800,
							zone: {
								passed: 20,
								delayed: 2,
								rejected: 1
							}
						}, {
							_ts: 1598706900,
							zone: {
								passed: 30,
								delayed: 3,
								rejected: 2
							}
						}, {
							_ts: 1598707300,
							zone: {
								passed: 100,
								delayed: 10,
								rejected: 9
							}
						}]
					}}
					colors={ Colors }
					labels={ Labels }
				/>
			);
			const instance = wrapper.instance();
			const state = {
				disabledMetrics: ['passed'],
				highlightedMetric: ['delayed']
			};
			const setStateSpy = spy(instance, 'setState');

			instance.redraw(state);

			expect(
				instance.toRender.legend.find(
					legend => legend.attributes.key === 'legend_passed'
				).attributes.className,
				'legend disabled className'
			).to.be.equal(
				`${ styles['legend__item'] } ${ styles['legend__item_disabled'] }`
			);
			expect(
				instance.toRender.charts.find(
					chart => chart.attributes.key === 'chart_rejected'
				).attributes.className,
				'chart faded className'
			).to.be.equal(
				`${ styles['line'] } ${ styles['faded'] }`
			);
			expect(instance.points, 'this.points length').to.have.lengthOf(4);
			expect(instance.points[0].x, '[timeWindow 5m] this.points[0].x').to.be.equal(50);
			expect(instance.points[1].x, '[timeWindow 5m] this.points[1].x').to.be.equal(410);
			expect(instance.points[2].x, '[timeWindow 5m] this.points[2].x').to.be.equal(770);
			expect(instance.points[3].x, '[timeWindow 5m] this.points[3].x').to.be.equal(2210);

			expect(setStateSpy.calledOnce, 'this.setState called once').to.be.true;
			expect(setStateSpy.args[0][0], 'this.setState arg').to.be.deep.equal(state);

			instance.redraw({ selectedTimeWindow: '15m' });

			expect(instance.points, 'this.points length').to.have.lengthOf(4);
			expect(instance.points[0].x, '[timeWindow 15m] this.points[0].x').to.be.equal(770.0799822833796);
			expect(instance.points[1].x, '[timeWindow 15m] this.points[1].x').to.be.equal(890.0533215413224);
			expect(instance.points[2].x, '[timeWindow 15m] this.points[2].x').to.be.equal(1010.026660799265);
			expect(instance.points[3].x, '[timeWindow 15m] this.points[3].x').to.be.equal(1489.9200178310357);

			instance.redraw({ timeEnd: 1598706700 });

			expect(instance.points, 'this.points length').to.have.lengthOf(4);
			expect(instance.points[0].x, '[timeWindow 15m] this.points[0].x').to.be.equal(1130.0000000572077);
			expect(instance.points[1].x, '[timeWindow 15m] this.points[1].x').to.be.equal(1249.9733393151503);
			expect(instance.points[2].x, '[timeWindow 15m] this.points[2].x').to.be.equal(1369.946678573093);
			expect(instance.points[3].x, '[timeWindow 15m] this.points[3].x').to.be.equal(1849.8400356048637);

			instance.redraw({ dndPointsIndicies: '1,3' });

			expect(instance.points, 'this.points length').to.have.lengthOf(2);

			setStateSpy.restore();
			wrapper.unmount();
		});

		it('handle the passed props', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data: []
					}}
					colors={ Colors }
					labels={ Labels }
				/>
			);
			const instance = wrapper.instance();
			const nextProps = {
				data: {
					ts: 1598707000,
					data: [{
						_ts: 1598706700,
						zone: {
							passed: 10
						}
					}]
				},
				colors: new Map([
					['passed', '#FFFFFF']
				]),
				labels: new Map([
					['passed', 'Some other title for passed metric']
				])
			};

			instance.redraw({}, nextProps);

			expect(instance.toRender.charts[0].attributes.style.stroke, 'chart color').to.be.equal(
				nextProps.colors.get('passed')
			);
			expect(instance.toRender.legend[0].children[1], 'legend title').to.be.equal(
				nextProps.labels.get('passed')
			);
			expect(instance.points, 'this.points length').to.have.lengthOf(1);

			nextProps.labels = new Map();
			instance.redraw({}, nextProps);

			expect(instance.toRender.legend[0].children[1], 'legend title').to.be.equal('passed');

			wrapper.unmount();
		});
	});

	it('selectTimeWindow()', () => {
		const wrapper = shallow(
			<Chart
				data={{
					ts: 1598707000,
					data: []
				}}
				colors={ Colors }
				labels={ Labels }
			/>
		);
		const instance = wrapper.instance();

		stub(appsettings, 'setSetting').callsFake(() => {});

		instance.selectTimeWindow('test');

		expect(appsettings.setSetting.calledOnce, 'setSetting called').to.be.true;
		expect(appsettings.setSetting.args[0][0], 'setSetting 1st arg').to.be.equal('timeWindow');
		expect(appsettings.setSetting.args[0][1], 'setSetting 2nd arg').to.be.equal('test');

		appsettings.setSetting.restore();
		wrapper.unmount();
	});

	describe('render()', () => {
		it('no mouseOffsetX, no dnd, no active point', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data: []
					}}
					colors={ Colors }
					labels={ Labels }
				/>
			);
			const instance = wrapper.instance();

			instance.dndControls = 'dndControls__test';
			instance.timeWindowControls = 'timeWindowControls__test';
			instance.toRender.yMax = <div>toRender_yMax__test</div>;
			instance.toRender.yMid = <div>toRender_yMid__test</div>;
			instance.toRender.charts = <div>toRender_charts__test</div>;
			instance.toRender.areas = <div>toRender_areas__test</div>;
			instance.toRender.legend = 'legend__test';
			instance.ticks = [
				{ x: 10, y: 20, label: 'tick 1' },
				{ x: 11, y: 22, label: 'tick 2' }
			];
			instance.forceUpdate();

			const container = wrapper.find(`.${ styles['container'] }`);
			const dndControls = container.find(`.${ styles['dnd-controls'] }`);
			const timeWindow = container.find(`.${ styles['timewindow'] }`);

			expect(container, 'container').to.have.lengthOf(1);
			expect(dndControls.text(), 'dnd-controls inner').to.be.equal('dndControls__test');
			expect(timeWindow.text(), 'timewindow inner').to.be.equal('timeWindowControls__test');

			let mouseTracker = container.find(`.${ styles['mouse-tracker'] }`);

			expect(mouseTracker.prop('className'), 'mouse-tracker className').to.be.equal(
				styles['mouse-tracker']
			);
			expect(mouseTracker.prop('style'), 'mouse-tracker style').to.be.deep.equal({
				height: '150px',
				left: '50px',
				top: '70px',
				width: '1080px'
			});
			expect(mouseTracker.prop('onMouseMove').name, 'mouse-tracker onMouseMove').to.be.equal(
				'bound onMouseMove'
			);
			expect(mouseTracker.prop('onMouseLeave').name, 'mouse-tracker onMouseLeave').to.be.equal(
				'bound onMouseLeave'
			);
			expect(mouseTracker.prop('onMouseDown'), 'mouse-tracker onMouseDown').to.be.a('null');
			expect(mouseTracker.prop('onMouseUp'), 'mouse-tracker onMouseUp').to.be.a('null');

			const svg = container.find(`svg.${ styles['svg'] }`);
			const ticksLines = svg.find(`path.${ styles['x-axis'] }`);
			const yLabel = svg.find(`text.${ styles['y-label'] }`);
			const xAxis = svg.find(`line.${ styles['x-axis'] }`);
			const cursorLine = svg.find(`line.${ styles['cursor-line'] }`);
			const ticksLabels = svg.find(`text.${ styles['x-label'] }`);

			expect(svg.prop('width'), 'svg width').to.be.equal('1150');
			expect(svg.prop('height'), 'svg height').to.be.equal('250');
			expect(ticksLines.prop('d'), 'ticks lines d').to.be.equal('M 10 220 V 226 M 11 220 V 226');
			expect(yLabel.prop('x'), 'y-label x').to.be.equal(45);
			expect(yLabel.prop('y'), 'y-label y').to.be.equal(220);
			expect(xAxis.prop('x1'), 'x-axis x1').to.be.equal(50);
			expect(xAxis.prop('x2'), 'x-axis x2').to.be.equal(1130);
			expect(xAxis.prop('y1'), 'x-axis y1').to.be.equal(220);
			expect(xAxis.prop('y2'), 'x-axis y2').to.be.equal(220);
			expect(cursorLine.prop('y1'), 'cursor-line y1').to.be.equal(60);
			expect(cursorLine.prop('y2'), 'cursor-line y2').to.be.equal(226);
			expect(cursorLine.prop('transform'), 'cursor-line y2').to.be.a('null');
			expect(cursorLine.prop('style'), 'cursor-line y2').to.be.deep.equal({
				opacity: 0
			});
			expect(ticksLabels.at(0).prop('className'), 'this.ticks[0] className').to.be.equal(
				styles['x-label']
			);
			expect(ticksLabels.at(0).prop('x'), 'this.ticks[0] x').to.be.equal(10);
			expect(ticksLabels.at(0).prop('y'), 'this.ticks[0] y').to.be.equal(20);
			expect(ticksLabels.at(0).text(), 'this.ticks[0] text').to.be.equal('tick 1');
			expect(ticksLabels.at(1).prop('className'), 'this.ticks[1] className').to.be.equal(
				styles['x-label']
			);
			expect(ticksLabels.at(1).prop('x'), 'this.ticks[1] x').to.be.equal(11);
			expect(ticksLabels.at(1).prop('y'), 'this.ticks[1] y').to.be.equal(22);
			expect(ticksLabels.at(1).text(), 'this.ticks[1] text').to.be.equal('tick 2');
			expect(svg.childAt(6).text(), 'this.toRender.yMax').to.be.equal('toRender_yMax__test');
			expect(svg.childAt(7).text(), 'this.toRender.yMid').to.be.equal('toRender_yMid__test');
			expect(svg.childAt(8).text(), 'this.toRender.charts').to.be.equal('toRender_charts__test');
			expect(svg.childAt(9).text(), 'this.toRender.areas').to.be.equal('toRender_areas__test');
			expect(container.find(`div.${ styles['legend'] }`).text(), 'this.toRender.legend')
				.to.be.equal('legend__test');

			wrapper.unmount();
		});

		it('mouseOffsetX, dndIsInProgress, dndAllowed', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data: []
					}}
					colors={ Colors }
					labels={ Labels }
				/>
			);
			const instance = wrapper.instance();

			instance.points = [
				{ x: 10, values: { passed: 45 } },
				{ x: 900, values: { passed: 51 } }
			];
			instance.setState({ mouseOffsetX: 10 });

			const tooltipPoints = wrapper.instance().toRender.tooltipPoints[0];

			expect(tooltipPoints.attributes.key, 'tooltip points key').to.be.equal('tooltip_passed');
			expect(tooltipPoints.attributes.className, 'tooltip points className')
				.to.be.equal(styles['tooltip__point']);
			expect(tooltipPoints.children[0].attributes.className, 'tooltip points child 1, className')
				.to.be.equal(styles['tooltip__value']);
			expect(tooltipPoints.children[0].attributes.style, 'tooltip points child 1, style')
				.to.be.deep.equal({ color: '#4FA932' });
			expect(tooltipPoints.children[0].children[0], 'tooltip points child 1, text').to.be.equal('45');
			expect(tooltipPoints.children[1].attributes.className, 'tooltip points child 2, className')
				.to.be.equal(styles['tooltip__metric']);
			expect(tooltipPoints.children[1].children[0], 'tooltip points child 2, text').to.be.equal('Passed');

			const tooltip = wrapper.find(`div.${ styles['tooltip'] }`);

			expect(tooltip.prop('style'), 'tooltip style').to.be.deep.equal({ left: '18px' });
			expect(tooltip.find(`div.${ styles['tooltip__point'] }`), 'tooltip points').to.have.lengthOf(1);
			expect(tooltip.find(`div.${ styles['tooltip__time'] }`), 'tooltip time').to.have.lengthOf(1);

			expect(
				wrapper.find(`svg line.${ styles['cursor-line'] }`).prop('transform'),
				'cursor-line transform'
			).to.be.equal('translate(10)');

			wrapper.setProps({
				data: {
					ts: 1598707000,
					data: []
				},
				colors: Colors,
				labels: new Map()
			});

			expect(
				wrapper.instance().toRender.tooltipPoints[0].children[1].children[0],
				'[no labels] tooltip child 2, text'
			).to.be.equal('passed');

			instance.setState({ mouseOffsetX: 890 });

			expect(
				wrapper.instance().toRender.tooltipPoints[0].children[0].children[0],
				'[mouseOffsetX: 890] tooltip child 1, text'
			).to.be.equal('51');
			expect(wrapper.find(`div.${ styles['tooltip'] }`).prop('style'), 'tooltip style')
				.to.be.deep.equal({ right: '258px' });

			instance.setState({ mouseOffsetX: 40 });

			expect(
				wrapper.instance().toRender.tooltipPoints[0].children[0].children[0],
				'[mouseOffsetX: 40] tooltip child 1, text'
			).to.be.equal('45');

			instance.dndAllowed = true;
			instance.setState({ dndIsInProgress: true });

			expect(wrapper.find(`.${ styles['mouse-tracker_drag'] }`), 'mouse-tracker_drag')
				.to.have.lengthOf(1);
			expect(wrapper.find(`.${ styles['mouse-tracker_dragging'] }`), 'mouse-tracker_dragging')
				.to.have.lengthOf(1);
			expect(
				wrapper.find(`.${ styles['mouse-tracker'] }`).prop('onMouseDown').name,
				'mouse-tracker onMouseDown'
			).to.be.equal('bound onMouseDown');
			expect(
				wrapper.find(`.${ styles['mouse-tracker'] }`).prop('onMouseUp').name,
				'mouse-tracker onMouseUp'
			).to.be.equal('bound onMouseUp');

			wrapper.unmount();
		});
	});
});
