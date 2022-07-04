/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import Tooltip from '../components/tooltip';

export const checkElementMatches = () => {
	if (!Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector;
	}
};

checkElementMatches();

export let tooltipContainerEl = null;
export let tooltipRendered = false;

let tooltipRenderInterval = null;

export const TooltipsUtils = {
	closeTooltip: () => {
		if (tooltipRendered) {
			React.render(null, tooltipContainerEl);
			tooltipRendered = false;
		}
	},

	renderTooltip: (el) => {
		TooltipsUtils.closeTooltip();

		let { top, left, height, width } = el.getBoundingClientRect();

		top = top + height;
		top = top + window.scrollY;
		left = left + window.scrollX;

		let align;
		let position;

		if (el.tooltipStyle === 'hint') {
			align = 'center';
			position = 'top';
		} else if (el.tooltipStyle === 'hint-right') {
			position = 'right';
		}

		React.render(
			<Tooltip.Component
				top={top}
				left={left}
				anchorWidth={width}
				anchorHeight={height}
				align={align}
				position={position}
			>
				{ el.tooltipComponent }
			</Tooltip.Component>, tooltipContainerEl
		);

		tooltipRendered = true;
	}
};

export const initTooltips = () => {
	tooltipContainerEl = document.createElement('div');
	tooltipContainerEl.className = Tooltip.styles['tooltip-container'];

	document.body.appendChild(tooltipContainerEl);

	window.addEventListener('mouseover', (evt) => {
		const target = evt.target.closest('[data-tooltip]');

		clearInterval(tooltipRenderInterval);

		TooltipsUtils.closeTooltip();

		if (target) {
			TooltipsUtils.renderTooltip(target);
			tooltipRenderInterval = setInterval(
				() => TooltipsUtils.renderTooltip(target),
				500
			);
		}
	});
};

export const useTooltip = (Component, style = '') => ({
	'data-tooltip': true,
	ref: (ref) => {
		if (ref) {
			ref.tooltipComponent = Component;

			if (style) {
				ref.tooltipStyle = style;
			}
		}
	}
});

export default {
	checkElementMatches,
	tooltipContainerEl,
	TooltipsUtils,
	initTooltips,
	useTooltip,
};
