/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';
import NavigationBinded, {
	SECTIONS,
	Navigation
} from '../navigation.jsx';
import Settings from '../../settings/index.jsx';
import Icon from '../../icon/icon.jsx';
import styles from '../style.css';

describe('<Navigation />', () => {
	const defaultStatuses = () => ({
		server_zones: { ready: false },
		location_zones: { ready: false },
		shared_zones: { ready: false },
		caches: { ready: false },
	});
	const readyStatuses = () => ({
		server_zones: { ready: true },
		location_zones: { ready: true },
		shared_zones: { ready: true },
		caches: { ready: true },
	});

	it('constructor()', () => {
		const wrapper = shallow(
			<Navigation
				statuses={ defaultStatuses() }
				hash="#"
			/>
		);
		const openSettingsSpy = spy(Navigation.prototype.openSettings, 'bind');
		const closeSettingsSpy = spy(Navigation.prototype.closeSettings, 'bind');

		wrapper.instance().constructor();

		expect(wrapper.state(), 'state').to.be.deep.equal({ settings: false });
		expect(openSettingsSpy.calledOnce, 'openSettings.bind called once').to.be.true;
		expect(openSettingsSpy.args[0][0] instanceof Navigation, 'openSettings.bind 1st arg').to.be.true;
		expect(closeSettingsSpy.calledOnce, 'closeSettings.bind called once').to.be.true;
		expect(closeSettingsSpy.args[0][0] instanceof Navigation, 'closeSettings.bind 1st arg').to.be.true;

		openSettingsSpy.restore();
		closeSettingsSpy.restore();

		wrapper.unmount();
	});

	it('openSettings()', () => {
		const wrapper = shallow(
			<Navigation
				statuses={ defaultStatuses() }
				hash="#"
			/>
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');
		const closeStub = stub(instance, 'closeSettings').callsFake(() => {});

		instance.openSettings();
		wrapper.update();

		expect(stateSpy, 'setState called once').to.be.calledOnce;
		expect(stateSpy.args[0][0], 'setState 1st arg').to.be.deep.equal({
			settings: true
		});
		expect(closeStub.notCalled, 'closeSettings not called').to.be.true;

		instance.openSettings();

		expect(stateSpy, 'setState called once').to.be.calledOnce;
		expect(closeStub, 'closeSettings called once').to.be.calledOnce;

		stateSpy.restore();
		closeStub.restore();
		wrapper.unmount();
	});

	it('closeSettings()', () => {
		const wrapper = shallow(
			<Navigation
				statuses={ defaultStatuses() }
				hash="#"
			/>
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');

		instance.closeSettings();

		expect(stateSpy.calledOnce, 'setState called once').to.be.true;
		expect(stateSpy.args[0][0], 'setState 1st arg').to.be.deep.equal({
			settings: false
		});

		stateSpy.restore();
		wrapper.unmount();
	});

	describe('render()', () => {
		it('no tabs', () => {
			const wrapper = shallow(
				<Navigation
					statuses={ defaultStatuses() }
					hash="#"
				/>
			);
			const container = wrapper.find(`.${ styles['nav'] }`);
			const tabs = container.find(`.${ styles['nav-flex'] }`);
			const settings = container.find(`.${ styles['settings'].split(' ').join('.') }`);
			const settingsIcon = settings.find('Icon');

			expect(container.length, 'container length').to.be.equal(1);
			expect(container.prop('className'), 'container small CN modifier').to.include(styles['nav-small']);
			expect(container.prop('className'), 'container wide CN modifier').to.not.include(styles['nav-wide']);
			expect(tabs.length, 'tabs container length').to.be.equal(1);
			expect(tabs.children().length, 'tabs length').to.be.equal(0);
			expect(settings.length, 'settings length').to.be.equal(1);
			expect(settings.prop('onClick').name, 'settings onClick handler').to.be.equal('bound openSettings');
			expect(settingsIcon.length, 'settings icon length').to.be.equal(1);
			expect(settingsIcon.props(), 'settings icon props').to.be.deep.equal({
				children: [],
				type: 'gear'
			});
			expect(container.find(Settings).length, 'Settings length').to.be.equal(0);

			wrapper.unmount();
		});

		it('tabs <= 1', () => {
			const customStatuses = defaultStatuses();

			const wrapper = shallow(
				<Navigation
					statuses={ customStatuses }
					hash="#"
				/>
			);
			const container = wrapper.find(`.${ styles['nav'] }`);

			expect(container.length, 'container length').to.be.equal(1);
			expect(container.prop('className'), 'container small CN modifier').to.include(styles['nav-small']);
			expect(container.prop('className'), 'container wide CN modifier').to.not.include(styles['nav-wide']);

			wrapper.unmount();
		});

		describe('tabs', () => {
			it('link structure', () => {
				const customStatuses = defaultStatuses();

				customStatuses.server_zones.ready = true;

				const wrapper = shallow(
					<Navigation
						statuses={ customStatuses }
						hash="#"
					/>
				);
				const section = SECTIONS.find(({ statusKey }) => statusKey === 'server_zones');
				const link = wrapper.find(`a.${ styles['navlink'] }`);

				expect(link.prop('href'), 'link href').to.be.equal(section.hash);
				expect(link.prop('title'), 'link title').to.be.equal(section.title);
				expect(link.find(`span.${ styles['anchor'] }`).text(), 'link anchor').to.be.equal(section.title);

				wrapper.unmount();
			});

			([ 'server_zones', 'location_zones' ]).map(statusKey => {
				it(`${ statusKey } ready`, () => {
					const customStatuses = defaultStatuses();

					customStatuses[statusKey].ready = true;

					const wrapper = shallow(
						<Navigation
							statuses={ customStatuses }
							hash="#"
						/>
					);
					const link = wrapper.find(`a.${ styles['navlink'] }`);
					const section = SECTIONS.find(({ statusKey }) => statusKey === 'server_zones');

					expect(link.length, 'link length').to.be.equal(1);
					expect(link.prop('href'), 'link href').to.be.equal(section.hash);

					wrapper.unmount();
				});
			});

			it('all ready (+ checking hash)', () => {
				const wrapper = shallow(
					<Navigation
						statuses={ readyStatuses() }
						hash="#caches"
					/>
				);
				const link = wrapper.find(`a.${ styles['navlink'] }`);

				SECTIONS.forEach(({ hash, statusKey }) => {
					const _link = link.filter(`[href="${ hash }"]`);

					expect(_link.length, `link for "${ statusKey }"`).to.be.equal(1);

					if (statusKey === 'caches') {
						expect(_link.prop('className'), 'active link className [caches]')
							.to.be.equal(styles['navlinkactive']);
					} else {
						expect(_link.prop('className'), `inactive link className [${ statusKey }]`)
							.to.be.equal(styles['navlink']);
					}
				});

				wrapper.unmount();
			});

			// TODO: Change after add other widgets
			// it('all statuses', () => {
			// 	const customStatuses = readyStatuses();
			//
			// 	customStatuses.server_zones.status = 'ok';
			// 	customStatuses.shared_zones.status = 'warning';
			// 	customStatuses.zone_sync.status = 'danger';
			// 	customStatuses.resolvers.status = 'ok';
			//
			// 	const wrapper = shallow(
			// 		<Navigation
			// 			statuses={ customStatuses }
			// 			hash="#"
			// 		/>
			// 	);
			// 	const icons = wrapper.find(`.${ styles['nav-flex'] }`).find('Icon');
			//
			// 	expect(icons.length, 'icons length').to.be.equal(4);
			//
			// 	icons.forEach(icon => {
			// 		let statusKey = icon.parent().prop('href').substr(1);
			//
			// 		if (statusKey === 'cluster') {
			// 			statusKey = 'zone_sync';
			// 		}
			//
			// 		expect(icon.prop('className'), `icon className [${ statusKey }]`).to.be.equal(styles['status']);
			// 		expect(icon.prop('type'), `icon type [${ statusKey }]`).to.be.equal(
			// 			statusKey === 'shared_zones' ?
			// 				'warning'
			// 			: statusKey === 'zone_sync' ?
			// 				'danger'
			// 			: 'ok'
			// 		);
			// 	});
			//
			// 	wrapper.unmount();
			// });

			it('statuses of server and location zones', () => {
				const customStatuses = readyStatuses();

				customStatuses.location_zones.status = 'test_status';

				const wrapper = shallow(
					<Navigation
						statuses={ customStatuses }
						hash="#"
					/>
				);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).length, 'undefined|test_status')
					.to.be.equal(0);

				customStatuses.server_zones.status = 'ok';
				wrapper.setProps(customStatuses);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).prop('type'), 'ok|test_status')
					.to.be.equal('ok');

				customStatuses.server_zones.status = 'test_status';
				customStatuses.location_zones.status = 'ok';
				wrapper.setProps(customStatuses);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).prop('type'), 'test_status|ok')
					.to.be.equal('test_status');

				customStatuses.server_zones.status = 'ok';
				customStatuses.location_zones.status = 'warning';
				wrapper.setProps(customStatuses);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).prop('type'), 'ok|warning')
					.to.be.equal('warning');

				customStatuses.server_zones.status = 'warning';
				customStatuses.location_zones.status = 'ok';
				wrapper.setProps(customStatuses);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).prop('type'), 'warning|ok')
					.to.be.equal('warning');

				customStatuses.server_zones.status = 'warning';
				customStatuses.location_zones.status = 'warning';
				wrapper.setProps(customStatuses);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).prop('type'), 'warning|warning')
					.to.be.equal('warning');

				customStatuses.server_zones.status = 'ok';
				customStatuses.location_zones.status = 'danger';
				wrapper.setProps(customStatuses);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).prop('type'), 'ok|danger')
					.to.be.equal('danger');

				customStatuses.server_zones.status = 'danger';
				customStatuses.location_zones.status = 'ok';
				wrapper.setProps(customStatuses);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).prop('type'), 'danger|ok')
					.to.be.equal('danger');

				customStatuses.server_zones.status = 'danger';
				customStatuses.location_zones.status = 'danger';
				wrapper.setProps(customStatuses);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).prop('type'), 'danger|danger')
					.to.be.equal('danger');

				customStatuses.server_zones.status = 'danger';
				customStatuses.location_zones.status = 'warning';
				wrapper.setProps(customStatuses);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).prop('type'), 'danger|warning')
					.to.be.equal('danger');

				customStatuses.server_zones.status = 'warning';
				customStatuses.location_zones.status = 'danger';
				wrapper.setProps(customStatuses);

				expect(wrapper.find(`a[href="#server_zones"] Icon`).prop('type'), 'warning|danger')
					.to.be.equal('danger');

				wrapper.unmount();
			});
		});

		it('<Settings />', () => {
			const statuses = defaultStatuses();
			const wrapper = shallow(
				<Navigation
					statuses={ statuses }
					hash="#"
				/>
			);

			wrapper.setState({ settings: true });

			const settings = wrapper.find('Settings');

			expect(settings.length, 'Settings length').to.be.equal(1);
			expect(settings.prop('statuses'), 'Settings statuses prop').to.be.deep.equal(statuses);
			expect(settings.prop('close').name, 'Settings close prop').to.be.equal('bound closeSettings');

			wrapper.unmount();
		});
	});
});
