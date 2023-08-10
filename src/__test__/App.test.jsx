/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { spy, stub } from 'sinon';
import { shallow } from 'enzyme';

import App, { history, SECTIONS, Errors } from '../App.jsx';
import datastore, { STORE, startObserve, play, pause } from '../datastore';
import styles from '../style.css';
import { apiUtils } from '../api';

describe('<App />', () => {
	afterEach(() => {
		history.replace({ hash: '' });
	});

	it('Listen history', () => {
		stub(apiUtils, 'checkApiAvailability').callsFake(
			() => Promise.reject({ type: '' })
		);

		const newHash = '#new_hash';
		let wrapper = shallow(<App.Component />);

		expect(wrapper.state('hash')).to.equal(history.location.hash || '#');

		history.replace({ hash: newHash });

		wrapper = shallow(<App.Component />);

		expect(wrapper.state('hash')).to.equal(newHash);

		apiUtils.checkApiAvailability.restore();
	});

	describe('componentDidMount()', () => {
		it('Default flow', async () => {
			stub(apiUtils, 'checkApiAvailability').callsFake(() => Promise.resolve());
			stub(apiUtils, 'checkWritePermissions').callsFake(() => {});
			stub(apiUtils, 'initialLoad').callsFake(() => Promise.resolve());
			stub(datastore, 'startObserve').callsFake(() => {});

			const wrapper = shallow(<App.Component />);
			const instance = wrapper.instance();

			await new Promise(resolve => {
				stub(instance, 'setState').callsFake(state => resolve(state));
			});

			expect(apiUtils.checkApiAvailability).to.be.calledOnce;
			expect(apiUtils.checkWritePermissions).to.be.calledOnce;
			expect(apiUtils.initialLoad).to.be.calledOnce;
			expect(apiUtils.initialLoad.args[0][0]).to.deep.equal(datastore);
			expect(instance.setState).to.be.calledOnce;
			expect(instance.setState.args[0][0]).to.deep.equal({ loading: false });
			expect(datastore.startObserve).to.be.calledOnce;

			apiUtils.checkApiAvailability.restore();
			apiUtils.checkWritePermissions.restore();
			apiUtils.initialLoad.restore();
			datastore.startObserve.restore();
		});

		it('"initialLoad" returns error', async () => {
			const error = "test_error";

			stub(apiUtils, 'checkApiAvailability').callsFake(() => Promise.reject({ type: error }));
			stub(apiUtils, 'checkWritePermissions').callsFake(() => {});
			stub(apiUtils, 'initialLoad').callsFake(() => Promise.resolve());

			const wrapper = shallow(<App.Component />);
			const instance = wrapper.instance();

			await new Promise(resolve => {
				stub(instance, 'setState').callsFake(resolve);
			});

			expect(instance.setState).to.be.calledOnce;
			expect(instance.setState.args[0][0]).to.deep.equal({ error });

			apiUtils.checkApiAvailability.restore();
			apiUtils.checkWritePermissions.restore();
			apiUtils.initialLoad.restore();
		});
	});

	describe('render()', () => {
		it('Loading', async () => {
			stub(apiUtils, 'checkApiAvailability').callsFake(
				() => Promise.reject({ type: '' })
			);

			const wrapper = shallow(<App.Component />);
			const instance = wrapper.instance();

			expect(wrapper.prop('className')).to.equal(styles['splash']);
			expect(wrapper.find(`.${ styles['logo'] }`)).to.have.lengthOf(1);

			const loader = wrapper.find('Loader');

			expect(loader).to.have.lengthOf(1);
			expect(loader.hasClass(styles['loader'])).to.be.true;
			expect(wrapper.find(`.${ styles['loading'] }`)).to.have.lengthOf(1);

			apiUtils.checkApiAvailability.restore();
		});

		it('Loaded', () => {
			stub(apiUtils, 'checkApiAvailability').callsFake(
				() => Promise.reject({ type: '' })
			);

			const wrapper = shallow(<App.Component />);
			wrapper.setState({ loading: false });

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

			apiUtils.checkApiAvailability.restore();
		});

		it('Errors', () => {
			stub(apiUtils, 'checkApiAvailability').callsFake(
				() => Promise.reject({ type: '' })
			);

			const wrapper = shallow(<App.Component />);
			wrapper.setState({ loading: false });
			const errBlockSelector = `.${ styles['error-block'] }`;

			expect(wrapper.find(errBlockSelector)).to.be.lengthOf(0);

			wrapper.setState({ error: 'some_unknown_error' });

			expect(wrapper.find(errBlockSelector)).to.be.lengthOf(1);
			expect(wrapper.find(`${ errBlockSelector } p`)).to.be.lengthOf(1);
			expect(wrapper.find('Header').prop('navigation')).to.be.false;
			expect(wrapper.find('UpdatingControl')).to.have.lengthOf(0);

			Object.keys(Errors).forEach(error => {
				wrapper.setState({ error });

				const p = wrapper.find(`${ errBlockSelector } p`);

				expect(p).to.be.lengthOf(2);
				expect(p.first().text()).to.be.equal(Errors[error]);
			});

			apiUtils.checkApiAvailability.restore();
		});
	});
});
