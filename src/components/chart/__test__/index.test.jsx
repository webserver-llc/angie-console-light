/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow, mount } from 'enzyme';
import Chart, {
	chartDimensions,
	TimeWindows,
	TimeWindowDefault
} from '../index.jsx';
import utils from '../utils.js';
import appsettings from '../../../appsettings';
import { limitConnReqHistoryLimit } from '../../../calculators/utils.js';
import styles from '../style.css';

describe('<Chart />', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

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
		jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => timeWindow);

		const drawCursorLineSpy = jest.spyOn(Chart.prototype.drawCursorLine, 'bind').mockClear();
		const onMouseMoveSpy = jest.spyOn(Chart.prototype.onMouseMove, 'bind').mockClear();
		const onMouseLeaveSpy = jest.spyOn(Chart.prototype.onMouseLeave, 'bind').mockClear();
		const onMouseDownSpy = jest.spyOn(Chart.prototype.onMouseDown, 'bind').mockClear();
		const onMouseUpSpy = jest.spyOn(Chart.prototype.onMouseUp, 'bind').mockClear();
		const highlightMetricSpy = jest.spyOn(Chart.prototype.highlightMetric, 'bind').mockClear();
		const onSettingsChangeSpy = jest.spyOn(Chart.prototype.onSettingsChange, 'bind').mockClear();
		const redrawStub = jest.spyOn(Chart.prototype, 'redraw').mockClear().mockImplementation(function (){
			this.ticks = [];
			this.toRender = {};
		});
		const redrawSpy = jest.spyOn(Chart.prototype.redraw, 'bind').mockClear();

		let timeWindow = null;
		let wrapper = shallow(
			<Chart {...props} />
		);
		const instance = wrapper.instance();

		// getSetting called once
		expect(appsettings.getSetting).toHaveBeenCalled();
		// getSetting 1st arg
		expect(appsettings.getSetting.mock.calls[0][0]).toBe('timeWindow');
		// state
		expect(wrapper.state()).toEqual({
			disabledMetrics: [],
			highlightedMetric: null,
			mouseOffsetX: null,
			selectedTimeWindow: TimeWindowDefault,
			timeEnd: props.data.ts,
			dndIsInProgress: false,
			dndPointsIndicies: null
		});
		expect(instance.highlightMetricTimer).toBeNull();
		expect(instance.highlightedMetric).toBeNull();
		expect(instance.mouseOffsetX).toBeNull();
		expect(instance.mouseMoveTimer).toBeNull();
		// this.dndStartX
		expect(instance.dndStartX).toBe(0);
		// this.dndMoveX
		expect(instance.dndMoveX).toBe(0);
		// this.pointsIndicies
		expect(instance.pointsIndicies).toBe('0,0');
		// drawCursorLine binded
		expect(drawCursorLineSpy).toHaveBeenCalled();
		// drawCursorLine binded to instance
		expect(drawCursorLineSpy.mock.calls[0][0] instanceof Chart).toBe(true);
		// onMouseMove binded
		expect(onMouseMoveSpy).toHaveBeenCalled();
		// onMouseMove binded to instance
		expect(onMouseMoveSpy.mock.calls[0][0] instanceof Chart).toBe(true);
		// onMouseLeave binded
		expect(onMouseLeaveSpy).toHaveBeenCalled();
		// onMouseLeave binded to instance
		expect(onMouseLeaveSpy.mock.calls[0][0] instanceof Chart).toBe(true);
		// onMouseDown binded
		expect(onMouseDownSpy).toHaveBeenCalled();
		// onMouseDown binded to instance
		expect(onMouseDownSpy.mock.calls[0][0] instanceof Chart).toBe(true);
		// onMouseUp binded
		expect(onMouseUpSpy).toHaveBeenCalled();
		// onMouseUp binded to instance
		expect(onMouseUpSpy.mock.calls[0][0] instanceof Chart).toBe(true);
		// redraw binded
		expect(redrawSpy).toHaveBeenCalled();
		// redraw binded to instance
		expect(redrawSpy.mock.calls[0][0] instanceof Chart).toBe(true);
		// highlightMetric binded
		expect(highlightMetricSpy).toHaveBeenCalled();
		// highlightMetric binded to instance
		expect(highlightMetricSpy.mock.calls[0][0] instanceof Chart).toBe(true);
		// onSettingsChange binded
		expect(onSettingsChangeSpy).toHaveBeenCalled();
		// onSettingsChange binded to instance
		expect(onSettingsChangeSpy.mock.calls[0][0] instanceof Chart).toBe(true);
		// redraw called once
		expect(redrawStub).toHaveBeenCalled();

		timeWindow = '0m';
		wrapper = shallow(
			<Chart {...props} />
		);

		// selectedTimeWindow state when timeWindow is unknown
		expect(wrapper.state('selectedTimeWindow')).toBe(TimeWindowDefault);

		timeWindow = '1m';
		wrapper = shallow(
			<Chart {...props} />
		);

		// selectedTimeWindow state with timeWindow set
		expect(wrapper.state('selectedTimeWindow')).toBe(timeWindow);
		wrapper.unmount();
	});

	it('componentDidMount()', () => {
		const subscribeResult = 'test_subscribe_result';
		const wrapper = mount(
			<Chart {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(appsettings, 'subscribe').mockClear().mockImplementation(() => subscribeResult);

		instance.componentDidMount();

		// appsettings.subscribe called once
		expect(appsettings.subscribe).toHaveBeenCalled();
		// appsettings.subscribe 1st arg
		expect(appsettings.subscribe.mock.calls[0][0].name).toBe('bound onSettingsChange');
		// appsettings.subscribe 2nd arg
		expect(appsettings.subscribe.mock.calls[0][1]).toBe('timeWindow');
		// this.settingsListener
		expect(instance.settingsListener).toBe(subscribeResult);

		appsettings.subscribe.mockRestore();
		wrapper.unmount();
	});

	it('componentWillUnmount()', () => {
		const subscribeResult = 'test_subscribe_result';
		const wrapper = shallow(
			<Chart {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(appsettings, 'unsubscribe').mockClear().mockImplementation(() => {});

		instance.settingsListener = subscribeResult;
		instance.componentWillUnmount();

		// appsettings.unsubscribe called once
		expect(appsettings.unsubscribe).toHaveBeenCalled();
		// appsettings.unsubscribe 1st arg
		expect(appsettings.unsubscribe.mock.calls[0][0]).toBe(subscribeResult);
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
			<Chart {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => updatingPeriod);
		jest.spyOn(instance, 'redraw').mockClear().mockImplementation(() => {});

		instance.componentWillReceiveProps(nextData);

		// getSetting not called
		expect(appsettings.getSetting).not.toHaveBeenCalled();
		// this.redraw not called
		expect(instance.redraw).not.toHaveBeenCalled();

		nextData.data.ts = 1598706296;
		instance.componentWillReceiveProps(nextData);

		// getSetting not called
		expect(appsettings.getSetting).not.toHaveBeenCalled();
		expect(instance.redraw).toHaveBeenCalledTimes(1);
		// this.redraw 1st arg
		expect(instance.redraw.mock.calls[0][0]).toEqual({
			timeEnd: nextData.data.ts
		});
		// this.redraw 2nd arg
		expect(instance.redraw.mock.calls[0][1]).toEqual(nextData);

		wrapper.setState({ dndPointsIndicies: '0,100' });
		instance.componentWillReceiveProps(nextData);

		// getSetting not called
		expect(appsettings.getSetting).not.toHaveBeenCalled();
		expect(instance.redraw).toHaveBeenCalledTimes(2);
		// this.redraw 1st arg
		expect(instance.redraw.mock.calls[1][0]).toEqual({
			timeEnd: nextData.data.ts
		});

		instance.historyLimit = 1;
		nextData.data.data = ['test'];
		instance.componentWillReceiveProps(nextData);

		expect(appsettings.getSetting).toHaveBeenCalledTimes(1);
		// getSetting 1st arg
		expect(appsettings.getSetting.mock.calls[0][0]).toBe('updatingPeriod');
		expect(instance.redraw).toHaveBeenCalledTimes(3);
		// nextState "dndPointsIndicies"
		expect(instance.redraw.mock.calls[2][0].dndPointsIndicies).toBe('0,100');
		// this.redraw 2nd arg
		expect(instance.redraw.mock.calls[2][1]).toEqual(nextData);

		wrapper.setState({ dndPointsIndicies: '10,110' });
		instance.componentWillReceiveProps(nextData);

		expect(instance.redraw).toHaveBeenCalledTimes(4);
		// nextState "dndPointsIndicies"
		expect(instance.redraw.mock.calls[3][0].dndPointsIndicies).toBe('7,107');
	});

	it('shouldComponentUpdate()', () => {
		const wrapper = shallow(
			<Chart {...props} />
		);
		const instance = wrapper.instance();

		// default behaviour
		expect(instance.shouldComponentUpdate()).toBe(true);

		wrapper.setState({ dndIsInProgress: true });

		// dndIsInProgress = true, dndPointsIndicies changed
		expect(instance.shouldComponentUpdate(null, { dndPointsIndicies: '0,100' })).toBe(true);
		wrapper.setState({ dndPointsIndicies: '0,100' });

		// dndIsInProgress = true, dndPointsIndicies not changed
		expect(instance.shouldComponentUpdate(null, { dndPointsIndicies: '0,100' })).toBe(false);
	});

	it('onSettingsChange()', () => {
		const value = 'test_value';
		const wrapper = shallow(
			<Chart {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'redraw').mockClear().mockImplementation(() => {});

		instance.onSettingsChange(value);

		// this.redraw called
		expect(instance.redraw).toHaveBeenCalled();
		// this.redraw 1st arg
		expect(instance.redraw.mock.calls[0][0]).toEqual({
			selectedTimeWindow: value,
			dndPointsIndicies: null
		});
	});

	it('onMouseLeave()', () => {
		const wrapper = shallow(
			<Chart {...props} />
		);
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();
		const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout').mockClear();

		instance.onMouseLeave();

		// clearTimeout not called
		expect(window.clearTimeout).not.toHaveBeenCalled();
		expect(instance.setState).toHaveBeenCalledTimes(1);
		// this.setState arg
		expect(instance.setState.mock.calls[0][0]).toEqual({
			mouseOffsetX: null,
			dndIsInProgress: false
		});

		instance.mouseMoveTimer = 123;
		instance.onMouseLeave();

		// clearTimeout called once
		expect(window.clearTimeout).toHaveBeenCalled();
		expect(instance.mouseMoveTimer).toBeNull();
		expect(instance.setState).toHaveBeenCalledTimes(2);
		// this.setState arg
		expect(instance.setState.mock.calls[0][0]).toEqual({
			mouseOffsetX: null,
			dndIsInProgress: false
		});

		stateSpy.mockRestore();
		clearTimeoutSpy.mockRestore();
	});

	/* TODO something use state in Chart.tsx. Tests fails if run all tests */
	it('drawCursorLine()', () => {
		let wrapper;
		let	instance;

		wrapper = shallow(
			<Chart {...props} />
		);
		instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.mouseOffsetX = 'test_offset_x';
		instance.drawCursorLine();

		// this.setState called
		expect(stateSpy).toHaveBeenCalledOnce();
		// this.setState arg
		expect(stateSpy.mock.calls[0][0]).toEqual({
			mouseOffsetX: 'test_offset_x'
		});
		wrapper.unmount();

		wrapper = shallow(
			<Chart {...props} />
		);
		instance = wrapper.instance();

		wrapper.setState({ dndIsInProgress: true });

		stateSpy.mockClear();
		instance.drawCursorLine();

		// this.setState not called
		expect(stateSpy).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onMouseDown()', () => {
		const offsetX = 150;
		const wrapper = shallow(
			<Chart {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'redraw').mockClear().mockImplementation(() => {});

		instance.onMouseDown({ offsetX });

		// this.dndStartX
		expect(instance.dndStartX).toBe(offsetX);
		// this.dndMoveX
		expect(instance.dndMoveX).toBe(offsetX);
		// this.redraw called once
		expect(instance.redraw).toHaveBeenCalled();
		// this.redraw arg
		expect(instance.redraw.mock.calls[0][0]).toEqual({
			dndIsInProgress: true,
			mouseOffsetX: null,
			dndPointsIndicies: '0,0'
		});

		wrapper.setState({ dndPointsIndicies: '0,0' });
		instance.onMouseDown({ offsetX });

		// this.redraw called twice
		expect(instance.redraw).toHaveBeenCalledTimes(2);
		// this.redraw arg
		expect(instance.redraw.mock.calls[1][0]).toEqual({
			dndIsInProgress: true,
			mouseOffsetX: null
		});
	});

	it('onMouseUp()', () => {
		const wrapper = shallow(
			<Chart data={{
				ts: 1598706293,
				data: [1, 2, 3]
			}}
			/>
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'redraw').mockClear().mockImplementation(() => {});

		instance.onMouseUp();

		// this.redraw called once
		expect(instance.redraw).toHaveBeenCalled();
		// this.redraw arg
		expect(instance.redraw.mock.calls[0][0]).toEqual({
			dndIsInProgress: false
		});

		wrapper.setState({ dndPointsIndicies: '0,1' });
		instance.onMouseUp();

		// this.redraw called twice
		expect(instance.redraw).toHaveBeenCalledTimes(2);
		// this.redraw arg
		expect(instance.redraw.mock.calls[1][0]).toEqual({
			dndIsInProgress: false
		});

		wrapper.setState({ dndPointsIndicies: '0,2' });
		instance.onMouseUp();

		// this.redraw called thrice
		expect(instance.redraw).toHaveBeenCalledTimes(3);
		// this.redraw arg
		expect(instance.redraw.mock.calls[2][0]).toEqual({
			dndIsInProgress: false,
			dndPointsIndicies: null
		});
	});

	it('onMouseMove()', () => {
		const wrapper = shallow(
			<Chart data={{
				ts: 1598706293,
				data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			}}
			/>
		);
		const instance = wrapper.instance();
		const setTimeoutId = 123;
		let setTimeoutCallback;

		jest.spyOn(window, 'setTimeout').mockClear().mockImplementation(fn => {
			setTimeoutCallback = fn;
			return setTimeoutId;
		});
		jest.spyOn(instance, 'redraw').mockClear().mockImplementation(() => {});
		jest.spyOn(instance, 'drawCursorLine').mockClear().mockImplementation(() => {});

		instance.onMouseMove({ offsetX: 100 });

		// this.mouseOffsetX
		expect(instance.mouseOffsetX).toBe(150);
		// setTimeout called once
		expect(window.setTimeout).toHaveBeenCalled();
		// setTimeout time value
		expect(window.setTimeout.mock.calls[0][1]).toBe(100);
		// this.mouseMoveTimer
		expect(instance.mouseMoveTimer).toBe(setTimeoutId);

		instance.onMouseMove({ offsetX: 100 });

		expect(window.setTimeout).toHaveBeenCalled();

		setTimeoutCallback();

		// this.drawCursorLine called once
		expect(instance.drawCursorLine).toHaveBeenCalled();
		expect(instance.mouseMoveTimer).toBeNull();

		wrapper.setState({
			dndIsInProgress: true,
			dndPointsIndicies: '0,14'
		});
		instance.dndStartX = 0;
		instance.dndMoveX = 200;
		instance.onMouseMove({ offsetX: 100 });

		// this.dndStartX
		expect(instance.dndStartX).toBe(100);
		// this.dndMoveX
		expect(instance.dndMoveX).toBe(100);

		wrapper.setState({ selectedTimeWindow: '15m' });
		instance.dndMoveX = 120;
		instance.onMouseMove({ offsetX: 140 });

		// this.dndMoveX [selectedTW 15m]
		expect(instance.dndMoveX).toBe(140);
		// this.dndStartX [selectedTW 15m]
		expect(instance.dndStartX).toBe(260);

		wrapper.setState({ selectedTimeWindow: '5m' });
		instance.dndMoveX = 280;
		instance.onMouseMove({ offsetX: 200 });

		// this.dndMoveX [selectedTW 5m]
		expect(instance.dndMoveX).toBe(200);
		// this.dndStartX [selectedTW 5m]
		expect(instance.dndStartX).toBe(140);

		wrapper.setState({ selectedTimeWindow: '1m' });
		instance.dndMoveX = 160;
		instance.onMouseMove({ offsetX: 200 });

		// this.dndMoveX [selectedTW 1m]
		expect(instance.dndMoveX).toBe(200);
		// this.dndStartX [selectedTW 1m]
		expect(instance.dndStartX).toBe(200);

		instance.onMouseMove({ offsetX: 60 });

		// this.dndMoveX [path < 0, left border]
		expect(instance.dndMoveX).toBe(60);
		// this.dndStartX [path < 0, left border]
		expect(instance.dndStartX).toBe(60);
		// this.redraw not called [path < 0, left border]
		expect(instance.redraw).not.toHaveBeenCalled();

		instance.onMouseMove({ offsetX: 140 });

		// this.dndMoveX [path > 0, right border]
		expect(instance.dndMoveX).toBe(140);
		// this.dndStartX [path > 0, right border]
		expect(instance.dndStartX).toBe(140);
		// this.redraw not called [path > 0, right border]
		expect(instance.redraw).not.toHaveBeenCalled();

		instance.onMouseMove({ offsetX: 140 });

		// this.redraw not called [path > 0, right border]
		expect(instance.redraw).not.toHaveBeenCalled();

		wrapper.setState({ dndPointsIndicies: '0,5' });
		instance.onMouseMove({ offsetX: 100 });

		// this.dndMoveX [going forward]
		expect(instance.dndMoveX).toBe(100);
		// this.dndStartX [going forward]
		expect(instance.dndStartX).toBe(100);
		// this.redraw called once
		expect(instance.redraw).toHaveBeenCalled();
		// this.redraw arg
		expect(instance.redraw.mock.calls[0][0]).toEqual({
			dndPointsIndicies: '2,7'
		});

		wrapper.setState({ dndPointsIndicies: '2,7' });
		instance.onMouseMove({ offsetX: 1000 });

		// this.dndMoveX [going forward, limit reached]
		expect(instance.dndMoveX).toBe(1000);
		// this.dndStartX [going forward, limit reached]
		expect(instance.dndStartX).toBe(1000);
		// this.redraw called twice
		expect(instance.redraw).toHaveBeenCalledTimes(2);
		// this.redraw arg
		expect(instance.redraw.mock.calls[1][0]).toEqual({
			dndPointsIndicies: '0,5'
		});

		wrapper.setState({ dndPointsIndicies: '0,5' });
		instance.onMouseMove({ offsetX: 0 });

		// this.dndMoveX [going forward, limit reached]
		expect(instance.dndMoveX).toBe(0);
		// this.dndStartX [going forward, limit reached]
		expect(instance.dndStartX).toBe(0);
		// this.redraw called thrice
		expect(instance.redraw).toHaveBeenCalledTimes(3);
		// this.redraw arg
		expect(instance.redraw.mock.calls[2][0]).toEqual({
			dndPointsIndicies: '4,9'
		});
	});

	it('emulateDnd()', () => {
		const wrapper = shallow(
			<Chart data={{
				ts: 1598706293,
				data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			}}
			/>
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'redraw').mockClear().mockImplementation(() => {});

		instance.pointsIndicies = '1,3';
		instance.emulateDnd(-1);

		// this.redraw called
		expect(instance.redraw).toHaveBeenCalled();
		// this.redraw arg [going back, catching toBorder]
		expect(instance.redraw.mock.calls[0][0]).toEqual({ dndPointsIndicies: '0,2' });

		instance.pointsIndicies = '6,8';
		instance.emulateDnd(1);

		// this.redraw arg [going forward, catching toBorder]
		expect(instance.redraw.mock.calls[1][0]).toEqual({ dndPointsIndicies: null });

		wrapper.setState({ dndPointsIndicies: '7,9' });
		instance.emulateDnd(-1);

		// this.redraw arg [going back]
		expect(instance.redraw.mock.calls[2][0]).toEqual({ dndPointsIndicies: '5,7' });

		wrapper.setState({ dndPointsIndicies: '4,6' });
		instance.emulateDnd(1);

		// this.redraw arg [going forward]
		expect(instance.redraw.mock.calls[3][0]).toEqual({ dndPointsIndicies: '6,8' });

		wrapper.setState({ dndPointsIndicies: '4,6' });
		instance.emulateDnd(-1, true);

		// this.redraw arg [going back, toBorder]
		expect(instance.redraw.mock.calls[4][0]).toEqual({ dndPointsIndicies: '0,2' });

		wrapper.setState({ dndPointsIndicies: '4,6' });
		instance.emulateDnd(1, true);

		// this.redraw arg [going forward, toBorder]
		expect(instance.redraw.mock.calls[5][0]).toEqual({ dndPointsIndicies: null });
	});

	it('deferredHighlightMetric()', () => {
		const wrapper = shallow(
			<Chart {...props} />
		);
		const instance = wrapper.instance();
		let setTimeoutId = 1;

		jest.spyOn(window, 'setTimeout').mockClear().mockImplementation(() => setTimeoutId++);

		instance.deferredHighlightMetric('test_metric');

		// this.highlightedMetric
		expect(instance.highlightedMetric).toBe('test_metric');
		// this.highlightMetricTimer
		expect(instance.highlightMetricTimer).toBe(1);
		// setTimeout called once
		expect(window.setTimeout).toHaveBeenCalled();
		// setTimeout 1st arg
		expect(window.setTimeout.mock.calls[0][0].name).toBe('bound highlightMetric');
		// setTimeout 2nd arg
		expect(window.setTimeout.mock.calls[0][1]).toBe(200);

		instance.deferredHighlightMetric('another_test_metric');

		// this.highlightedMetric
		expect(instance.highlightedMetric).toBe('another_test_metric');
		// this.highlightMetricTimer
		expect(instance.highlightMetricTimer).toBe(1);
		// setTimeout not called
		expect(window.setTimeout).toHaveBeenCalled();
	});

	it('highlightMetric()', () => {
		const wrapper = shallow(
			<Chart {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'redraw').mockClear().mockImplementation(() => {});

		instance.highlightMetricTimer = 2;
		instance.highlightedMetric = 'test_metric';
		wrapper.setState({ highlightedMetric: 'test_metric' });
		instance.highlightMetric();

		expect(instance.highlightMetricTimer).toBeNull();
		// this.redraw not called
		expect(instance.redraw).not.toHaveBeenCalled();

		instance.highlightedMetric = 'another_test_metric';
		instance.highlightMetric();

		// this.redraw called
		expect(instance.redraw).toHaveBeenCalled();
		// this.redraw arg
		expect(instance.redraw.mock.calls[0][0]).toEqual({
			highlightedMetric: 'another_test_metric'
		});
	});

	it('toggleMetric()', () => {
		const wrapper = shallow(
			<Chart {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'redraw').mockClear().mockImplementation(() => {});

		instance.toggleMetric('test_metric');

		// this.redraw call 1
		expect(instance.redraw).toHaveBeenCalled();
		// this.redraw call 1, arg
		expect(instance.redraw.mock.calls[0][0]).toEqual({
			disabledMetrics: ['test_metric'],
			highlightedMetric: null
		});

		wrapper.setState({ disabledMetrics: ['test_metric'] });
		instance.toggleMetric('test_metric');

		// this.redraw call 2
		expect(instance.redraw).toHaveBeenCalledTimes(2);
		// this.redraw call 2, arg
		expect(instance.redraw.mock.calls[1][0]).toEqual({
			disabledMetrics: [],
			highlightedMetric: null
		});
	});

	/* TODO something use state in Chart.tsx. Tests fails if run all tests */
	describe('redraw()', () => {
		it('no data', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598706293,
						data: []
					}}
					colors={Colors}
					labels={Labels}
				/>
			);
			const instance = wrapper.instance();
			const stateSpy = jest.spyOn(instance, 'setState').mockClear();
			const selectTWBindSpy = jest.spyOn(instance.selectTimeWindow, 'bind').mockClear();
			const selectedTimeWindow = wrapper.state('selectedTimeWindow');

			instance.redraw();

			// this.ticks
			expect(instance.ticks).toEqual([]);
			// this.points
			expect(instance.points).toEqual([]);
			// this.toRender
			expect(instance.toRender).toEqual({
				yMax: null,
				yMid: null,
				charts: [],
				areas: [],
				legend: [],
				tooltipPoints: []
			});
			// this.dndAllowed
			expect(instance.dndAllowed).toBe(false);
			// this.timeWindowControls
			expect(instance.timeWindowControls).toHaveLength(3);

			let i = 0;

			TimeWindows.forEach((tw, key) => {
				const el = instance.timeWindowControls[i];

				// [el ${ i }] type
				expect(el.type).toBe('div');
				// [el ${ i }] key attr
				expect(el.key).toBe(key);

				if (key === selectedTimeWindow) {
					// [el ${ i }] className attr
					expect(el.props.className).toBe(`${ styles.timewindow__item } ${ styles.timewindow__item_selected }`);
					// [el ${ i }] onClick attr
					expect(el.props.onClick).toBeUndefined();
				} else {
					// [el ${ i }] className attr
					expect(el.props.className).toBe(styles.timewindow__item);
					// [el ${ i }] onClick attr
					expect(el.props.onClick.name).toBe('bound selectTimeWindow');
				}

				// [el ${ i }] children attr
				expect(el.props.children).toEqual(key);

				i++;
			});

			// selectTimeWindow.bind called twice
			expect(selectTWBindSpy).toHaveBeenCalledTimes(2);
			expect(selectTWBindSpy.mock.calls[0][0]).toBeNull();
			// selectTimeWindow.bind call 1, arg 2
			expect(selectTWBindSpy.mock.calls[0][1]).toBe('1m');
			expect(selectTWBindSpy.mock.calls[1][0]).toBeNull();
			// selectTimeWindow.bind call 2, arg 2
			expect(selectTWBindSpy.mock.calls[1][1]).toBe('15m');

			// this.setState not called
			expect(stateSpy).not.toHaveBeenCalled();
		});

		it('firstPointIndex < 0', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598706293,
						data: [{ _ts: 0 }]
					}}
					colors={Colors}
					labels={Labels}
				/>
			);
			const instance = wrapper.instance();

			instance.redraw();
			// this.pointsIndicies
			expect(instance.pointsIndicies).toBe('-1,0');
		});

		it('firstPointIndex = 0, dndPointsIndicies = null', () => {
			const data = [{
				_ts: 1598706700,
				obj: {
					passed: 10,
					delayed: 1,
					rejected: 0
				}
			}, {
				_ts: 1598706800,
				obj: {
					passed: 20,
					delayed: 2,
					rejected: 1
				}
			}, {
				_ts: 1598706900,
				obj: {
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
					colors={Colors}
					labels={Labels}
				/>
			);
			const instance = wrapper.instance();
			let yMax = 0;
			const toggleMetricBindSpy = jest.spyOn(instance.toggleMetric, 'bind').mockClear();
			const deferredHighlightMetricBindSpy = jest.spyOn(instance.deferredHighlightMetric, 'bind').mockClear();

			jest.spyOn(utils, 'getYMax').mockClear().mockImplementation(() => yMax);

			wrapper.setState({ highlightedMetric: 'passed' });
			instance.redraw();

			// getYMax called once
			expect(utils.getYMax).toHaveBeenCalled();
			// getYMax 1st arg
			expect(utils.getYMax.mock.calls[0][0]).toEqual(data);
			// getYMax 2nd arg
			expect(utils.getYMax.mock.calls[0][1]).toEqual([ 'passed', 'delayed', 'rejected' ]);
			// getYMax 3rd arg
			expect(utils.getYMax.mock.calls[0][2]).toEqual([]);
			// this.points[0]._ts
			expect(instance.points[0]._ts).toBe(1598706700);
			// this.points[0].values
			expect(instance.points[0].values).toEqual({
				passed: 10,
				delayed: 1,
				rejected: 0
			});
			// this.points[0].x
			expect(instance.points[0].x).toBe(50.719520491333824);
			// this.points[1]._ts
			expect(instance.points[1]._ts).toBe(1598706800);
			// this.points[1].values
			expect(instance.points[1].values).toEqual({
				passed: 20,
				delayed: 2,
				rejected: 1
			});
			// this.points[1].x
			expect(instance.points[1].x).toBe(410.47968038473823);
			// this.points[2]._ts
			expect(instance.points[2]._ts).toBe(1598706900);
			// this.points[2].values
			expect(instance.points[2].values).toEqual({
				passed: 30,
				delayed: 3,
				rejected: 2
			});
			// this.points[2].x
			expect(instance.points[2].x).toBe(770.2398402781427);
			// this.toRender.charts[0] type
			expect(instance.toRender.charts[0].type).toBe('path');
			// this.toRender.charts[0] key
			expect(instance.toRender.charts[0].key).toBe('chart_rejected');
			// this.toRender.charts[0] className
			expect(instance.toRender.charts[0].props.className).toBe(`${ styles.line } ${ styles.faded }`);
			// this.toRender.charts[0] style
			expect(instance.toRender.charts[0].props.style).toEqual({ stroke: '#FF2323' });
			// this.toRender.charts[0] d
			expect(instance.toRender.charts[0].props.d).toBe(
				'M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220'
			);
			// this.toRender.charts[1] type
			expect(instance.toRender.charts[1].type).toBe('path');
			// this.toRender.charts[1] key
			expect(instance.toRender.charts[1].key).toBe('chart_delayed');
			// this.toRender.charts[1] className
			expect(instance.toRender.charts[1].props.className).toBe(`${ styles.line } ${ styles.faded }`);
			// this.toRender.charts[1] style
			expect(instance.toRender.charts[1].props.style).toEqual({ stroke: '#EBC906' });
			// this.toRender.charts[1] d
			expect(instance.toRender.charts[1].props.d).toBe(
				'M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220'
			);
			// this.toRender.charts[2] type
			expect(instance.toRender.charts[2].type).toBe('path');
			// this.toRender.charts[2] key
			expect(instance.toRender.charts[2].key).toBe('chart_passed');
			// this.toRender.charts[2] className
			expect(instance.toRender.charts[2].props.className).toBe(styles.line);
			// this.toRender.charts[2] style
			expect(instance.toRender.charts[2].props.style).toEqual({ stroke: '#4FA932' });
			// this.toRender.charts[2] d
			expect(instance.toRender.charts[2].props.d).toBe(
				'M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220'
			);

			// this.toRender.areas[0] type
			expect(instance.toRender.areas[0].type).toBe('path');
			// this.toRender.areas[0] key
			expect(instance.toRender.areas[0].key).toBe('chart-area_rejected');
			// this.toRender.areas[0] className
			expect(instance.toRender.areas[0].props.className).toBe(`${ styles.area } ${ styles.faded }`);
			// this.toRender.areas[0] style
			expect(instance.toRender.areas[0].props.style).toEqual({ fill: '#FF2323' });
			// this.toRender.areas[0] d
			expect(instance.toRender.areas[0].props.d).toBe(
				'M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220 V 220 H 50.719520491333824 V 220'
			);
			// this.toRender.areas[1] type
			expect(instance.toRender.areas[1].type).toBe('path');
			// this.toRender.areas[1] key
			expect(instance.toRender.areas[1].key).toBe('chart-area_delayed');
			// this.toRender.areas[1] className
			expect(instance.toRender.areas[1].props.className).toBe(`${ styles.area } ${ styles.faded }`);
			// this.toRender.areas[1] style
			expect(instance.toRender.areas[1].props.style).toEqual({ fill: '#EBC906' });
			// this.toRender.areas[1] d
			expect(instance.toRender.areas[1].props.d).toBe(
				'M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220 V 220L 770.2398402781427 220 L 410.47968038473823 220 L 50.719520491333824 220  V 220'
			);
			// this.toRender.areas[2] type
			expect(instance.toRender.areas[2].type).toBe('path');
			// this.toRender.areas[2] key
			expect(instance.toRender.areas[2].key).toBe('chart-area_passed');
			// this.toRender.areas[2] className
			expect(instance.toRender.areas[2].props.className).toBe(styles.area);
			// this.toRender.areas[2] style
			expect(instance.toRender.areas[2].props.style).toEqual({ fill: '#4FA932' });
			// this.toRender.areas[2] d
			expect(instance.toRender.areas[2].props.d).toBe(
				'M 50.719520491333824 220 L 410.47968038473823 220 L 770.2398402781427 220 V 220L 770.2398402781427 220 L 410.47968038473823 220 L 50.719520491333824 220  V 220'
			);

			// this.toRender.legend[0] type
			expect(instance.toRender.legend[0].type).toBe('span');
			// this.toRender.legend[0] key
			expect(instance.toRender.legend[0].key).toBe('legend_passed');
			// this.toRender.legend[0] className
			expect(instance.toRender.legend[0].props.className).toBe(styles.legend__item);
			// this.toRender.legend[0] onClick
			expect(instance.toRender.legend[0].props.onClick.name).toBe('bound toggleMetric');
			// this.toRender.legend[0] onMouseLeave
			expect(instance.toRender.legend[0].props.onMouseLeave.name).toBe('bound deferredHighlightMetric');
			// this.toRender.legend[0] onMouseOver
			expect(instance.toRender.legend[0].props.onMouseOver.name).toBe('bound deferredHighlightMetric');
			// this.toRender.legend[0] children 1 type
			expect(instance.toRender.legend[0].props.children[0].type).toBe('span');
			// this.toRender.legend[0] children 1 className
			expect(instance.toRender.legend[0].props.children[0].props.className).toBe(styles.legend__color);
			// this.toRender.legend[0] children 1 style
			expect(instance.toRender.legend[0].props.children[0].props.style).toEqual({
				background: '#4FA932'
			});
			// this.toRender.legend[0] children 2
			expect(instance.toRender.legend[0].props.children[1]).toBe('Passed');
			// this.toRender.legend[1] type
			expect(instance.toRender.legend[1].type).toBe('span');
			// this.toRender.legend[1] key
			expect(instance.toRender.legend[1].key).toBe('legend_delayed');
			// this.toRender.legend[1] className
			expect(instance.toRender.legend[1].props.className).toBe(styles.legend__item);
			// this.toRender.legend[1] onClick
			expect(instance.toRender.legend[1].props.onClick.name).toBe('bound toggleMetric');
			// this.toRender.legend[1] onMouseLeave
			expect(instance.toRender.legend[1].props.onMouseLeave.name).toBe('bound deferredHighlightMetric');
			// this.toRender.legend[1] onMouseOver
			expect(instance.toRender.legend[1].props.onMouseOver.name).toBe('bound deferredHighlightMetric');
			// this.toRender.legend[1] children 1 type
			expect(instance.toRender.legend[1].props.children[0].type).toBe('span');
			// this.toRender.legend[1] children 1 className
			expect(instance.toRender.legend[1].props.children[0].props.className).toBe(styles.legend__color);
			// this.toRender.legend[1] children 1 style
			expect(instance.toRender.legend[1].props.children[0].props.style).toEqual({
				background: '#EBC906'
			});
			// this.toRender.legend[1] children 2
			expect(instance.toRender.legend[1].props.children[1]).toBe('Delayed');
			// this.toRender.legend[2] type
			expect(instance.toRender.legend[2].type).toBe('span');
			// this.toRender.legend[2] key
			expect(instance.toRender.legend[2].key).toBe('legend_rejected');
			// this.toRender.legend[2] className
			expect(instance.toRender.legend[2].props.className).toBe(styles.legend__item);
			// this.toRender.legend[2] onClick
			expect(instance.toRender.legend[2].props.onClick.name).toBe('bound toggleMetric');
			// this.toRender.legend[2] onMouseLeave
			expect(instance.toRender.legend[2].props.onMouseLeave.name).toBe('bound deferredHighlightMetric');
			// this.toRender.legend[2] onMouseOver
			expect(instance.toRender.legend[2].props.onMouseOver.name).toBe('bound deferredHighlightMetric');
			// this.toRender.legend[2] children 1 type
			expect(instance.toRender.legend[2].props.children[0].type).toBe('span');
			// this.toRender.legend[2] children 1 className
			expect(instance.toRender.legend[2].props.children[0].props.className).toBe(styles.legend__color);
			// this.toRender.legend[2] children 1 style
			expect(instance.toRender.legend[2].props.children[0].props.style).toEqual({
				background: '#FF2323'
			});
			// this.toRender.legend[1] children 2
			expect(instance.toRender.legend[2].props.children[1]).toBe('Rejected');

			// this.toggleMetric.bind called thrice
			expect(toggleMetricBindSpy).toHaveBeenCalledTimes(3);
			// this.toggleMetric.bind call 1, arg 1
			expect(toggleMetricBindSpy.mock.calls[0][0]).toEqual(instance);
			// this.toggleMetric.bind call 1, arg 2
			expect(toggleMetricBindSpy.mock.calls[0][1]).toBe('passed');
			// this.toggleMetric.bind call 2, arg 1
			expect(toggleMetricBindSpy.mock.calls[1][0]).toEqual(instance);
			// this.toggleMetric.bind call 2, arg 2
			expect(toggleMetricBindSpy.mock.calls[1][1]).toBe('delayed');
			// this.toggleMetric.bind call 3, arg 1
			expect(toggleMetricBindSpy.mock.calls[2][0]).toEqual(instance);
			// this.toggleMetric.bind call 4, arg 2
			expect(toggleMetricBindSpy.mock.calls[2][1]).toBe('rejected');

			expect(deferredHighlightMetricBindSpy).toHaveBeenCalledTimes(6);
			// this.deferredHighlightMetric.bind call 1, arg 1
			expect(deferredHighlightMetricBindSpy.mock.calls[0][0]).toEqual(instance);
			// this.deferredHighlightMetric.bind call 1, arg 2
			expect(deferredHighlightMetricBindSpy.mock.calls[0][1]).toBe('passed');
			// this.deferredHighlightMetric.bind call 2, arg 1
			expect(deferredHighlightMetricBindSpy.mock.calls[1][0]).toEqual(instance);
			expect(deferredHighlightMetricBindSpy.mock.calls[1][1]).toBeNull();
			// this.deferredHighlightMetric.bind call 3, arg 1
			expect(deferredHighlightMetricBindSpy.mock.calls[2][0]).toEqual(instance);
			// this.deferredHighlightMetric.bind call 3, arg 2
			expect(deferredHighlightMetricBindSpy.mock.calls[2][1]).toBe('delayed');
			// this.deferredHighlightMetric.bind call 4, arg 1
			expect(deferredHighlightMetricBindSpy.mock.calls[3][0]).toEqual(instance);
			expect(deferredHighlightMetricBindSpy.mock.calls[3][1]).toBeNull();
			// this.deferredHighlightMetric.bind call 5, arg 1
			expect(deferredHighlightMetricBindSpy.mock.calls[4][0]).toEqual(instance);
			// this.deferredHighlightMetric.bind call 5, arg 2
			expect(deferredHighlightMetricBindSpy.mock.calls[4][1]).toBe('rejected');
			// this.deferredHighlightMetric.bind call 6, arg 1
			expect(deferredHighlightMetricBindSpy.mock.calls[5][0]).toEqual(instance);
			expect(deferredHighlightMetricBindSpy.mock.calls[5][1]).toBeNull();

			// this.ticks length
			expect(instance.ticks).toHaveLength(5);
			// this.ticks[0] x
			expect(instance.ticks[0].x).toBe(122.6715524700147);
			// this.ticks[0] y
			expect(instance.ticks[0].y).toBe(238);
			// this.ticks[1] x
			expect(instance.ticks[1].x).toBe(338.5276484060574);
			// this.ticks[1] y
			expect(instance.ticks[1].y).toBe(238);
			// this.ticks[2] x
			expect(instance.ticks[2].x).toBe(554.3837443421);
			// this.ticks[2] y
			expect(instance.ticks[2].y).toBe(238);
			// this.ticks[3] x
			expect(instance.ticks[3].x).toBe(770.2398402781427);
			// this.ticks[3] y
			expect(instance.ticks[3].y).toBe(238);
			// this.ticks[4] x
			expect(instance.ticks[4].x).toBe(986.0959362141853);
			// this.ticks[4] y
			expect(instance.ticks[4].y).toBe(238);

			// this.pointsIndicies
			expect(instance.pointsIndicies).toBe('0,2');

			wrapper.setState({ dndPointsIndicies: '0,2' });

			([30, 29]).forEach(y => {
				yMax = y;
				instance.redraw();

				// this.toRender.yMax[0] type
				expect(instance.toRender.yMax[0].type).toBe('text');
				// this.toRender.yMax[0] key
				expect(instance.toRender.yMax[0].key).toBe('y-max-label');
				// this.toRender.yMax[0] className
				expect(instance.toRender.yMax[0].props.className).toBe(styles['y-label']);
				// this.toRender.yMax[0] x
				expect(instance.toRender.yMax[0].props.x).toBe(45);
				// this.toRender.yMax[0] y
				expect(instance.toRender.yMax[0].props.y).toBe(70);
				// this.toRender.yMax[0] children
				expect(instance.toRender.yMax[0].props.children).toBe(30);
				// this.toRender.yMax[1] type
				expect(instance.toRender.yMax[1].type).toBe('line');
				// this.toRender.yMax[1] key
				expect(instance.toRender.yMax[1].key).toBe('y-max-line');
				// this.toRender.yMax[1] className
				expect(instance.toRender.yMax[1].props.className).toBe(styles['x-line']);
				// this.toRender.yMax[1] x1
				expect(instance.toRender.yMax[1].props.x1).toBe(50);
				// this.toRender.yMax[1] x2
				expect(instance.toRender.yMax[1].props.x2).toBe(1130);
				// this.toRender.yMax[1] y1
				expect(instance.toRender.yMax[1].props.y1).toBe(70);
				// this.toRender.yMax[1] y2
				expect(instance.toRender.yMax[1].props.y2).toBe(70);

				// this.toRender.yMid[0] type
				expect(instance.toRender.yMid[0].type).toBe('text');
				// this.toRender.yMid[0] key
				expect(instance.toRender.yMid[0].key).toBe('y-mid-label');
				// this.toRender.yMid[0] className
				expect(instance.toRender.yMid[0].props.className).toBe(styles['y-label']);
				// this.toRender.yMid[0] x
				expect(instance.toRender.yMid[0].props.x).toBe(45);
				// this.toRender.yMid[0] y
				expect(instance.toRender.yMid[0].props.y).toBe(145);
				// this.toRender.yMid[0] children
				expect(instance.toRender.yMid[0].props.children).toBe(15);
				// this.toRender.yMid[1] type
				expect(instance.toRender.yMid[1].type).toBe('line');
				// this.toRender.yMid[1] key
				expect(instance.toRender.yMid[1].key).toBe('y-mid-line');
				// this.toRender.yMid[1] className
				expect(instance.toRender.yMid[1].props.className).toBe(styles['x-line']);
				// this.toRender.yMid[1] x1
				expect(instance.toRender.yMid[1].props.x1).toBe(50);
				// this.toRender.yMid[1] x2
				expect(instance.toRender.yMid[1].props.x2).toBe(1130);
				// this.toRender.yMid[1] y1
				expect(instance.toRender.yMid[1].props.y1).toBe(145);
				// this.toRender.yMid[1] y2
				expect(instance.toRender.yMid[1].props.y2).toBe(145);

				// this.toRender.charts[0] key
				expect(instance.toRender.charts[0].key).toBe('chart_rejected');
				// this.toRender.charts[0] d
				expect(instance.toRender.charts[0].props.d).toBe('M 50 220 L 1130 215');
				// this.toRender.charts[1] key
				expect(instance.toRender.charts[1].key).toBe('chart_delayed');
				// this.toRender.charts[1] d
				expect(instance.toRender.charts[1].props.d).toBe('M 50 215 L 1130 205');
				// this.toRender.charts[2] key
				expect(instance.toRender.charts[2].key).toBe('chart_passed');
				// this.toRender.charts[2] d
				expect(instance.toRender.charts[2].props.d).toBe('M 50 165 L 1130 105');

				// this.toRender.areas[0] key
				expect(instance.toRender.areas[0].key).toBe('chart-area_rejected');
				// this.toRender.areas[0] d
				expect(instance.toRender.areas[0].props.d).toBe('M 50 220 L 1130 215 V 220 H 50 V 220');
				// this.toRender.areas[1] key
				expect(instance.toRender.areas[1].key).toBe('chart-area_delayed');
				// this.toRender.areas[1] d
				expect(instance.toRender.areas[1].props.d).toBe('M 50 215 L 1130 205 V 215L 1130 215 L 50 220  V 220');
				// this.toRender.areas[2] key
				expect(instance.toRender.areas[2].key).toBe('chart-area_passed');
				// this.toRender.areas[2] d
				expect(instance.toRender.areas[2].props.d).toBe('M 50 165 L 1130 105 V 205L 1130 205 L 50 215  V 215');
			});

			wrapper.setState({ selectedTimeWindow: '15m' });
			instance.redraw();

			// this.ticks length
			expect(instance.ticks).toHaveLength(1);
			// this.ticks[0] x
			expect(instance.ticks[0].x).toBe(266);
			// this.ticks[0] y
			expect(instance.ticks[0].y).toBe(238);

			wrapper.setProps({
				data: {
					ts: 1598707000,
					data: data.concat([{
						_ts: 1598707000,
						obj: {
							passed: 100,
							delayed: 0,
							rejected: 0
						}
					}])
				},
				colors: Colors,
				labels: Labels
			});
			wrapper.setState({ selectedTimeWindow: '1m' });
			instance.redraw();

			// this.ticks length
			expect(instance.ticks).toHaveLength(11);
			// this.ticks[0] x
			expect(instance.ticks[0].x).toBe(50);
			// this.ticks[0] y
			expect(instance.ticks[0].y).toBe(238);
			// this.ticks[1] x
			expect(instance.ticks[1].x).toBe(158);
			// this.ticks[1] y
			expect(instance.ticks[1].y).toBe(238);
			// this.ticks[2] x
			expect(instance.ticks[2].x).toBe(266);
			// this.ticks[2] y
			expect(instance.ticks[2].y).toBe(238);
			// this.ticks[3] x
			expect(instance.ticks[3].x).toBe(374);
			// this.ticks[3] y
			expect(instance.ticks[3].y).toBe(238);
			// this.ticks[4] x
			expect(instance.ticks[4].x).toBe(482);
			// this.ticks[4] y
			expect(instance.ticks[4].y).toBe(238);
			// this.ticks[5] x
			expect(instance.ticks[5].x).toBe(590);
			// this.ticks[5] y
			expect(instance.ticks[5].y).toBe(238);
			// this.ticks[6] x
			expect(instance.ticks[6].x).toBe(698);
			// this.ticks[6] y
			expect(instance.ticks[6].y).toBe(238);
			// this.ticks[7] x
			expect(instance.ticks[7].x).toBe(806);
			// this.ticks[7] y
			expect(instance.ticks[7].y).toBe(238);
			// this.ticks[8] x
			expect(instance.ticks[8].x).toBe(914);
			// this.ticks[8] y
			expect(instance.ticks[8].y).toBe(238);
			// this.ticks[9] x
			expect(instance.ticks[9].x).toBe(1022.0000000000001);
			// this.ticks[9] y
			expect(instance.ticks[9].y).toBe(238);
			// this.ticks[10] x
			expect(instance.ticks[10].x).toBe(1130);
			// this.ticks[10] y
			expect(instance.ticks[10].y).toBe(238);

			toggleMetricBindSpy.mockRestore();
			deferredHighlightMetricBindSpy.mockRestore();
			utils.getYMax.mockRestore();
		});

		it('firstPointIndex > 0', () => {
			const data = [{
				_ts: 1598700000,
				obj: {
					passed: 1,
					delayed: 0,
					rejected: 1
				}
			}, {
				_ts: 1598706700,
				obj: {
					passed: 10,
					delayed: 1,
					rejected: 0
				}
			}, {
				_ts: 1598706800,
				obj: {
					passed: 20,
					delayed: 2,
					rejected: 1
				}
			}, {
				_ts: 1598706900,
				obj: {
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
					colors={Colors}
					labels={Labels}
				/>
			);
			const instance = wrapper.instance();
			let updatingPeriod;

			jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => updatingPeriod);

			([0, 1000]).forEach(ts => {
				updatingPeriod = ts;
				instance.redraw();

				// [ts = ${ ts }] this.points[0]._ts
				expect(instance.points[0]._ts).toBe(1598706700);
				// [ts = ${ ts }] this.points[0].x
				expect(instance.points[0].x).toBe(50);
				// [ts = ${ ts }] this.points[1]._ts
				expect(instance.points[1]._ts).toBe(1598706800);
				// [ts = ${ ts }] this.points[1].x
				expect(instance.points[1].x).toBe(410);
				// [ts = ${ ts }] this.points[2]._ts
				expect(instance.points[2]._ts).toBe(1598706900);
				// [ts = ${ ts }] this.points[2].x
				expect(instance.points[2].x).toBe(770);
			});

			appsettings.getSetting.mockRestore();
		});

		it('with disabled metric', () => {
			const data = [{
				_ts: 1598706700,
				obj: {
					passed: 10,
					delayed: 1,
					test: 0,
					rejected: 0
				}
			}, {
				_ts: 1598706800,
				obj: {
					passed: 20,
					delayed: 2,
					test: 0,
					rejected: 1
				}
			}, {
				_ts: 1598706900,
				obj: {
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
					colors={new Map([
						['passed', '#4FA932'],
						['delayed', '#EBC906'],
						['rejected', '#FF2323'],
						['test', '#ffffff']
					])}
					labels={Labels}
				/>
			);
			const instance = wrapper.instance();
			const getYMaxSpy = jest.spyOn(utils, 'getYMax').mockClear();
			const deferredHighlightMetricBindSpy = jest.spyOn(instance.deferredHighlightMetric, 'bind').mockClear();

			wrapper.setState({ disabledMetrics: ['passed'] });
			instance.redraw();

			// getYMax called once
			expect(getYMaxSpy).toHaveBeenCalled();
			// getYMax 3rd arg
			expect(getYMaxSpy.mock.calls[0][2]).toEqual(['passed']);
			// this.points[0].values
			expect(instance.points[0].values).toEqual({
				delayed: 1,
				test: 0,
				rejected: 0
			});
			// this.points[1].values
			expect(instance.points[1].values).toEqual({
				delayed: 2,
				test: 0,
				rejected: 1
			});
			// this.points[2].values
			expect(instance.points[2].values).toEqual({
				delayed: 3,
				test: 0,
				rejected: 2
			});
			// this.toRender.charts
			expect(instance.toRender.charts.findIndex(chart => chart.key === 'chart_passed')).toBe(-1);
			// this.toRender.areas
			expect(
				instance.toRender.areas.findIndex(area => area.key === 'chart-area_passed')
			).toBe(-1);
			expect(deferredHighlightMetricBindSpy).toHaveBeenCalledTimes(6);

			const disabledLegendItem = instance.toRender.legend.find(
				legend => legend.key === 'legend_passed'
			);

			// legend disabled className
			expect(disabledLegendItem.props.className).toBe(`${ styles.legend__item } ${ styles.legend__item_disabled }`);
			// legend disabled onMouseOver
			expect(disabledLegendItem.props.onMouseOver).toBeUndefined();
			// legend disabled onMouseLeave
			expect(disabledLegendItem.props.onMouseLeave).toBeUndefined();

			wrapper.setState({ disabledMetrics: ['rejected'] });
			instance.redraw();

			deferredHighlightMetricBindSpy.mockRestore();
			getYMaxSpy.mockRestore();
		});

		it('dndControls', () => {
			const data = [{
				_ts: 1598706700,
				obj: {
					passed: 10,
					delayed: 1,
					rejected: 0
				}
			}, {
				_ts: 1598706800,
				obj: {
					passed: 20,
					delayed: 2,
					rejected: 1
				}
			}, {
				_ts: 1598706900,
				obj: {
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
					colors={Colors}
					labels={Labels}
				/>
			);
			const instance = wrapper.instance();
			const emulateDndBindSpy = jest.spyOn(instance.emulateDnd, 'bind').mockClear();

			instance.redraw();

			instance.dndControls.forEach((el, i) => {
				// [no data, el ${ i }] nodeName
				expect(el.type).toBe('div');
				// [no data, el ${ i }] key attr
				expect(el.key).toBe(i);
				// [no data, el ${ i }] className attr
				expect(el.props.className).toBe(
					`${ styles['dnd-controls__control'] } ${ styles['dnd-controls__control_disabled'] }`
				);
				// [no data, el ${ i }] onClick attr
				expect(el.props.onClick).toBeUndefined();
			});

			// emulateDnd.bind not called
			expect(emulateDndBindSpy).not.toHaveBeenCalled();
			emulateDndBindSpy.mockClear();

			wrapper.setProps({ data: { ts: 1598707000, data } });
			instance.redraw();

			instance.dndControls.forEach((el, i) => {
				// [data, el ${ i }] nodeName
				expect(el.type).toBe('div');
				// [data, el ${ i }] key attr
				expect(el.key).toBe(i);
				// [data, el ${ i }] className attr
				expect(el.props.className).toBe(
					`${ styles['dnd-controls__control'] } ${ styles['dnd-controls__control_disabled'] }`
				);
				// [data, el ${ i }] onClick attr
				expect(el.props.onClick).toBeUndefined();
			});

			// emulateDnd.bind not called
			expect(emulateDndBindSpy).not.toHaveBeenCalled();
			emulateDndBindSpy.mockClear();

			data.unshift({
				_ts: 1598700000,
				obj: {
					passed: 1,
					delayed: 0,
					rejected: 1
				}
			});
			data.push({
				_ts: 1598707300,
				obj: {
					passed: 100,
					delayed: 10,
					rejected: 9
				}
			});
			wrapper.setProps({ data: { ts: 1598707000, data } });
			wrapper.setState({ dndPointsIndicies: '1,3' });
			instance.redraw();

			instance.dndControls.forEach((el, i) => {
				// [many points, el ${ i }] nodeName
				expect(el.type).toBe('div');
				// [many points, el ${ i }] key attr
				expect(el.key).toBe(i);
				// [many points, el ${ i }] className attr
				expect(el.props.className).toBe(styles['dnd-controls__control']);
				// [many points, el ${ i }] onClick attr
				expect(el.props.onClick.name).toBe('bound emulateDnd');
			});

			expect(emulateDndBindSpy).toHaveBeenCalledTimes(4);
			// [many points] emulateDnd.bind call 1, arg 1
			expect(emulateDndBindSpy.mock.calls[0][0]).toEqual(instance);
			// [many points] emulateDnd.bind call 1, arg 2
			expect(emulateDndBindSpy.mock.calls[0][1]).toBe(-1);
			// [many points] emulateDnd.bind call 1, arg 3
			expect(emulateDndBindSpy.mock.calls[0][2]).toBe(true);
			// [many points] emulateDnd.bind call 2, arg 1
			expect(emulateDndBindSpy.mock.calls[1][0]).toEqual(instance);
			// [many points] emulateDnd.bind call 2, arg 2
			expect(emulateDndBindSpy.mock.calls[1][1]).toBe(-1);
			// [many points] emulateDnd.bind call 2, arg 3
			expect(emulateDndBindSpy.mock.calls[1][2]).toBe(false);
			// [many points] emulateDnd.bind call 3, arg 1
			expect(emulateDndBindSpy.mock.calls[2][0]).toEqual(instance);
			// [many points] emulateDnd.bind call 3, arg 2
			expect(emulateDndBindSpy.mock.calls[2][1]).toBe(1);
			// [many points] emulateDnd.bind call 3, arg 3
			expect(emulateDndBindSpy.mock.calls[2][2]).toBe(false);
			// [many points] emulateDnd.bind call 4, arg 1
			expect(emulateDndBindSpy.mock.calls[3][0]).toEqual(instance);
			// [many points] emulateDnd.bind call 4, arg 2
			expect(emulateDndBindSpy.mock.calls[3][1]).toBe(1);
			// [many points] emulateDnd.bind call 4, arg 3
			expect(emulateDndBindSpy.mock.calls[3][2]).toBe(true);

			emulateDndBindSpy.mockRestore();
		});

		it('handle the passed state', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data: [{
							_ts: 1598700000,
							obj: {
								passed: 1,
								delayed: 0,
								rejected: 1
							}
						}, {
							_ts: 1598706700,
							obj: {
								passed: 10,
								delayed: 1,
								rejected: 0
							}
						}, {
							_ts: 1598706800,
							obj: {
								passed: 20,
								delayed: 2,
								rejected: 1
							}
						}, {
							_ts: 1598706900,
							obj: {
								passed: 30,
								delayed: 3,
								rejected: 2
							}
						}, {
							_ts: 1598707300,
							obj: {
								passed: 100,
								delayed: 10,
								rejected: 9
							}
						}]
					}}
					colors={Colors}
					labels={Labels}
				/>
			);
			const instance = wrapper.instance();
			const state = {
				disabledMetrics: ['passed'],
				highlightedMetric: ['delayed']
			};
			const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

			instance.redraw(state);
			wrapper.update();

			// legend disabled className
			expect(instance.toRender.legend.find(
				legend => legend.key === 'legend_passed'
			).props.className).toBe(`${ styles.legend__item } ${ styles.legend__item_disabled }`);
			// chart faded className
			expect(instance.toRender.charts.find(
				chart => chart.key === 'chart_rejected'
			).props.className).toBe(`${ styles.line } ${ styles.faded }`);
			// this.points length
			expect(instance.points).toHaveLength(4);
			// [timeWindow 5m] this.points[0].x
			expect(instance.points[0].x).toBe(50);
			// [timeWindow 5m] this.points[1].x
			expect(instance.points[1].x).toBe(410);
			// [timeWindow 5m] this.points[2].x
			expect(instance.points[2].x).toBe(770);
			// [timeWindow 5m] this.points[3].x
			expect(instance.points[3].x).toBe(2210);

			// this.setState called once
			expect(setStateSpy).toHaveBeenCalled();
			// this.setState arg
			expect(setStateSpy.mock.calls[0][0]).toEqual(state);

			instance.redraw({ selectedTimeWindow: '15m' });
			wrapper.update();

			// this.points length
			expect(instance.points).toHaveLength(4);
			// [timeWindow 15m] this.points[0].x
			expect(instance.points[0].x).toBe(770.0799822833796);
			// [timeWindow 15m] this.points[1].x
			expect(instance.points[1].x).toBe(890.0533215413224);
			// [timeWindow 15m] this.points[2].x
			expect(instance.points[2].x).toBe(1010.026660799265);
			// [timeWindow 15m] this.points[3].x
			expect(instance.points[3].x).toBe(1489.9200178310357);

			instance.redraw({ timeEnd: 1598706700 });
			wrapper.update();

			// this.points length
			expect(instance.points).toHaveLength(4);
			// [timeWindow 15m] this.points[0].x
			expect(instance.points[0].x).toBe(1130.0000000572077);
			// [timeWindow 15m] this.points[1].x
			expect(instance.points[1].x).toBe(1249.9733393151503);
			// [timeWindow 15m] this.points[2].x
			expect(instance.points[2].x).toBe(1369.946678573093);
			// [timeWindow 15m] this.points[3].x
			expect(instance.points[3].x).toBe(1849.8400356048637);

			instance.redraw({ dndPointsIndicies: '1,3' });
			wrapper.update();

			// this.points length
			expect(instance.points).toHaveLength(2);

			setStateSpy.mockRestore();
		});

		it('handle the passed props', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data: []
					}}
					colors={Colors}
					labels={Labels}
				/>
			);
			const instance = wrapper.instance();
			const nextProps = {
				data: {
					ts: 1598707000,
					data: [{
						_ts: 1598706700,
						obj: {
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

			// chart color
			expect(instance.toRender.charts[0].props.style.stroke).toBe(nextProps.colors.get('passed'));
			// legend title
			expect(instance.toRender.legend[0].props.children[1]).toBe(nextProps.labels.get('passed'));
			// this.points length
			expect(instance.points).toHaveLength(1);

			nextProps.labels = new Map();
			instance.redraw({}, nextProps);

			// legend title
			expect(instance.toRender.legend[0].props.children[1]).toBe('passed');
		});
	});

	it('selectTimeWindow()', () => {
		const wrapper = shallow(
			<Chart
				data={{
					ts: 1598707000,
					data: []
				}}
				colors={Colors}
				labels={Labels}
			/>
		);
		const instance = wrapper.instance();

		jest.spyOn(appsettings, 'setSetting').mockClear().mockImplementation(() => {});

		instance.selectTimeWindow('test');

		// setSetting called
		expect(appsettings.setSetting).toHaveBeenCalled();
		// setSetting 1st arg
		expect(appsettings.setSetting.mock.calls[0][0]).toBe('timeWindow');
		// setSetting 2nd arg
		expect(appsettings.setSetting.mock.calls[0][1]).toBe('test');
	});

	describe('render()', () => {
		it('no mouseOffsetX, no dnd, no active point', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data: []
					}}
					colors={Colors}
					labels={Labels}
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

			const container = wrapper.find(`.${ styles.container }`);
			const dndControls = container.find(`.${ styles['dnd-controls'] }`);
			const timeWindow = container.find(`.${ styles.timewindow }`);

			// container
			expect(container).toHaveLength(1);
			// dnd-controls inner
			expect(dndControls.text()).toBe('dndControls__test');
			// timewindow inner
			expect(timeWindow.text()).toBe('timeWindowControls__test');

			const mouseTracker = container.find(`.${ styles['mouse-tracker'] }`);

			// mouse-tracker className
			expect(mouseTracker.prop('className')).toBe(styles['mouse-tracker']);
			// mouse-tracker style
			expect(mouseTracker.prop('style')).toEqual({
				height: '150px',
				left: '50px',
				top: '70px',
				width: '1080px'
			});
			// mouse-tracker onMouseMove
			expect(mouseTracker.prop('onMouseMove').name).toBe('bound onMouseMove');
			// mouse-tracker onMouseLeave
			expect(mouseTracker.prop('onMouseLeave').name).toBe('bound onMouseLeave');
			// mouse-tracker onMouseDown
			expect(mouseTracker.prop('onMouseDown')).toBeUndefined();
			// mouse-tracker onMouseUp
			expect(mouseTracker.prop('onMouseUp')).toBeUndefined();

			const svg = container.find(`svg.${ styles.svg }`);
			const ticksLines = svg.find(`path.${ styles['x-axis'] }`);
			const yLabel = svg.find(`text.${ styles['y-label'] }`);
			const xAxis = svg.find(`line.${ styles['x-axis'] }`);
			const cursorLine = svg.find(`line.${ styles['cursor-line'] }`);
			const ticksLabels = svg.find(`text.${ styles['x-label'] }`);

			// svg width
			expect(svg.prop('width')).toBe('1150');
			// svg height
			expect(svg.prop('height')).toBe('250');
			// ticks lines d
			expect(ticksLines.prop('d')).toBe('M 10 220 V 226 M 11 220 V 226');
			// y-label x
			expect(yLabel.prop('x')).toBe(45);
			// y-label y
			expect(yLabel.prop('y')).toBe(220);
			// x-axis x1
			expect(xAxis.prop('x1')).toBe(50);
			// x-axis x2
			expect(xAxis.prop('x2')).toBe(1130);
			// x-axis y1
			expect(xAxis.prop('y1')).toBe(220);
			// x-axis y2
			expect(xAxis.prop('y2')).toBe(220);
			// cursor-line y1
			expect(cursorLine.prop('y1')).toBe(60);
			// cursor-line y2
			expect(cursorLine.prop('y2')).toBe(226);
			// cursor-line y2
			expect(cursorLine.prop('transform')).toBeUndefined();
			// cursor-line y2
			expect(cursorLine.prop('style')).toEqual({
				opacity: 0
			});
			// this.ticks[0] className
			expect(ticksLabels.at(0).prop('className')).toBe(styles['x-label']);
			// this.ticks[0] x
			expect(ticksLabels.at(0).prop('x')).toBe(10);
			// this.ticks[0] y
			expect(ticksLabels.at(0).prop('y')).toBe(20);
			// this.ticks[0] text
			expect(ticksLabels.at(0).text()).toBe('tick 1');
			// this.ticks[1] className
			expect(ticksLabels.at(1).prop('className')).toBe(styles['x-label']);
			// this.ticks[1] x
			expect(ticksLabels.at(1).prop('x')).toBe(11);
			// this.ticks[1] y
			expect(ticksLabels.at(1).prop('y')).toBe(22);
			// this.ticks[1] text
			expect(ticksLabels.at(1).text()).toBe('tick 2');
			// this.toRender.yMax
			expect(svg.childAt(6).text()).toBe('toRender_yMax__test');
			// this.toRender.yMid
			expect(svg.childAt(7).text()).toBe('toRender_yMid__test');
			// this.toRender.charts
			expect(svg.childAt(8).text()).toBe('toRender_charts__test');
			// this.toRender.areas
			expect(svg.childAt(9).text()).toBe('toRender_areas__test');
			// this.toRender.legend
			expect(container.find(`div.${ styles.legend }`).text()).toBe('legend__test');
		});

		it('mouseOffsetX, dndIsInProgress, dndAllowed', () => {
			const wrapper = shallow(
				<Chart
					data={{
						ts: 1598707000,
						data: []
					}}
					colors={Colors}
					labels={Labels}
				/>
			);
			const instance = wrapper.instance();

			instance.points = [
				{ x: 10, values: { passed: 45 } },
				{ x: 900, values: { passed: 51 } }
			];
			wrapper.setState({ mouseOffsetX: 10 });

			const tooltipPoints = wrapper.instance().toRender.tooltipPoints[0];

			// tooltip points key
			expect(tooltipPoints.key).toBe('tooltip_passed');
			// tooltip points className
			expect(tooltipPoints.props.className).toBe(styles.tooltip__point);
			// tooltip points child 1, className
			expect(tooltipPoints.props.children[0].props.className).toBe(styles.tooltip__value);
			// tooltip points child 1, style
			expect(tooltipPoints.props.children[0].props.style).toEqual({ color: '#4FA932' });
			// tooltip points child 1, text
			expect(tooltipPoints.props.children[0].props.children).toBe(45);
			// tooltip points child 2, className
			expect(tooltipPoints.props.children[1].props.className).toBe(styles.tooltip__metric);
			// tooltip points child 2, text
			expect(tooltipPoints.props.children[1].props.children).toBe('Passed');

			const tooltip = wrapper.find(`div.${ styles.tooltip }`);

			// tooltip style
			expect(tooltip.prop('style')).toEqual({ left: '18px' });
			// tooltip points
			expect(tooltip.find(`div.${ styles.tooltip__point }`)).toHaveLength(1);
			// tooltip time
			expect(tooltip.find(`div.${ styles.tooltip__time }`)).toHaveLength(1);

			// cursor-line transform
			expect(wrapper.find(`svg line.${ styles['cursor-line'] }`).prop('transform')).toBe('translate(10)');

			wrapper.setProps({
				data: {
					ts: 1598707000,
					data: []
				},
				colors: Colors,
				labels: new Map()
			});

			// [no labels] tooltip child 2, text
			expect(
				wrapper.instance().toRender.tooltipPoints[0].props.children[1].props.children
			).toBe('passed');

			wrapper.setState({ mouseOffsetX: 890 });

			// [mouseOffsetX: 890] tooltip child 1, text
			expect(
				wrapper.instance().toRender.tooltipPoints[0].props.children[0].props.children
			).toBe(51);
			// tooltip style
			expect(wrapper.find(`div.${ styles.tooltip }`).prop('style')).toEqual({ right: '258px' });

			wrapper.setState({ mouseOffsetX: 40 });

			// [mouseOffsetX: 40] tooltip child 1, text
			expect(
				wrapper.instance().toRender.tooltipPoints[0].props.children[0].props.children
			).toBe(45);

			instance.dndAllowed = true;
			wrapper.setState({ dndIsInProgress: true });

			// mouse-tracker_drag
			expect(wrapper.find(`.${ styles['mouse-tracker_drag'] }`)).toHaveLength(1);
			// mouse-tracker_dragging
			expect(wrapper.find(`.${ styles['mouse-tracker_dragging'] }`)).toHaveLength(1);
			// mouse-tracker onMouseDown
			expect(wrapper.find(`.${ styles['mouse-tracker'] }`).prop('onMouseDown').name).toBe('bound onMouseDown');
			// mouse-tracker onMouseUp
			expect(wrapper.find(`.${ styles['mouse-tracker'] }`).prop('onMouseUp').name).toBe('bound onMouseUp');
		});
	});
});
