/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import Disclaimer from '../disclaimer.jsx';
import styles from '../style.css';

describe('<Disclaimer /> (demo)', () => {
	let wrapper, instance;

	beforeEach(() => {
		wrapper = shallow(<Disclaimer />);
		instance = wrapper.instance();
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it('constructor()', () => {
		const bindSpy = spy(instance.close, 'bind');

		instance.constructor();

		expect(wrapper.state(), 'state').to.be.deep.equal({ opened: true });
		expect(bindSpy.calledOnce, 'close.bind called once').to.be.true;
		expect(bindSpy.args[0][0], 'close.bind 1st arg').to.be.deep.equal(instance);

		bindSpy.restore();
	});

	it('close()', () => {
		const setStateSpy = spy(instance, 'setState');

		instance.close();

		expect(setStateSpy.calledOnce, 'setState called once').to.be.true;
		expect(setStateSpy.args[0][0], 'setState 1st arg').to.be.deep.equal({ opened: false });

		setStateSpy.restore();
	});

	it('render()', () => {
		const closeEl = wrapper.find(`.${ styles['disclaimer-close'] }`);
		const contentEl = wrapper.find(`.${ styles['disclaimer-content'] }`);

		expect(wrapper.find(`.${ styles['disclaimer'] }`).length, 'root el length').to.be.equal(1);
		expect(closeEl.length, 'close element length').to.be.equal(1);
    	expect(closeEl.prop('onClick').name, 'onClick handler').to.be.equal('bound close');
		expect(contentEl.length, 'content element length').to.be.equal(1);

		const links = contentEl.find('a');

		expect(links.length, 'links length').to.be.equal(3);
		expect(links.get(0).attributes.href, '1st link href').to.be.equal('https://demo.nginx.com/swagger-ui/');
		expect(links.get(1).attributes.href, '2nd link href').to.be.equal('https://www.nginx.com/resources/admin-guide/logging-and-monitoring/');
		expect(links.get(2).attributes.href, '3rd link href').to.be.equal('https://www.nginx.com/contact-sales/');

		wrapper.setState({ opened: false });

		expect(wrapper.length, 'root el when closed').to.be.equal(0);
	});
});
