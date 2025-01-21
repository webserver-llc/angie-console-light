/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import React from 'react';
import { shallow } from 'enzyme';

import App, { history, SECTIONS, Errors } from '../App.jsx';
import datastore, { STORE, startObserve, play, pause } from '../datastore';
import styles from '../style.css';
import { apiUtils } from '../api';
import envUtils from '../env';

describe('<App />', () => {
	afterEach(() => {
		history.replace({ hash: '' });
	});

	it('Listen history', () => {
		jest.spyOn(apiUtils, 'checkApiAvailability').mockClear().mockImplementation(
			() => Promise.reject({ type: '' })
		);

		const newHash = '#caches';
		let wrapper = shallow(<App.Component />);

		expect(wrapper.state('hash')).toBe(history.location.hash || '#');

		history.replace({ hash: newHash });

		wrapper = shallow(<App.Component />);

		expect(wrapper.state('hash')).toBe(newHash);

		apiUtils.checkApiAvailability.mockRestore();
	});

	describe('componentDidMount()', () => {
		it('Default flow', async () => {
			jest.spyOn(apiUtils, 'checkApiAvailability').mockClear().mockImplementation(() => Promise.resolve());
			jest.spyOn(apiUtils, 'initialLoad').mockClear().mockImplementation(() => Promise.resolve());
			jest.spyOn(datastore, 'startObserve').mockClear().mockImplementation(() => { });

			const wrapper = shallow(<App.Component />);
			const instance = wrapper.instance();

			await new Promise(resolve => {
				jest.spyOn(instance, 'setState').mockClear().mockImplementation(state => resolve(state));
			});

			expect(apiUtils.checkApiAvailability).toHaveBeenCalledTimes(1);
			expect(apiUtils.initialLoad).toHaveBeenCalledTimes(1);
			expect(apiUtils.initialLoad.mock.calls[0][0]).toEqual(datastore);
			expect(instance.setState).toHaveBeenCalledTimes(1);
			expect(instance.setState.mock.calls[0][0]).toEqual({ loading: false });
			expect(datastore.startObserve).toHaveBeenCalledTimes(1);

			apiUtils.checkApiAvailability.mockRestore();
			apiUtils.initialLoad.mockRestore();
			datastore.startObserve.mockRestore();
		});

		it('"initialLoad" returns error', async () => {
			const error = 'test_error';

			jest.spyOn(apiUtils, 'checkApiAvailability').mockClear().mockImplementation(() => Promise.reject({ type: error }));
			jest.spyOn(apiUtils, 'checkWritePermissions').mockClear().mockImplementation(() => { });
			jest.spyOn(apiUtils, 'initialLoad').mockClear().mockImplementation(() => Promise.resolve());

			const wrapper = shallow(<App.Component />);
			const instance = wrapper.instance();

			await new Promise(resolve => {
				jest.spyOn(instance, 'setState').mockClear().mockImplementation(resolve);
			});

			expect(instance.setState).toHaveBeenCalledTimes(1);
			expect(instance.setState.mock.calls[0][0]).toEqual({ loading: false, error });

			apiUtils.checkApiAvailability.mockRestore();
			apiUtils.checkWritePermissions.mockRestore();
			apiUtils.initialLoad.mockRestore();
		});
	});

	describe('render()', () => {
		it('Loading', async () => {
			jest.spyOn(apiUtils, 'checkApiAvailability').mockClear().mockImplementation(
				() => Promise.reject({ type: '' })
			);

			const wrapper = shallow(<App.Component />);
			const instance = wrapper.instance();

			expect(wrapper.prop('className')).toBe(styles.splash);
			expect(wrapper.find(`.${styles.logo}`)).toHaveLength(1);

			const loader = wrapper.find('Loader');

			expect(loader).toHaveLength(1);
			expect(loader.hasClass(styles.loader)).toBe(true);
			expect(wrapper.find(`.${styles.loading}`)).toHaveLength(1);

			apiUtils.checkApiAvailability.mockRestore();
		});

		it('Loaded', () => {
			jest.spyOn(apiUtils, 'checkApiAvailability').mockClear().mockImplementation(
				() => Promise.reject({ type: '' })
			);

			const wrapper = shallow(<App.Component />);
			wrapper.setState({ loading: false });

			expect(wrapper.prop('className')).toBe(styles.console);
			expect(wrapper.find('Disclaimer')).toHaveLength(0);

			const header = wrapper.find('Header');

			expect(header).toHaveLength(1);
			expect(header.prop('hash')).toBe(wrapper.state('hash'));
			expect(header.prop('navigation')).toBe(true);
			expect(header.prop('statuses')).toBe(STORE.__STATUSES);

			const updatingControl = wrapper.find('UpdatingControl');

			expect(updatingControl).toHaveLength(1);
			expect(updatingControl.prop('play')).toBe(play);
			expect(updatingControl.prop('pause')).toBe(pause);
			expect(updatingControl.prop('update')).toBe(startObserve);

			Object.keys(SECTIONS).forEach(id => {
				wrapper.setState({ hash: id });

				expect(wrapper.find(SECTIONS[id].name)).toHaveLength(1);
			});

			apiUtils.checkApiAvailability.mockRestore();
		});

		it('Errors', () => {
			jest.spyOn(apiUtils, 'checkApiAvailability').mockClear().mockImplementation(
				() => Promise.reject({ type: '' })
			);

			const wrapper = shallow(<App.Component />);
			wrapper.setState({ loading: false });
			const errBlockSelector = `.${styles['error-block']}`;

			expect(wrapper.find(errBlockSelector)).toHaveLength(0);

			wrapper.setState({ error: 'some_unknown_error' });

			expect(wrapper.find(errBlockSelector)).toHaveLength(1);
			expect(wrapper.find(`${errBlockSelector} p`)).toHaveLength(1);
			expect(wrapper.find('Header').prop('navigation')).toBe(false);
			expect(wrapper.find('UpdatingControl')).toHaveLength(0);

			const instance = wrapper.instance();

			Object.keys(instance.errors).forEach(error => {
				wrapper.setState({ error });

				const p = wrapper.find(`${errBlockSelector} p`);

				expect(p).toHaveLength(2);
				expect(p.first().text()).toBe(instance.errors[error]);
			});

			apiUtils.checkApiAvailability.mockRestore();
		});

		it('Demo env', () => {
			jest.spyOn(apiUtils, 'checkApiAvailability').mockClear().mockImplementation(
				() => Promise.reject({ type: '' })
			);
			jest.spyOn(envUtils, 'isDemoEnv').mockClear().mockImplementation(
				() => true
			);

			const wrapper = shallow(<App.Component />);
			wrapper.setState({ loading: false });

			expect(wrapper.find('Disclaimer')).toHaveLength(1);
			apiUtils.checkApiAvailability.mockRestore();
			envUtils.isDemoEnv.mockRestore();
		});
	});
});
