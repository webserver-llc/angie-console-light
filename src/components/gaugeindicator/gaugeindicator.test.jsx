/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

/* eslint-env browser, mocha */
/* eslint import/first: "off" */
/* eslint no-param-reassign: "off" */

import React from 'react';
import { spy } from 'sinon';
import { mount } from 'enzyme';
import GaugeIndicator, { WIDTH, HEIGHT, LINE_WIDTH, BG_COLOR, YELLOW_COLOR, GREEN_COLOR } from './gaugeindicator.jsx';
import styles from './style.css';

describe('GaugeIndicator', () => {
	let wrapper;
	let instance;

	beforeEach(() => {
		wrapper = mount(<GaugeIndicator percentage="50" />);
		instance = wrapper.instance();
	});

	it('render()', () => {
		assert(instance.canvas instanceof HTMLCanvasElement);
		assert(wrapper.find(`.${styles.value}`).text() === '50%');
	});

	it('componentDidMount()', () => {
		const initCanvas = spy(instance, 'initCanvas');
		const updateCanvas = spy(instance, 'updateCanvas');

		instance.componentDidMount();

		assert(initCanvas.calledOnce);
		assert(updateCanvas.calledWith('50'));
	});

	it('shouldComponentUpdate()', () => {
		assert.isFalse(instance.shouldComponentUpdate({
			percentage: '50'
		}));

		assert(instance.shouldComponentUpdate({
			percentage: '60'
		}));
	});

	it('componentWillUpdate()', () => {
		const updateCanvas = spy(instance, 'updateCanvas');

		instance.componentWillUpdate({
			percentage: '60'
		});

		assert(updateCanvas.calledWith('60'));
	});

	it('initCanvas()', () => {
		const { canvas } = instance;
		const { getContext } = canvas;
		const scaleSpy = spy();

		canvas.getContext = function getContextDecorated(...args) {
			const context = getContext.apply(this, args);
			context.scale = scaleSpy;
			return context;
		};

		instance.initCanvas();

		assert(canvas.width === WIDTH * window.devicePixelRatio);
		assert(canvas.height === HEIGHT * window.devicePixelRatio);
		assert(canvas.style.height === `${HEIGHT}px`);
		assert(canvas.style.width === `${WIDTH}px`);
		assert(canvas.getContext('2d').scale.calledWith(window.devicePixelRatio, window.devicePixelRatio));
	});

	describe('updateCanvas()', () => {
		let spyContext = {};

		beforeEach(() => {
			spyContext = {};

			wrapper.instance().canvas.getContext = () =>
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
							target[name] = spy();
						}

						return target[name];
					}
				})
			;
		});

		it('draws', () => {
			const percent = 30;

			wrapper.instance().updateCanvas(percent);

			assert(spyContext.clearRect.calledWith(0, 0, WIDTH, HEIGHT));
			assert(spyContext.lineWidth[0] === LINE_WIDTH);
			assert(spyContext.beginPath.calledTwice);

			assert(spyContext.arc.getCall(0).calledWith(
				WIDTH / 2,
				HEIGHT,
				WIDTH / 2 - LINE_WIDTH / 2,
				Math.PI,
				2 * Math.PI,
				false
			));

			assert(spyContext.arc.getCall(1).calledWith(
				WIDTH / 2,
				HEIGHT,
				WIDTH / 2 - LINE_WIDTH / 2,
				Math.PI,
				Math.PI * (1 + percent / 100),
				false
			));
		});

		it('uses propper colors', () => {
			wrapper.instance().updateCanvas(39);
			assert(spyContext.strokeStyle[0] === BG_COLOR);
			assert(spyContext.strokeStyle[1] === YELLOW_COLOR);

			spyContext.strokeStyle = [];

			wrapper.instance().updateCanvas(40);
			assert(spyContext.strokeStyle[1] === GREEN_COLOR);
		});
	});
});
