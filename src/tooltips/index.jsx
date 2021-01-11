/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import Tooltip from '../components/tooltip/tooltip.jsx';
import styles from '../components/tooltip/style.css';

export const checkElementMatches = () => {
	if (!Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector;
	}
};

checkElementMatches();

export let tooltipContainerEl = null;
export let currentTooltip = null;

let tooltipRenderInterval = null;

export const closeTooltip = () => {
	if (currentTooltip) {
		tooltipContainerEl.removeChild(currentTooltip);
		currentTooltip = null;
	}
};

export const renderTooltip = (el) => {
	closeTooltip();

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

	currentTooltip = React.render(
		<Tooltip top={top} left={left} anchorWidth={width} anchorHeight={height} align={align} position={position}>
			{ el.tooltipComponent }
		</Tooltip>, tooltipContainerEl
	);
};

export const initTooltips = () => {
	tooltipContainerEl = document.createElement('div');
	tooltipContainerEl.className = styles['tooltip-container'];

	document.body.appendChild(tooltipContainerEl);

	window.addEventListener('mouseover', (evt) => {
		const target = evt.target.closest('[data-tooltip]');

		clearInterval(tooltipRenderInterval);

		closeTooltip();

		if (target) {
			renderTooltip(target);
			tooltipRenderInterval = setInterval(() => renderTooltip(target), 500);
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
