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
import {
	checkElementMatches,
	tooltipContainerEl,
	TooltipsUtils,
	initTooltips,
	useTooltip,
	tooltipRendered,
} from '../index.jsx';
import Tooltip from '../../components/tooltip';

describe('Tooltips', () => {
	it('checkElementMatches()', () => {
		const _matches = Element.prototype.matches;

		Element.prototype.matches = 'matches_test';
		Element.prototype.msMatchesSelector = 'msMatchesSelector_test';

		checkElementMatches();

		// Element.prototype.matches original
		expect(Element.prototype.matches).toBe('matches_test');

		delete Element.prototype.matches;
		checkElementMatches();

		// Element.prototype.matches replaced
		expect(Element.prototype.matches).toBe('msMatchesSelector_test');

		Element.prototype.matches = _matches;
	});

	it('initTooltips()', () => {
		const setIntervalResult = 'setInterval_result';

		jest.spyOn(window, 'addEventListener').mockClear().mockImplementation(() => {});
		jest.spyOn(window, 'clearInterval').mockClear().mockImplementation(() => {});
		jest.spyOn(window, 'setInterval').mockClear().mockImplementation(() => setIntervalResult);
		jest.spyOn(TooltipsUtils, 'closeTooltip').mockClear().mockImplementation(() => {});
		jest.spyOn(TooltipsUtils, 'renderTooltip').mockClear().mockImplementation(() => {});

		initTooltips();

		// tooltipContainerEl pasted to body
		expect(
			document.querySelectorAll(`body > .${ Tooltip.styles['tooltip-container'] }`)
		).toHaveLength(1);
		// window.addEventListener called
		expect(window.addEventListener).toHaveBeenCalled();
		// window.addEventListener call arg 1
		expect(window.addEventListener.mock.calls[0][0]).toBe('mouseover');

		const onMouseOver = window.addEventListener.mock.calls[0][1];

		expect(onMouseOver).toBeInstanceOf(Function);

		let target = 'test_target';
		const closestSpy = jest.fn(() => target);

		onMouseOver({ target: { closest: closestSpy } });

		expect(closestSpy).toHaveBeenCalledTimes(1);
		// evt.target.closest call arg
		expect(closestSpy).toHaveBeenCalledWith('[data-tooltip]');
		// [1]
		expect(window.clearInterval).toHaveBeenCalledTimes(1);
		// [1]
		expect(TooltipsUtils.closeTooltip).toHaveBeenCalledTimes(1);
		// [1]
		expect(TooltipsUtils.renderTooltip).toHaveBeenCalledTimes(1);
		// [1]
		expect(TooltipsUtils.renderTooltip.mock.calls[0][0]).toBe(target);
		expect(window.setInterval).toHaveBeenCalledTimes(1);
		expect(window.setInterval.mock.calls[0][0]).toBeInstanceOf(Function);
		// window.setInterval call arg 2
		expect(window.setInterval.mock.calls[0][1]).toBe(500);

		window.setInterval.mock.calls[0][0]();

		// [1]
		expect(TooltipsUtils.renderTooltip).toHaveBeenCalledTimes(2);

		target = null;
		window.clearInterval.mockReset();
		window.setInterval.mockReset();

		onMouseOver({ target: { closest: closestSpy } });

		// [2]
		expect(window.clearInterval).toHaveBeenCalledTimes(1);
		// [2]
		expect(window.clearInterval).toHaveBeenCalledWith(setIntervalResult);
		// window.setInterval not called
		expect(window.setInterval).not.toHaveBeenCalledWith();

		window.addEventListener.mockRestore();
		window.clearInterval.mockRestore();
		window.setInterval.mockRestore();
		TooltipsUtils.closeTooltip.mockRestore();
		TooltipsUtils.renderTooltip.mockRestore();
	});

	it('closeTooltip()', () => {
		initTooltips();
		expect(tooltipContainerEl.children).toHaveLength(0);

		TooltipsUtils.renderTooltip({
			getBoundingClientRect: () => ({}),
			tooltipComponent: 'Test Element',
		});
		expect(tooltipContainerEl.children).toHaveLength(1);

		TooltipsUtils.closeTooltip();
		expect(tooltipContainerEl.children).toHaveLength(0);
	});

	// TODO: Cannot stub React.render, so need to reconsider the test
	it('renderTooltip()', () => {
		initTooltips();
		window.scrollY = 100;
		window.scrollX = 100;

		const getBoundingClientRect = () => ({
			top: 10,
			left: 20,
			height: 30,
			width: 40
		});
		const tooltipComponent = 'tooltipComponent_test';
		const TooltipResult = 'Tooltip_result';

		jest.spyOn(TooltipsUtils, 'closeTooltip').mockClear();
		jest.spyOn(Tooltip, 'Component').mockClear().mockImplementation(() => <div>{TooltipResult}</div>);

		TooltipsUtils.renderTooltip({
			getBoundingClientRect,
			tooltipComponent,
		});

		expect(TooltipsUtils.closeTooltip).toHaveBeenCalledTimes(1);
		// Tooltip is rendered
		expect(tooltipContainerEl.children).toHaveLength(1);
		// Tooltip content
		expect(tooltipContainerEl.children[0].innerHTML).toBe(TooltipResult);
		expect(Tooltip.Component).toHaveBeenCalledTimes(1);
		// Tooltip args, align and position are undefined, window scroll > 0
		expect(Tooltip.Component.mock.calls[0][0]).toEqual({
			align: undefined,
			anchorHeight: 30,
			anchorWidth: 40,
			children: tooltipComponent,
			left: 120,
			position: undefined,
			top: 140,
		});

		window.scrollY = 0;
		window.scrollX = 0;
		TooltipsUtils.closeTooltip.mockReset();
		Tooltip.Component.mockReset();
		TooltipsUtils.renderTooltip({
			getBoundingClientRect,
			tooltipComponent,
			tooltipStyle: 'hint-right'
		});

		expect(TooltipsUtils.closeTooltip).toHaveBeenCalledTimes(1);
		// Tooltip args, align: undefined, position: right, window scroll = 0
		expect(Tooltip.Component.mock.calls[0][0]).toMatchObject({
			align: undefined,
			left: 20,
			position: 'right',
			top: 40,
		});

		TooltipsUtils.closeTooltip.mockReset();
		Tooltip.Component.mockReset();
		TooltipsUtils.renderTooltip({
			getBoundingClientRect,
			tooltipComponent,
			tooltipStyle: 'hint'
		});

		expect(TooltipsUtils.closeTooltip).toHaveBeenCalledTimes(1);
		// Tooltip args, align: undefined, position: right
		expect(Tooltip.Component.mock.calls[0][0]).toMatchObject({
			align: 'center',
			position: 'top',
		});

		TooltipsUtils.closeTooltip();

		TooltipsUtils.closeTooltip.mockRestore();
		Tooltip.Component.mockRestore();
	});

	it('useTooltip()', () => {
		let result = useTooltip('Component_test');
		let ref = null;

		// result data-tooltip
		expect(result['data-tooltip']).toBe(true);
		expect(result.ref).toBeInstanceOf(Function);

		result.ref(ref);

		expect(ref).toBeNull();

		ref = {};
		result.ref(ref);

		// [no style] ref callback result, {} provided
		expect(ref).toEqual({
			tooltipComponent: 'Component_test'
		});

		result = useTooltip('Component_test', 'style_test');
		ref = {};
		result.ref(ref);

		// [no style] ref callback result, {} provided
		expect(ref).toEqual({
			tooltipComponent: 'Component_test',
			tooltipStyle: 'style_test'
		});
	});
});
