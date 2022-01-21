/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { spy } from 'sinon';
import { shallow } from 'enzyme';
import App, { history, SECTIONS, Errors } from '../App.jsx';
import { STORE, startObserve, play, pause } from '../datastore';
import styles from '../style.css';

describe('<App />', () => {
	afterEach(() => {
		history.replace({ hash: '' });
	});

	it('constructor()', () => {
		const newHash = '#new_hash';
		let wrapper = shallow(<App />);

		expect(wrapper.state('hash')).to.equal(history.location.hash || '#');

		history.replace({ hash: newHash });

		wrapper = shallow(<App />);

		expect(wrapper.state('hash')).to.equal(newHash);
	});

	it('componentDidMount()', () => {
		const newHash = '#new_hash';

		spy(history, 'listen');

		const wrapper = shallow(<App />);
		const instance = wrapper.instance();

		expect(history.listen.calledOnce).to.be.true;

		spy(instance, 'setState');

		history.push({
			hash: newHash
		});

		expect(instance.setState.calledOnce).to.be.true;
		expect(instance.setState.args[0][0]).to.deep.equal({ hash: newHash });
		expect(wrapper.state('hash')).to.equal(newHash);

		history.push({
			hash: ''
		});

		expect(instance.setState.calledTwice).to.be.true;
		expect(instance.setState.args[1][0]).to.deep.equal({ hash: '#' });
		expect(wrapper.state('hash')).to.equal('#');

		history.listen.restore();
		instance.setState.restore();
	});

	describe('render()', () => {
		it('Loading', () => {
			const wrapper = shallow(<App loading={ true } />);

			expect(wrapper.prop('className')).to.equal(styles['splash']);
			expect(wrapper.find(`.${ styles['logo'] }`)).to.have.lengthOf(1);

			const loader = wrapper.find('Loader');

			expect(loader).to.have.lengthOf(1);
			expect(loader.hasClass(styles['loader'])).to.be.true;

			expect(wrapper.find(`.${ styles['loading'] }`)).to.have.lengthOf(1);
		});

		it('Loaded', () => {
			const wrapper = shallow(<App />);

			expect(wrapper.prop('className')).to.equal(styles['dashboard']);
			expect(wrapper.find('Disclaimer')).to.have.lengthOf(__ENV__ === 'demo' ? 1 : 0);

			const header = wrapper.find('Header');

			expect(header).to.have.lengthOf(1);
			expect(header.prop('hash')).to.be.equal(wrapper.state('hash'));
			expect(header.prop('navigation')).to.be.true;
			expect(header.prop('statuses')).to.be.equal(STORE.__STATUSES);

			const updatingControl = wrapper.find('UpdatingControl');

			expect(updatingControl).to.have.lengthOf(1);
			expect(updatingControl.prop('play')).to.be.equal(play);
			expect(updatingControl.prop('pause')).to.be.equal(pause);
			expect(updatingControl.prop('update')).to.be.equal(startObserve);

			Object.keys(SECTIONS).forEach(id => {
				wrapper.setState({ hash: id })

				expect(wrapper.find(SECTIONS[id].name)).to.have.lengthOf(1);
			});

			expect(wrapper.find('Footer')).to.have.lengthOf(1);
		});

		it('Errors', () => {
			const wrapper = shallow(<App />);
			const errBlockSelector = `.${ styles['error-block'] }`;

			expect(wrapper.find(errBlockSelector)).to.be.lengthOf(0);

			wrapper.setProps({ error: 'some_unknown_error' });

			expect(wrapper.find(errBlockSelector)).to.be.lengthOf(1);
			expect(wrapper.find(`${ errBlockSelector } p`)).to.be.lengthOf(1);
			expect(wrapper.find('Header').prop('navigation')).to.be.false;
			expect(wrapper.find('UpdatingControl')).to.have.lengthOf(0);

			Object.keys(Errors).forEach(error => {
				wrapper.setProps({ error });

				const p = wrapper.find(`${ errBlockSelector } p`);

				expect(p).to.be.lengthOf(2);
				expect(p.first().text()).to.be.equal(Errors[error]);
			});
		});
	});
});
