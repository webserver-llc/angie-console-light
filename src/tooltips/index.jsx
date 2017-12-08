/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import Tooltip from '../components/tooltip/tooltip.jsx';
import styles from '../components/tooltip/style.css';


if (!Element.prototype.matches)
	Element.prototype.matches = Element.prototype.msMatchesSelector;

let tooltipContainerEl = null;
let currentTooltip = null;

export const initTooltips = () => {
	tooltipContainerEl = document.createElement('div');
	tooltipContainerEl.className = styles['tooltip-container'];

	document.body.appendChild(tooltipContainerEl);

	window.addEventListener('mouseover', (evt) => {
		if (evt.relatedTarget !== null && evt.relatedTarget.tooltipComponent) {
			closeTooltip();
		}

		if (evt.target.tooltipComponent) {
			renderTooltip(evt.target);
		}
	});
};

export const closeTooltip = () => {
	tooltipContainerEl.removeChild(currentTooltip);
};

export const renderTooltip = (el) => {
	let { top, left, height } = el.getBoundingClientRect();

	top = top + height;
	top = top + window.scrollY;
	left = left + window.scrollX;

	currentTooltip = React.render(
		<Tooltip top={top} left={left}>
			{ el.tooltipComponent }
		</Tooltip>, tooltipContainerEl, currentTooltip
	);
};

export const useTooltip = Component => ({ ref: (ref) => {
	if (ref) {
		ref.tooltipComponent = Component;
	}
} });
