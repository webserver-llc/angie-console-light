/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';
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

		expect(
			Element.prototype.matches,
			'Element.prototype.matches original'
		).to.be.equal('matches_test');

		delete Element.prototype.matches;
		checkElementMatches();

		expect(
			Element.prototype.matches,
			'Element.prototype.matches replaced'
		).to.be.equal('msMatchesSelector_test');

		Element.prototype.matches = _matches;
	});

	it('initTooltips()', () => {
		const setIntervalResult = 'setInterval_result';

		stub(window, 'addEventListener').callsFake(() => {});
		stub(window, 'clearInterval').callsFake(() => {});
		stub(window, 'setInterval').callsFake(() => setIntervalResult);
		stub(TooltipsUtils, 'closeTooltip').callsFake(() => {});
		stub(TooltipsUtils, 'renderTooltip').callsFake(() => {});

		initTooltips();

		expect(
			document.querySelectorAll(`body > .${ Tooltip.styles['tooltip-container'] }`),
			'tooltipContainerEl pasted to body'
		).to.have.lengthOf(1);
		expect(window.addEventListener.calledOnce, 'window.addEventListener called').to.be.true;
		expect(
			window.addEventListener.args[0][0],
			'window.addEventListener call arg 1'
		).to.be.equal('mouseover');

		const onMouseOver = window.addEventListener.args[0][1];

		expect(onMouseOver).to.be.a('function');

		let target = 'test_target';
		const closestSpy = spy(() => target);

		onMouseOver({ target: { closest: closestSpy } });

		expect(closestSpy).to.be.calledOnce;
		expect(closestSpy.calledWith('[data-tooltip]'), 'evt.target.closest call arg').to.be.true;
		expect(window.clearInterval, '[1]').to.be.calledOnce;
		expect(TooltipsUtils.closeTooltip, '[1]').to.be.calledOnce;
		expect(TooltipsUtils.renderTooltip, '[1]').to.be.calledOnce;
		expect(TooltipsUtils.renderTooltip.args[0][0], '[1]').to.be.equal(target);
		expect(window.setInterval).to.be.calledOnce;
		expect(window.setInterval.args[0][0], 'window.setInterval call arg 1').to.be.a('function');
		expect(window.setInterval.args[0][1], 'window.setInterval call arg 2').to.be.equal(500);

		window.setInterval.args[0][0]();

		expect(TooltipsUtils.renderTooltip, '[1]').to.be.calledTwice;

		target = null;
		window.clearInterval.resetHistory();
		window.setInterval.resetHistory();

		onMouseOver({ target: { closest: closestSpy } });

		expect(window.clearInterval, '[2]').to.be.calledOnce;
		expect(window.clearInterval.calledWith(setIntervalResult), '[2]').to.be.true;
		expect(window.setInterval.notCalled, 'window.setInterval not called').to.be.true;

		window.addEventListener.restore();
		window.clearInterval.restore();
		window.setInterval.restore();
		TooltipsUtils.closeTooltip.restore();
		TooltipsUtils.renderTooltip.restore();
	});

	it('closeTooltip()', () => {
		expect(tooltipContainerEl.children).to.be.lengthOf(0);

		TooltipsUtils.renderTooltip({
			getBoundingClientRect: () => ({}),
			tooltipComponent: 'Test Element',
		});
		expect(tooltipContainerEl.children).to.be.lengthOf(1);

		TooltipsUtils.closeTooltip();
		expect(tooltipContainerEl.children).to.be.lengthOf(0);
	});

	// TODO: Cannot stub React.render, so need to reconsider the test
	it('renderTooltip()', () => {
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

		spy(TooltipsUtils, 'closeTooltip');
		stub(Tooltip, 'Component').callsFake(() => <div>{TooltipResult}</div>);

		TooltipsUtils.renderTooltip({
			getBoundingClientRect,
			tooltipComponent,
		});

		expect(TooltipsUtils.closeTooltip).to.be.calledOnce;
		expect(tooltipContainerEl.children, 'Tooltip is rendered').to.be.lengthOf(1);
		expect(tooltipContainerEl.children[0].innerHTML, 'Tooltip content').to.be.equal(TooltipResult);
		expect(Tooltip.Component).to.be.calledOnce;
		expect(
			Tooltip.Component.args[0][0],
			'Tooltip args, align and position are undefined, window scroll > 0'
		).to.deep.equal({
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
		TooltipsUtils.closeTooltip.resetHistory();
		Tooltip.Component.resetHistory();
		TooltipsUtils.renderTooltip({
			getBoundingClientRect,
			tooltipComponent,
			tooltipStyle: 'hint-right'
		});

		expect(TooltipsUtils.closeTooltip).to.be.calledOnce;
		expect(
			Tooltip.Component.args[0][0],
			'Tooltip args, align: undefined, position: right, window scroll = 0'
		).to.contain({
			align: undefined,
			left: 20,
			position: 'right',
			top: 40,
		});

		TooltipsUtils.closeTooltip.resetHistory();
		Tooltip.Component.resetHistory();
		TooltipsUtils.renderTooltip({
			getBoundingClientRect,
			tooltipComponent,
			tooltipStyle: 'hint'
		});

		expect(TooltipsUtils.closeTooltip).to.be.calledOnce;
		expect(
			Tooltip.Component.args[0][0],
			'Tooltip args, align: undefined, position: right'
		).to.contain({
			align: 'center',
			position: 'top',
		});

		TooltipsUtils.closeTooltip();

		TooltipsUtils.closeTooltip.restore();
		Tooltip.Component.restore();
	});

	it('useTooltip()', () => {
		let result = useTooltip('Component_test');
		let ref = null;

		expect(result['data-tooltip'], 'result data-tooltip').to.be.true;
		expect(result.ref, 'result ref callback').to.be.a('function');

		result.ref(ref);

		expect(ref, 'ref callback result, null provided').to.be.a('null');

		ref = {};
		result.ref(ref);

		expect(ref, '[no style] ref callback result, {} provided').to.be.deep.equal({
			tooltipComponent: 'Component_test'
		});

		result = useTooltip('Component_test', 'style_test');
		ref = {};
		result.ref(ref);

		expect(ref, '[no style] ref callback result, {} provided').to.be.deep.equal({
			tooltipComponent: 'Component_test',
			tooltipStyle: 'style_test'
		});
	});
});
