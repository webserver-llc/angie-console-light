/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow, mount } from 'enzyme';
import Popup from '../popup.jsx';
import styles from '../style.css';

describe('<Popup />', () => {
	it('componentDidMount()', () => {
		const wrapper = shallow(<Popup />);
		const instance = wrapper.instance();

		instance.componentDidMount();

		expect(
			document.documentElement.classList.contains(styles['disable-scroll']),
			'document.documentElement class'
		).to.be.true;
	});

	it('componentWillUnmount()', () => {
		const wrapper = shallow(<Popup />);
		const instance = wrapper.instance();

		expect(
			document.documentElement.classList.contains(styles['disable-scroll']),
			'document.documentElement class'
		).to.be.true;

		instance.componentWillUnmount();

		expect(
			document.documentElement.classList.contains(styles['disable-scroll']),
			'document.documentElement class'
		).to.be.false;
	});

	it('render()', () => {
		const wrapper = mount(
			<Popup className="test_class">
				<div>test child 1</div>
				<div>test child 2</div>
			</Popup>
		);
		const instance = wrapper.instance();
		const rootElement = instance.rootElementRef;

		expect(wrapper.hasClass('test_class')).to.be.true;
		expect(rootElement.className, 'fader className').to.be.equal(styles['fader']);
		expect(rootElement.children[0].className, 'modal className').to.be.equal(styles['modal']);

		const popup = rootElement.children[0].children[0];

		expect(popup.className, 'popup className')
			.to.be.equal(`${ styles['popup'] } test_class`);
		expect(popup.children, 'popup children').to.have.lengthOf(2);
		expect(popup.children[0].innerHTML, 'popup child 1').to.be.equal('test child 1');
		expect(popup.children[1].innerHTML, 'popup child 2').to.be.equal('test child 2');

		wrapper.unmount();
	});
});
