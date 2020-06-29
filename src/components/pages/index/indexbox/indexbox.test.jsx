/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

/* eslint-env browser, mocha */

import React from 'react';
import { mount } from 'enzyme';
import IndexBox from './indexbox.jsx';
import style from './styles.css';
// import statusStyle from '../statusicon/style.css';

describe('IndexBox', () => {
	// describe('render()', () => {
	// 	it('renders children', () => {
	// 		const wrapper = mount(<IndexBox>
	// 			<div>
	// 				<div className="test" />
	// 				<div className="test" />
	// 			</div>
	// 		</IndexBox>);

	// 		assert(wrapper.find('div').length === 4 /* 3 children + 1 container */);
	// 	});

	// 	it('renders header', () => {
	// 		const wrapper = mount(<IndexBox title="Test Header">
	// 			<span>123</span>
	// 		</IndexBox>);

	// 		assert(wrapper.find(`.${style.header}`).text() === 'Test Header');
	// 	});

	// 	it('link in header');

	// 	it('renders status', (done) => {
	// 		const wrapper = mount(<IndexBox title="Test Header" status="warning">
	// 			<span>123</span>
	// 		</IndexBox>);

	// 		assert(wrapper.find(`.${style.header} .${statusStyle.warning}`).length === 1);

	// 		wrapper.setProps({
	// 			title: 'Test Header',
	// 			status: 'ok'
	// 		});

	// 		// Hack for enzyme+react
	// 		setImmediate(() => {
	// 			assert(wrapper.find(`.${style.header} .${statusStyle.ok}`).length === 1);
	// 			done();
	// 		});
	// 	});
	// });


});