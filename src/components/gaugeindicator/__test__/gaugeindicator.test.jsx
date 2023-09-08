/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

/* eslint-env browser, mocha */
/* eslint import/first: "off" */
/* eslint no-param-reassign: "off" */

import React from 'react';
import { mount } from 'enzyme';
import GaugeIndicator, { WIDTH, HEIGHT, LINE_WIDTH, BG_COLOR, YELLOW_COLOR, GREEN_COLOR } from '../gaugeindicator.jsx';
import styles from '../style.css';

describe('<GaugeIndicator />', () => {
	const percentage = '50';
	const percentageNew = '60';
	let wrapper; let
		instance;

	beforeEach(() => {
		wrapper = mount(
			<GaugeIndicator percentage={percentage} />
		);
		instance = wrapper.instance();
	});

	it('componentDidMount()', () => {
		const initCanvasSpy = jest.spyOn(instance, 'initCanvas').mockClear();
		const updateCanvasSpy = jest.spyOn(instance, 'updateCanvas').mockClear();

		instance.componentDidMount();

		expect(initCanvasSpy).toHaveBeenCalled();
		expect(updateCanvasSpy).toHaveBeenCalled();
		expect(updateCanvasSpy).toHaveBeenCalledWith(percentage);
	});

	it('shouldComponentUpdate()', () => {
		expect(instance.shouldComponentUpdate({ percentage })).toBe(false);
		expect(instance.shouldComponentUpdate({ percentage: percentageNew })).toBeTruthy();
	});

	it('componentWillUpdate()', () => {
		const updateCanvasSpy = jest.spyOn(instance, 'updateCanvas').mockClear();

		instance.componentWillUpdate({ percentage });

		expect(updateCanvasSpy).toHaveBeenCalled();
		expect(updateCanvasSpy).toHaveBeenCalledWith(percentage);
	});

	it('initCanvas()', () => {
		const { canvas } = instance;

		jest.spyOn(CanvasRenderingContext2D.prototype, 'scale').mockClear();

		instance.initCanvas();

		expect(canvas.width === WIDTH * window.devicePixelRatio).toBeTruthy();
		expect(canvas.height === HEIGHT * window.devicePixelRatio).toBeTruthy();
		expect(canvas.style.width === `${ WIDTH }px`).toBeTruthy();
		expect(canvas.style.height === `${ HEIGHT }px`).toBeTruthy();
		expect(
			canvas.getContext('2d').scale
		).toHaveBeenCalledWith(window.devicePixelRatio, window.devicePixelRatio);

		canvas.getContext('2d').scale.mockRestore();
	});

	describe('updateCanvas()', () => {
		let spyContext;

		beforeEach(() => {
			spyContext = {};

			instance.canvas.getContext = () =>
				new Proxy(spyContext, {
					set: (target, name, value) => {
						if (!target[name]) {
							target[name] = [];
						}

						target[name].push(value);

						return true;
					},

					get: (target, name) => {
						if (!target[name]) {
							target[name] = jest.fn();
						}

						return target[name];
					}
				});
		});

		it('Draws', () => {
			instance.updateCanvas(percentage);

			expect(spyContext.clearRect).toHaveBeenCalledWith(0, 0, WIDTH, HEIGHT);
			expect(spyContext.lineWidth[0] === LINE_WIDTH).toBeTruthy();

			expect(spyContext.beginPath).toHaveBeenCalledTimes(2);

			expect(spyContext.arc).toHaveBeenCalledWith(
				WIDTH / 2,
				HEIGHT,
				WIDTH / 2 - LINE_WIDTH / 2,
				Math.PI,
				2 * Math.PI,
				false
			);

			expect(spyContext.arc).toHaveBeenLastCalledWith(
				WIDTH / 2,
				HEIGHT,
				WIDTH / 2 - LINE_WIDTH / 2,
				Math.PI,
				Math.PI * (1 + percentage / 100),
				false
			);
		});

		it('Uses proper colors', () => {
			instance.updateCanvas('39');

			expect(spyContext.strokeStyle[0] === BG_COLOR).toBeTruthy();
			expect(spyContext.strokeStyle[1] === YELLOW_COLOR).toBeTruthy();

			spyContext.strokeStyle = [];

			instance.updateCanvas('40');

			expect(spyContext.strokeStyle[1] === GREEN_COLOR).toBeTruthy();
		});
	});

	describe('render()', () => {
		it('Has expected structure', () => {
			expect(wrapper.getDOMNode().className === styles.gaugeindicator).toBeTruthy();

			expect(instance.canvas instanceof HTMLCanvasElement).toBeTruthy();
			expect(instance.canvas.className === styles.canvas).toBeTruthy();

			const value = wrapper.find(`.${ styles.value }`);

			expect(value.length === 1).toBeTruthy();
			expect(value.text() === `${ percentage }%`).toBeTruthy();
		});

		it('Updates properly', () => {
			wrapper.setProps({ percentage: percentageNew });
			expect(wrapper.find(`.${ styles.value }`).text() === `${ percentageNew }%`).toBeTruthy();

			wrapper.setProps({ percentage: null });
			expect(wrapper.find(`.${ styles.value }`).length === 0).toBeTruthy();
		});
	});
});
