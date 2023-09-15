/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import NavigationBinded, {
	SECTIONS,
	Navigation
} from '../navigation.jsx';
import Settings from '../../settings/index.jsx';
import styles from '../style.css';

describe('<Navigation />', () => {
	const defaultStatuses = () => ({
		server_zones: { ready: false },
		location_zones: { ready: false },
		shared_zones: { ready: false },
		caches: { ready: false },
		upstreams: { ready: false },
		resolvers: { ready: false },
		tcp_zones: { ready: false },
		tcp_upstreams: { ready: false }
	});
	const readyStatuses = () => ({
		server_zones: { ready: true },
		location_zones: { ready: true },
		shared_zones: { ready: true },
		caches: { ready: true },
		upstreams: { ready: true },
		tcp_upstreams: { ready: true },
		resolvers: { ready: true },
		tcp_zones: { ready: true }
	});

	it('constructor()', () => {
		const wrapper = shallow(
			<Navigation
				statuses={defaultStatuses()}
				hash="#"
			/>
		);
		const openSettingsSpy = jest.spyOn(Navigation.prototype.openSettings, 'bind').mockClear();
		const closeSettingsSpy = jest.spyOn(Navigation.prototype.closeSettings, 'bind').mockClear();

		wrapper.instance().constructor();

		// state
		expect(wrapper.state()).toEqual({ settings: false });
		// openSettings.bind called once
		expect(openSettingsSpy).toHaveBeenCalled();
		// openSettings.bind 1st arg
		expect(openSettingsSpy.mock.calls[0][0] instanceof Navigation).toBe(true);
		// closeSettings.bind called once
		expect(closeSettingsSpy).toHaveBeenCalled();
		// closeSettings.bind 1st arg
		expect(closeSettingsSpy.mock.calls[0][0] instanceof Navigation).toBe(true);

		openSettingsSpy.mockRestore();
		closeSettingsSpy.mockRestore();

		wrapper.unmount();
	});

	it('openSettings()', () => {
		const wrapper = shallow(
			<Navigation
				statuses={defaultStatuses()}
				hash="#"
			/>
		);
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();
		const closeStub = jest.spyOn(instance, 'closeSettings').mockClear().mockImplementation(() => {});

		instance.openSettings();
		wrapper.update();

		// setState called once
		expect(stateSpy).toHaveBeenCalledTimes(1);
		// setState 1st arg
		expect(stateSpy.mock.calls[0][0]).toEqual({
			settings: true
		});
		// closeSettings not called
		expect(closeStub).not.toHaveBeenCalled();

		instance.openSettings();

		// setState called once
		expect(stateSpy).toHaveBeenCalledTimes(1);
		// closeSettings called once
		expect(closeStub).toHaveBeenCalledTimes(1);

		stateSpy.mockRestore();
		closeStub.mockRestore();
		wrapper.unmount();
	});

	it('closeSettings()', () => {
		const wrapper = shallow(
			<Navigation
				statuses={defaultStatuses()}
				hash="#"
			/>
		);
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.closeSettings();

		// setState called once
		expect(stateSpy).toHaveBeenCalled();
		// setState 1st arg
		expect(stateSpy.mock.calls[0][0]).toEqual({
			settings: false
		});

		stateSpy.mockRestore();
		wrapper.unmount();
	});

	describe('render()', () => {
		it('no tabs', () => {
			const wrapper = shallow(
				<Navigation
					statuses={defaultStatuses()}
					hash="#"
				/>
			);
			const container = wrapper.find(`.${ styles.nav }`);
			const tabs = container.find(`.${ styles['nav-flex'] }`);
			const settings = container.find(`.${ styles.settings.split(' ').join('.') }`);
			const settingsIcon = settings.find('Icon');

			// container length
			expect(container.length).toBe(1);
			// container small CN modifier
			expect(container.prop('className')).toContain(styles['nav-small']);
			// container wide CN modifier
			expect(container.prop('className')).not.toContain(styles['nav-wide']);
			// tabs container length
			expect(tabs.length).toBe(1);
			// tabs length
			expect(tabs.children().length).toBe(0);
			// settings length
			expect(settings.length).toBe(1);
			// settings onClick handler
			expect(settings.prop('onClick').name).toBe('bound openSettings');
			// settings icon length
			expect(settingsIcon.length).toBe(1);
			// settings icon props
			expect(settingsIcon.props()).toEqual({
				children: [],
				type: 'gear'
			});
			// Settings length
			expect(container.find(Settings).length).toBe(0);

			wrapper.unmount();
		});

		it('tabs <= 1', () => {
			const customStatuses = defaultStatuses();

			const wrapper = shallow(
				<Navigation
					statuses={customStatuses}
					hash="#"
				/>
			);
			const container = wrapper.find(`.${ styles.nav }`);

			// container length
			expect(container.length).toBe(1);
			// container small CN modifier
			expect(container.prop('className')).toContain(styles['nav-small']);
			// container wide CN modifier
			expect(container.prop('className')).not.toContain(styles['nav-wide']);

			wrapper.unmount();
		});

		describe('tabs', () => {
			it('link structure', () => {
				const customStatuses = defaultStatuses();

				customStatuses.server_zones.ready = true;

				const wrapper = shallow(
					<Navigation
						statuses={customStatuses}
						hash="#"
					/>
				);
				const section = SECTIONS.find(({ statusKey }) => statusKey === 'server_zones');
				const link = wrapper.find(`a.${ styles.navlink }`);

				// link href
				expect(link.prop('href')).toBe(section.hash);
				// link title
				expect(link.prop('title')).toBe(section.title);
				// link anchor
				expect(link.find(`span.${ styles.anchor }`).text()).toBe(section.title);

				wrapper.unmount();
			});

			([ 'server_zones', 'location_zones' ]).map(statusKey => {
				it(`${ statusKey } ready`, () => {
					const customStatuses = defaultStatuses();

					customStatuses[statusKey].ready = true;

					const wrapper = shallow(
						<Navigation
							statuses={customStatuses}
							hash="#"
						/>
					);
					const link = wrapper.find(`a.${ styles.navlink }`);
					const section = SECTIONS.find(({ statusKey }) => statusKey === 'server_zones');

					// link length
					expect(link.length).toBe(1);
					// link href
					expect(link.prop('href')).toBe(section.hash);

					wrapper.unmount();
				});
			});

			it('all ready (+ checking hash)', () => {
				const wrapper = shallow(
					<Navigation
						statuses={readyStatuses()}
						hash="#caches"
					/>
				);
				const link = wrapper.find('a');

				SECTIONS.forEach(({ hash, statusKey }) => {
					const _link = link.filter(`[href="${ hash }"]`);

					// link for "${ statusKey }"
					expect(_link.length).toBe(1);

					if (statusKey === 'caches') {
						// active link className [caches]
						expect(_link.prop('className')).toBe(styles.navlinkactive);
					} else {
						// inactive link className [${ statusKey }]
						expect(_link.prop('className')).toBe(styles.navlink);
					}
				});

				wrapper.unmount();
			});

			it('all statuses', () => {
				const customStatuses = readyStatuses();

				customStatuses.server_zones.status = 'ok';
				customStatuses.shared_zones.status = 'warning';
				customStatuses.tcp_zones.status = 'danger';
				customStatuses.resolvers.status = 'ok';

				const wrapper = shallow(
					<Navigation
						statuses={customStatuses}
						hash="#"
					/>
				);
				const icons = wrapper.find(`.${ styles['nav-flex'] }`).find('Icon');

				// icons length
				expect(icons.length).toBe(4);

				icons.forEach(icon => {
					let statusKey = icon.parent().prop('href').substr(1);

					if (statusKey === 'cluster') {
						statusKey = 'tcp_zones';
					}

					// icon className [${ statusKey }]
					expect(icon.prop('className')).toBe(styles.status);
					// icon type [${ statusKey }]
					expect(icon.prop('type')).toBe(statusKey === 'shared_zones' ?
						'warning'
						: statusKey === 'tcp_zones' ?
							'danger'
							: 'ok');
				});

				wrapper.unmount();
			});

			it('statuses of server and location zones', () => {
				const customStatuses = readyStatuses();

				customStatuses.location_zones.status = 'test_status';

				const wrapper = shallow(
					<Navigation
						statuses={customStatuses}
						hash="#"
					/>
				);

				// undefined|test_status
				expect(wrapper.find('a[href="#server_zones"] Icon').length).toBe(0);

				customStatuses.server_zones.status = 'ok';
				wrapper.setProps(customStatuses);

				// ok|test_status
				expect(wrapper.find('a[href="#server_zones"] Icon').prop('type')).toBe('ok');

				customStatuses.server_zones.status = 'test_status';
				customStatuses.location_zones.status = 'ok';
				wrapper.setProps(customStatuses);

				// test_status|ok
				expect(wrapper.find('a[href="#server_zones"] Icon').prop('type')).toBe('test_status');

				customStatuses.server_zones.status = 'ok';
				customStatuses.location_zones.status = 'warning';
				wrapper.setProps(customStatuses);

				// ok|warning
				expect(wrapper.find('a[href="#server_zones"] Icon').prop('type')).toBe('warning');

				customStatuses.server_zones.status = 'warning';
				customStatuses.location_zones.status = 'ok';
				wrapper.setProps(customStatuses);

				// warning|ok
				expect(wrapper.find('a[href="#server_zones"] Icon').prop('type')).toBe('warning');

				customStatuses.server_zones.status = 'warning';
				customStatuses.location_zones.status = 'warning';
				wrapper.setProps(customStatuses);

				// warning|warning
				expect(wrapper.find('a[href="#server_zones"] Icon').prop('type')).toBe('warning');

				customStatuses.server_zones.status = 'ok';
				customStatuses.location_zones.status = 'danger';
				wrapper.setProps(customStatuses);

				// ok|danger
				expect(wrapper.find('a[href="#server_zones"] Icon').prop('type')).toBe('danger');

				customStatuses.server_zones.status = 'danger';
				customStatuses.location_zones.status = 'ok';
				wrapper.setProps(customStatuses);

				// danger|ok
				expect(wrapper.find('a[href="#server_zones"] Icon').prop('type')).toBe('danger');

				customStatuses.server_zones.status = 'danger';
				customStatuses.location_zones.status = 'danger';
				wrapper.setProps(customStatuses);

				// danger|danger
				expect(wrapper.find('a[href="#server_zones"] Icon').prop('type')).toBe('danger');

				customStatuses.server_zones.status = 'danger';
				customStatuses.location_zones.status = 'warning';
				wrapper.setProps(customStatuses);

				// danger|warning
				expect(wrapper.find('a[href="#server_zones"] Icon').prop('type')).toBe('danger');

				customStatuses.server_zones.status = 'warning';
				customStatuses.location_zones.status = 'danger';
				wrapper.setProps(customStatuses);

				// warning|danger
				expect(wrapper.find('a[href="#server_zones"] Icon').prop('type')).toBe('danger');

				wrapper.unmount();
			});
		});

		it('<Settings />', () => {
			const statuses = defaultStatuses();
			const wrapper = shallow(
				<Navigation
					statuses={statuses}
					hash="#"
				/>
			);

			wrapper.setState({ settings: true });

			const settings = wrapper.find('Settings');

			// Settings length
			expect(settings.length).toBe(1);
			// Settings statuses prop
			expect(settings.prop('statuses')).toEqual(statuses);
			// Settings close prop
			expect(settings.prop('close').name).toBe('bound closeSettings');

			wrapper.unmount();
		});
	});
});
