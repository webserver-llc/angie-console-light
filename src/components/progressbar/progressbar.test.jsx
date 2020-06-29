/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

/* eslint-env browser, mocha */

import React from 'react';
import { mount } from 'enzyme';
import Progressbar from './progressbar.jsx';
import styles from './style.css';

describe('ProgressBar', () => {
	// let wrapper;

	// beforeEach(() => {
	// 	wrapper = mount(<Progressbar percentage="50" />);
	// });

	// it('render()', () => {
	// 	const fulfillment = wrapper.find(`.${styles.fulfillment}`);

	// 	assert(fulfillment.text() === '50 %');
	// 	assert(fulfillment.get(0).style.width === '50%');
	// });

	// it('shouldComponentUpdate()', () => {
	// 	assert.isFalse(wrapper.instance().shouldComponentUpdate({
	// 		percentage: '50'
	// 	}));

	// 	assert(wrapper.instance().shouldComponentUpdate({
	// 		percentage: '51'
	// 	}));
	// });
});
