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
import { spy } from 'sinon';
import { mount } from 'enzyme';
import GaugeIndicator, { WIDTH, HEIGHT, LINE_WIDTH, BG_COLOR, YELLOW_COLOR, GREEN_COLOR } from '../gaugeindicator.jsx';
import styles from '../style.css';

describe('<GaugeIndicator />', () => {
	const percentage = '50';
	const percentageNew = '60';
	let wrapper, instance;

	beforeEach(() => {
		wrapper = mount(
			<GaugeIndicator percentage={ percentage } />
		);
		instance = wrapper.instance();
	});

	it('componentDidMount()', () => {
		const initCanvasSpy = spy(instance, 'initCanvas');
		const updateCanvasSpy = spy(instance, 'updateCanvas');

		instance.componentDidMount();

		assert(initCanvasSpy.calledOnce, '"initCanvas" should be called');
		assert(updateCanvasSpy.calledOnce, '"updateCanvas" should be called');
		assert(updateCanvasSpy.calledWith(percentage), '"updateCanvas" was called with wrong arguments');
	});

	it('shouldComponentUpdate()', () => {
		assert.isFalse(
			instance.shouldComponentUpdate({ percentage: percentage }),
			'Shouldn\'t be updated with same percentage value'
		);
		assert(
			instance.shouldComponentUpdate({ percentage: percentageNew }),
			'Should be updated with new percentage'
		);
	});

	it('componentWillUpdate()', () => {
		const updateCanvasSpy = spy(instance, 'updateCanvas');

		instance.componentWillUpdate({ percentage: percentage });

		assert(updateCanvasSpy.calledOnce, '"updateCanvas" should be called');
		assert(updateCanvasSpy.calledWith(percentage), '"updateCanvas" was called with wrong arguments');
	});

	it('initCanvas()', () => {
		const { canvas } = instance;

		spy(CanvasRenderingContext2D.prototype, 'scale');

		instance.initCanvas();

		assert(canvas.width === WIDTH * window.devicePixelRatio, 'Bad canvas width');
		assert(canvas.height === HEIGHT * window.devicePixelRatio, 'Bad canvas height');
		assert(canvas.style.width === `${ WIDTH }px`, 'Bad canvas style width');
		assert(canvas.style.height === `${ HEIGHT }px`, 'Bad canvas style height');
		assert(
			canvas.getContext('2d').scale.calledWith(window.devicePixelRatio, window.devicePixelRatio),
			'Bad canvas scale'
		);

		canvas.getContext('2d').scale.restore();
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
							target[name] = spy();
						}

						return target[name];
					}
				});
		});

		it('Draws', () => {
			instance.updateCanvas(percentage);

			assert(spyContext.clearRect.calledWith(0, 0, WIDTH, HEIGHT), 'Cleared bad square');
			assert(spyContext.lineWidth[0] === LINE_WIDTH, 'Bad line width setted');

			assert(spyContext.beginPath.calledTwice, 'Two draw cycles should be done');

			assert(spyContext.arc.getCall(0).calledWith(
				WIDTH / 2,
				HEIGHT,
				WIDTH / 2 - LINE_WIDTH / 2,
				Math.PI,
				2 * Math.PI,
				false
			), 'Bad first draw operation');

			assert(spyContext.arc.getCall(1).calledWith(
				WIDTH / 2,
				HEIGHT,
				WIDTH / 2 - LINE_WIDTH / 2,
				Math.PI,
				Math.PI * (1 + percentage / 100),
				false
			), 'Bad second draw operation');
		});

		it('Uses proper colors', () => {
			instance.updateCanvas('39');

			assert(spyContext.strokeStyle[0] === BG_COLOR);
			assert(spyContext.strokeStyle[1] === YELLOW_COLOR);

			spyContext.strokeStyle = [];

			instance.updateCanvas('40');

			assert(spyContext.strokeStyle[1] === GREEN_COLOR);
		});
	});

	describe('render()', () => {
		it('Has expected structure', () => {
			assert(wrapper.getDOMNode().className === styles['gaugeindicator'], 'Wrapper has unexpected className');

			assert(instance.canvas instanceof HTMLCanvasElement, 'Bad canvas instance');
			assert(instance.canvas.className === styles['canvas'], 'Canvas has unexpected className');

			const value = wrapper.find(`.${ styles['value'] }`);

			assert(value.length === 1, 'Can\'t find percentage value element');
			assert(value.text() === `${ percentage }%`, 'Percentage value rendered badly');
		});

		it('Updates properly', () => {
			wrapper.setProps({ percentage: percentageNew });
			assert(wrapper.find(`.${ styles['value'] }`).text() === `${ percentageNew }%`, 'Percentage value should be updated');

			wrapper.setProps({ percentage: null });
			assert(wrapper.find(`.${ styles['value'] }`).length === 0, 'Percentage element should not be presented when value is "null"');
		});
	});
});
