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
	closeTooltip,
	renderTooltip,
	initTooltips,
	useTooltip
} from '../index.jsx';
import styles from '../../components/tooltip/style.css';

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
		spy(document, 'createElement');
		stub(window, 'addEventListener').callsFake(() => {});
		stub(window, 'clearInterval').callsFake(() => {});
		stub(window, 'setInterval').callsFake(() => 'setInterval_result');
		stub(React, 'render').callsFake(() => {});

		initTooltips();

		expect(document.createElement.calledOnce, 'document.createElement called').to.be.true;
		expect(document.createElement.calledWith('div'), 'document.createElement call arg').to.be.true;
		expect(
			document.querySelectorAll(`body .${ styles['tooltip-container'] }`),
			'tooltipContainerEl pasted to body'
		).to.have.lengthOf(1);
		expect(window.addEventListener.calledOnce, 'window.addEventListener called').to.be.true;
		expect(
			window.addEventListener.args[0][0],
			'window.addEventListener call arg 1'
		).to.be.equal('mouseover');
		expect(
			window.addEventListener.args[0][1],
			'window.addEventListener call arg 2'
		).to.be.a('function');

		const getBoundingClientRectSpy = spy(() => ({}));
		let closestResult = {
			getBoundingClientRect: getBoundingClientRectSpy
		};
		const closestSpy = spy(() => closestResult);

		window.addEventListener.args[0][1]({
			target: {
				closest: closestSpy
			}
		});

		expect(closestSpy.calledOnce, 'evt.target.closest called').to.be.true;
		expect(closestSpy.calledWith('[data-tooltip]'), 'evt.target.closest call arg').to.be.true;
		expect(window.clearInterval.calledOnce, '[1] window.clearInterval called').to.be.true;
		expect(getBoundingClientRectSpy.calledOnce, '[renderTooltip] getBoundingClientRect called').to.be.true;
		expect(window.setInterval.calledOnce, 'window.setInterval called').to.be.true;
		expect(window.setInterval.args[0][0], 'window.setInterval call arg 1').to.be.a('function');

		window.setInterval.args[0][0]();

		expect(
			getBoundingClientRectSpy.calledTwice,
			'[renderTooltip] getBoundingClientRect called from setInterval'
		).to.be.true;

		expect(window.setInterval.args[0][1], 'window.setInterval call arg 2').to.be.equal(500);

		closestResult = null;
		window.clearInterval.resetHistory();
		getBoundingClientRectSpy.resetHistory();
		window.setInterval.resetHistory();
		window.addEventListener.args[0][1]({
			target: {
				closest: closestSpy
			}
		});

		expect(window.clearInterval.calledOnce, 'window.clearInterval called').to.be.true;
		expect(
			window.clearInterval.calledWith('setInterval_result'),
			'[2] window.clearInterval called'
		).to.be.true;
		expect(getBoundingClientRectSpy.notCalled, '[renderTooltip] getBoundingClientRect not called').to.be.true;
		expect(window.setInterval.notCalled, 'window.setInterval not called').to.be.true;

		document.createElement.restore();
		window.addEventListener.restore();
		window.clearInterval.restore();
		window.setInterval.restore();
		React.render.restore();
	});

	it('closeTooltip()', () => {
		stub(React, 'render').callsFake(() => {
			const el = document.createElement('div');

			el.setAttribute('id', 'test_tooltip');
			tooltipContainerEl.appendChild(el);

			return el;
		});

		renderTooltip({
			getBoundingClientRect(){ return {} }
		});

		expect(document.querySelectorAll('#test_tooltip'), 'tooltip exists').to.have.lengthOf(1);

		closeTooltip();

		expect(document.querySelectorAll('#test_tooltip'), 'tooltip removed').to.have.lengthOf(0);

		React.render.restore();
	});

	it('renderTooltip()', () => {
		let id = 'test_tooltip_1';

		stub(React, 'render').callsFake(() => {
			const el = document.createElement('div');

			el.setAttribute('id', id);
			tooltipContainerEl.appendChild(el);

			return el;
		});

		const getBoundingClientRectSpy = spy(() => ({
			top: 10,
			left: 20,
			height: 30,
			width: 40
		}));

		renderTooltip({
			getBoundingClientRect: getBoundingClientRectSpy,
			tooltipComponent: 'tooltipComponent_test'
		});

		expect(getBoundingClientRectSpy.calledOnce, 'el.getBoundingClientRect called').to.be.true;
		expect(React.render.calledOnce, 'React.render called').to.be.true;

		let Tooltip = React.render.args[0][0];

		expect(Tooltip.nodeName.name, 'React.render arg 1').to.be.equal('Tooltip');
		expect(
			Tooltip.attributes.top,
			'React.render arg 1, attr top'
		).to.be.equal(40);
		expect(
			Tooltip.attributes.left,
			'React.render arg 1, attr left'
		).to.be.equal(20);
		expect(
			Tooltip.attributes.anchorWidth,
			'React.render arg 1, attr anchorWidth'
		).to.be.equal(40);
		expect(
			Tooltip.attributes.anchorHeight,
			'React.render arg 1, attr anchorHeight'
		).to.be.equal(30);
		expect(
			Tooltip.attributes.align,
			'[no tooltipStyle] React.render arg 1, attr align'
		).to.be.an('undefined');
		expect(
			Tooltip.attributes.position,
			'[no tooltipStyle] React.render arg 1, attr position'
		).to.be.an('undefined');
		expect(
			Tooltip.children,
			'React.render arg 1, children'
		).to.be.deep.equal(['tooltipComponent_test']);

		expect(React.render.args[0][1], 'React.render arg 2').to.be.equal(tooltipContainerEl);

		React.render.resetHistory();
		id = 'test_tooltip_2';
		renderTooltip({
			getBoundingClientRect: getBoundingClientRectSpy,
			tooltipStyle: 'hint-right'
		});

		expect(
			document.querySelectorAll('#test_tooltip_1'),
			'previous tooltip removed'
		).to.have.lengthOf(0);

		Tooltip = React.render.args[0][0];

		expect(
			Tooltip.attributes.align,
			'[tooltipStyle = hint-right] React.render arg 1, attr align'
		).to.be.an('undefined');
		expect(
			Tooltip.attributes.position,
			'[tooltipStyle = hint-right] React.render arg 1, attr position'
		).to.be.equal('right');

		React.render.resetHistory();
		renderTooltip({
			getBoundingClientRect: getBoundingClientRectSpy,
			tooltipStyle: 'hint'
		});

		expect(
			document.querySelectorAll('#test_tooltip_1'),
			'previous tooltip removed'
		).to.have.lengthOf(0);

		Tooltip = React.render.args[0][0];

		expect(
			Tooltip.attributes.align,
			'[tooltipStyle = hint] React.render arg 1, attr align'
		).to.be.equal('center');
		expect(
			Tooltip.attributes.position,
			'[tooltipStyle = hint] React.render arg 1, attr position'
		).to.be.equal('top');

		React.render.restore();
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
