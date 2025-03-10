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
import { mount, shallow } from 'enzyme';
import UpstreamsList, { FILTER_OPTIONS } from '../upstreamslist.jsx';
import SortableTable from '../../table/sortabletable.jsx';
import appsettings from '../../../appsettings';
import { apiUtils } from '../../../api';
import envUtils from '../../../env';
import tooltips from '../../../tooltips/index.jsx';
import styles from '../style.css';
import tableStyles from '../../table/style.css';

beforeEach(() => {
	jest.restoreAllMocks();
});

describe('<UpstreamsList />', () => {
	const props = {
		upstream: {
			peers: []
		}
	};

	it('extends SortableTable', () => {
		expect(UpstreamsList.prototype instanceof SortableTable).toBe(true);
	});

	it('constructor()', () => {
		jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => 'get_settings_result');
		UpstreamsList.prototype.FILTERING_SETTINGS_KEY = 'FILTERING_SETTINGS_KEY';
		const toggleEditModeSpy = jest.spyOn(UpstreamsList.prototype.toggleEditMode, 'bind').mockClear();
		const changeFilterRuleSpy = jest.spyOn(UpstreamsList.prototype.changeFilterRule, 'bind').mockClear();
		const addUpstreamSpy = jest.spyOn(UpstreamsList.prototype.addUpstream, 'bind').mockClear();
		const editSelectedUpstreamSpy = jest.spyOn(UpstreamsList.prototype.editSelectedUpstream, 'bind').mockClear();
		const showEditorSpy = jest.spyOn(UpstreamsList.prototype.showEditor, 'bind').mockClear();
		const closeEditorSpy = jest.spyOn(UpstreamsList.prototype.closeEditor, 'bind').mockClear();
		const selectAllServersSpy = jest.spyOn(UpstreamsList.prototype.selectAllServers, 'bind').mockClear();
		const selectPeerSpy = jest.spyOn(UpstreamsList.prototype.selectPeer, 'bind').mockClear();
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);

		// state editMode
		expect(wrapper.state('editMode')).toBe(false);
		// state editor
		expect(wrapper.state('editor')).toBe(false);
		// state selectedPeers
		expect(wrapper.state('selectedServers')).toBeInstanceOf(Map);
		// state selectedPeers size
		expect(wrapper.state('selectedServers').size).toBe(0);
		// state filtering
		expect(wrapper.state('filtering')).toBe('get_settings_result');

		// getSetting called
		expect(appsettings.getSetting).toHaveBeenCalled();
		// getSetting call args
		expect(appsettings.getSetting).toHaveBeenCalledWith('FILTERING_SETTINGS_KEY', 'all');

		// this.toggleEditMode.bind called once
		expect(toggleEditModeSpy).toHaveBeenCalled();
		// this.toggleEditMode.bind arg
		expect(toggleEditModeSpy.mock.calls[0][0] instanceof UpstreamsList).toBe(true);
		// this.changeFilterRule.bind called once
		expect(changeFilterRuleSpy).toHaveBeenCalled();
		// this.changeFilterRule.bind arg
		expect(changeFilterRuleSpy.mock.calls[0][0] instanceof UpstreamsList).toBe(true);
		// this.addUpstream.bind called once
		expect(addUpstreamSpy).toHaveBeenCalled();
		// this.addUpstream.bind arg
		expect(addUpstreamSpy.mock.calls[0][0] instanceof UpstreamsList).toBe(true);
		// this.editSelectedUpstream.bind called once
		expect(editSelectedUpstreamSpy).toHaveBeenCalled();
		// this.editSelectedUpstream.bind arg
		expect(editSelectedUpstreamSpy.mock.calls[0][0] instanceof UpstreamsList).toBe(true);
		// this.showEditor.bind called once
		expect(showEditorSpy).toHaveBeenCalled();
		// this.showEditor.bind arg
		expect(showEditorSpy.mock.calls[0][0] instanceof UpstreamsList).toBe(true);
		// this.closeEditor.bind called once
		expect(closeEditorSpy).toHaveBeenCalled();
		// this.closeEditor.bind arg
		expect(closeEditorSpy.mock.calls[0][0] instanceof UpstreamsList).toBe(true);
		// this.selectAllServers.bind called once
		expect(selectAllServersSpy).toHaveBeenCalled();
		// this.selectAllServers.bind arg
		expect(selectAllServersSpy.mock.calls[0][0] instanceof UpstreamsList).toBe(true);
		// this.selectPeer.bind called once
		expect(selectPeerSpy).toHaveBeenCalled();
		// this.selectPeer.bind arg
		expect(selectPeerSpy.mock.calls[0][0] instanceof UpstreamsList).toBe(true);

		toggleEditModeSpy.mockRestore();
		changeFilterRuleSpy.mockRestore();
		addUpstreamSpy.mockRestore();
		editSelectedUpstreamSpy.mockRestore();
		showEditorSpy.mockRestore();
		closeEditorSpy.mockRestore();
		selectAllServersSpy.mockRestore();
		selectPeerSpy.mockRestore();
		UpstreamsList.prototype.FILTERING_SETTINGS_KEY = undefined;
		appsettings.getSetting.mockRestore();
	});

	it('toggleEditMode()', () => {
		const upstream = {
			name: '%!£@$',
			peers: [{ name: '127.0.0.1' }]
		};
		const wrapper = shallow(
			<UpstreamsList
				upstreamsApi={{
					getServers: jest.fn()
						.mockResolvedValueOnce(null)
						.mockResolvedValueOnce({})
						.mockResolvedValueOnce({ '127.0.0.1': { weight: 1 } })
				}}
				upstream={upstream}
			/>
		);
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();

		jest.spyOn(window, 'alert').mockClear().mockImplementation(() => { });

		instance.toggleEditMode();

		// alert called
		expect(window.alert).toHaveBeenCalled();
		// this.setState not called
		expect(stateSpy).not.toHaveBeenCalled();

		window.alert.mockReset();
		upstream.name = 'test_1';
		wrapper.setProps({ upstream });

		jest.spyOn(apiUtils, 'isAngiePro').mockClear().mockImplementation(() => true);

		jest.spyOn(instance, 'toggleEditMode').mockClear().mockImplementation(() => { });
		instance.toggleEditMode();

		// this.toggleEditMode called
		expect(instance.toggleEditMode).toHaveBeenCalled();
		// alert not called
		expect(window.alert).not.toHaveBeenCalled();

		stateSpy.mockRestore();
		window.alert.mockRestore();
		apiUtils.isAngiePro.mockRestore();
		wrapper.unmount();
	});
	it('editSelectedUpstream()', () => {
		const wrapper = mount(
			<UpstreamsList upstream={{ name: 'backend-upstream', peers: [{ name: '127.0.0.1' }] }} />
		);
		wrapper.setState({
			editMode: true,
			servers: new Map([[['example.backend.com', '127.0.0.1'], { weight: 5 }]]),
			selectedServers: new Map()
		});
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();

		jest.spyOn(instance, 'showEditor').mockClear().mockImplementation(() => { });

		instance.editSelectedUpstream();

		// [no peer, no selectedPeers] this.setState not called
		expect(stateSpy).not.toHaveBeenCalled();
		// [no peer, no selectedPeers] this.showEditor not called
		expect(instance.showEditor).not.toHaveBeenCalled();

		instance.editSelectedUpstream('example.backend.com', { weight: 5 });
		// wrapper.update();

		// [with peer, no selectedPeers] this.setState called once
		expect(stateSpy).toHaveBeenCalled();
		// [with peer, no selectedPeers] this.setState call args
		expect(stateSpy.mock.calls[0][0]).toEqual({
			selectedServers: new Map([['example.backend.com', { weight: 5 }]])
		});
		// [with peer, no selectedPeers] this.showEditor called once
		expect(instance.showEditor).toHaveBeenCalled();
		// [with peer, no selectedPeers] this.showEditor call args
		expect(instance.showEditor.mock.calls[0][0]).toBe('edit');

		stateSpy.mockRestore();
		instance.showEditor.mockRestore();
		wrapper.unmount();
	});

	it('addUpstream()', () => {
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'showEditor').mockClear().mockImplementation(() => { });

		instance.addUpstream();

		// this.showEditor called
		expect(instance.showEditor).toHaveBeenCalled();
		// this.showEditor call args
		expect(instance.showEditor.mock.calls[0][0]).toBe('add');

		instance.showEditor.mockRestore();
		wrapper.unmount();
	});

	it('closeEditor()', () => {
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.closeEditor();

		// this.setState called
		expect(stateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(stateSpy.mock.calls[0][0]).toEqual({
			editor: null
		});

		stateSpy.mockRestore();
		wrapper.unmount();
	});

	it('showEditor()', () => {
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.showEditor('test_mode');

		// this.setState called
		expect(stateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(stateSpy.mock.calls[0][0]).toEqual({
			editor: 'test_mode'
		});

		stateSpy.mockRestore();
		wrapper.unmount();
	});

	it('changeFilterRule()', () => {
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();

		jest.spyOn(appsettings, 'setSetting').mockClear().mockImplementation(() => { });

		instance.FILTERING_SETTINGS_KEY = 'FILTERING_SETTINGS_KEY';
		instance.changeFilterRule({ target: { value: 'test_value' } });

		// appsettings.setSetting called once
		expect(appsettings.setSetting).toHaveBeenCalled();
		// appsettings.setSetting call arguments
		expect(appsettings.setSetting).toHaveBeenCalledWith('FILTERING_SETTINGS_KEY', 'test_value');
		// this.setState called
		expect(stateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(stateSpy.mock.calls[0][0]).toEqual({
			filtering: 'test_value'
		});

		stateSpy.mockRestore();
		appsettings.setSetting.mockRestore();
		wrapper.unmount();
	});

	it('renderEmptyList()', () => {
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);

		wrapper.setState({ filtering: 'filtering_test' });

		const emptyList = shallow(
			wrapper.instance().renderEmptyList()
		);

		// empty list html tag
		expect(emptyList.name()).toBe('tr');
		// empty list text
		expect(emptyList.text()).toBe("No servers found in this upstream group ''.");
		// empty list, child className
		expect(emptyList.childAt(0).prop('className')).toBe(tableStyles['left-align']);
		// empty list, child colSpan
		expect(emptyList.childAt(0).prop('colSpan')).toBe(30);

		wrapper.unmount();
	});

	it('filterPeers()', () => {
		const peers = [
			{ state: 'up' },
			{ state: 'unavail' },
			{ state: 'unhealthy' },
			{ state: 'busy' },
			{ state: 'checking' },
			{ state: 'down' }
		];
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);
		const instance = wrapper.instance();

		wrapper.setState({ filtering: 'up' });

		// [default filtering] up filtering
		expect(instance.filterPeers(peers)).toEqual([{ state: 'up' }]);
		// failed filtering
		expect(instance.filterPeers(peers, 'failed')).toEqual([
			{ state: 'unavail' },
			{ state: 'unhealthy' },
			{ state: 'busy' }
		]);
		// checking filtering
		expect(instance.filterPeers(peers, 'checking')).toEqual([{ state: 'checking' }]);
		// down filtering
		expect(instance.filterPeers(peers, 'down')).toEqual([{ state: 'down' }]);
		// all filtering
		expect(instance.filterPeers(peers, 'all')).toEqual(peers);

		wrapper.unmount();
	});

	it('selectAllServers()', async () => {
		const servers = new Map([[['example.backend.com', '127.0.0.1'], { weight: 5 }]]);
		const wrapper = mount(
			<UpstreamsList upstream={{ name: 'backend-upstream', peers: [{ name: '127.0.0.1' }] }} />
		);
		wrapper.setState({
			editMode: true,
			servers,
			selectedServers: new Map()
		});
		wrapper.update();
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.selectAllServers();

		// [reset selected] this.setState called
		expect(stateSpy).toHaveBeenCalled();
		// [reset selected] this.setState call arg
		expect(stateSpy.mock.calls[0][0]).toEqual({
			selectedServers: new Map(Array.from(servers).map(([[serverName], server]) => [serverName, server]))
		});

		wrapper.update();
		wrapper.instance().selectAllServers();

		expect(stateSpy.mock.calls[1][0]).toEqual({
			selectedServers: new Map()
		});

		stateSpy.mockRestore();
		wrapper.unmount();
	});

	it('selectPeer()', () => {
		const peers = [
			{ id: 'test_1' }
		];
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.selectPeer(peers[0], true);

		// [select peer] this.setState called
		expect(stateSpy).toHaveBeenCalled();
		// [select peer] this.setState call arg
		expect(stateSpy.mock.calls[0][0]).toEqual({
			selectedPeers: new Map([
				['test_1', peers[0]]
			])
		});

		stateSpy.mockReset();
		instance.selectPeer(peers[0]);

		// [unselect peer] this.setState called
		expect(stateSpy).toHaveBeenCalled();
		// [unselect peer] this.setState call arg
		expect(stateSpy.mock.calls[0][0]).toEqual({
			selectedPeers: new Map()
		});

		stateSpy.mockRestore();
		wrapper.unmount();
	});

	it('getSelectAllCheckbox()', () => {
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'selectAllServers').mockClear().mockImplementation(() => 'selectAllPeers_result');

		expect(instance.getSelectAllCheckbox()).toBeNull();

		wrapper.setState({ editMode: true });

		const checkbox = shallow(instance.getSelectAllCheckbox());

		// checkbox html tag
		expect(checkbox.name()).toBe('th');
		// checkbox rowSpan
		expect(checkbox.prop('rowSpan')).toBe('2');
		// checkbox className
		expect(checkbox.prop('className')).toBe(tableStyles.checkbox);
		// checkbox, input html tag
		expect(checkbox.childAt(0).name()).toBe('input');
		// checkbox, input type
		expect(checkbox.childAt(0).prop('type')).toBe('checkbox');
		// [peers same as selectedPeers] checkbox, input checked
		expect(checkbox.childAt(0).prop('checked')).toBe(true);
		expect(checkbox.childAt(0).prop('onChange')).toBeInstanceOf(Function);
		// checkbox, input onChange return
		expect(checkbox.childAt(0).prop('onChange')({
			target: { checked: 'target_checked' }
		})).toBe('selectAllPeers_result');
		// this.selectAllServers called once
		expect(instance.selectAllServers).toHaveBeenCalled();

		instance.selectAllServers.mockRestore();
		wrapper.unmount();
	});

	it('getCheckbox()', () => {
		const peer = { id: 'test_1' };
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'selectPeer').mockClear().mockImplementation(() => 'selectPeer_result');

		expect(instance.getCheckbox()).toBeNull();

		wrapper.setState({ editMode: true });

		let checkbox = shallow(instance.getCheckbox(peer));

		// checkbox html tag
		expect(checkbox.name()).toBe('td');
		// checkbox className
		expect(checkbox.prop('className')).toBe(tableStyles.checkbox);
		// checkbox, input html tag
		expect(checkbox.childAt(0).name()).toBe('input');
		// checkbox, input type
		expect(checkbox.childAt(0).prop('type')).toBe('checkbox');
		// [peer IS NOT in selectedPeers] checkbox, input checked
		expect(checkbox.childAt(0).prop('checked')).toBe(false);
		expect(checkbox.childAt(0).prop('onChange')).toBeInstanceOf(Function);
		// checkbox, input onChange return
		expect(checkbox.childAt(0).prop('onChange')({
			target: { checked: 'target_checked' }
		})).toBe('selectPeer_result');
		// this.selectPeer called once
		expect(instance.selectPeer).toHaveBeenCalled();
		// this.selectPeer call arguments
		expect(instance.selectPeer).toHaveBeenCalledWith(peer, 'target_checked');

		wrapper.setState({
			selectedPeers: new Map([
				[peer.id, peer]
			])
		});
		checkbox = shallow(instance.getCheckbox(peer));

		// [peer IS in selectedPeers] checkbox, input checked
		expect(checkbox.childAt(0).prop('checked')).toBe(true);

		instance.selectPeer.mockRestore();
		wrapper.unmount();
	});

	describe('renderEditButton()', () => {
		const props = {
			name: 'test_name',
			upstream: {
				peers: [
					{ id: 'test_1', state: 'up' },
					{ id: 'test_2', state: 'unavail' },
					{ id: 'test_3', state: 'unhealthy' },
					{ id: 'test_4', state: 'checking' },
					{ id: 'test_5', state: 'down' }
				],
				zoneSize: null,
				slab: 'slab_test'
			},
			showOnlyFailed: false,
			isStream: false,
			upstreamsApi: 'upstreamsApi_test'
		};
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);
		const instance = wrapper.instance();

		afterAll(() => {
			wrapper.unmount();
		});

		it('isDemoEnv = true', () => {
			jest.spyOn(envUtils, 'isDemoEnv').mockClear().mockImplementation(() => true);
			jest.spyOn(apiUtils, 'isAngiePro').mockClear().mockImplementation(() => false);
			jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({
				prop_from_useTooltip: true
			}));
			const editButton = shallow(instance.renderEditButton());

			// has class
			expect(editButton.prop('className')).toBe(styles['edit-label']);
			// has class
			expect(editButton.childAt(0).prop('className')).toBe(styles['edit-icon']);
			// has class
			expect(editButton.childAt(1).prop('className')).toBe(styles['promo-text']);

			apiUtils.isAngiePro.mockRestore();
			envUtils.isDemoEnv.mockRestore();
			tooltips.useTooltip.mockRestore();
		});

		it('isAngiePro = false', () => {
			jest.spyOn(apiUtils, 'isAngiePro').mockClear().mockImplementation(() => false);
			jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({
				prop_from_useTooltip: true
			}));
			const editButton = shallow(instance.renderEditButton());

			// has class
			expect(editButton.prop('className')).toBe(styles['edit-disable']);
			// useTooltip called once
			expect(tooltips.useTooltip).toHaveBeenCalled();
			// useTooltip call arg
			expect(tooltips.useTooltip.mock.calls[0][0]).toBe('Available only in Angie PRO');
			// useTooltip call arg
			expect(tooltips.useTooltip.mock.calls[0][1]).toBe('hint-right');

			apiUtils.isAngiePro.mockRestore();
			tooltips.useTooltip.mockRestore();
		});

		it('isAngiePro = true', () => {
			jest.spyOn(apiUtils, 'isAngiePro').mockClear().mockImplementation(() => true);
			const editButton = shallow(instance.renderEditButton());

			// has class
			expect(editButton.prop('className')).toBe(styles.edit);
			// has click handler
			expect(editButton.prop('onClick').name).toBe('bound toggleEditMode');

			apiUtils.isAngiePro.mockRestore();
		});
	});

	it('render()', () => {
		const props = {
			name: 'test_name',
			upstream: {
				peers: [
					{ id: 'test_1', state: 'up' },
					{ id: 'test_2', state: 'unavail' },
					{ id: 'test_3', state: 'unhealthy' },
					{ id: 'test_4', state: 'checking' },
					{ id: 'test_5', state: 'down' }
				],
				zoneSize: null,
				slab: 'slab_test'
			},
			showOnlyFailed: false,
			isStream: false,
			upstreamsApi: 'upstreamsApi_test'
		};
		const wrapper = shallow(
			<UpstreamsList {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(apiUtils, 'isAngiePro').mockClear().mockImplementation(() => true);
		jest.spyOn(instance, 'filterPeers').mockClear().mockImplementation(peers => peers);
		jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({
			prop_from_useTooltip: true
		}));
		jest.spyOn(instance, 'renderPeers').mockClear().mockImplementation(() => 'renderPeers_result');

		wrapper.setState({ filtering: 'up' });

		// [showOnlyFailed = false] this.filterPeers called once
		expect(instance.filterPeers).toHaveBeenCalled();
		// [showOnlyFailed = false] this.filterPeers call args
		expect(instance.filterPeers).toHaveBeenCalledWith(props.upstream.peers);
		// wrapper className
		expect(wrapper.prop('className')).toBe(styles['upstreams-list']);
		// wrapper id
		expect(wrapper.prop('id')).toBe('upstream-test_name');
		// [state.editor = false] filter element
		expect(wrapper.childAt(0).name()).toBe('select');
		// [state.editor = false] filter element name
		expect(wrapper.childAt(0).prop('name')).toBe('filter');
		// filter element className
		expect(wrapper.childAt(0).prop('className')).toBe(styles.filter);
		// filter element onChange
		expect(wrapper.childAt(0).prop('onChange').name).toBe('bound changeFilterRule');

		const filterKeys = Object.keys(FILTER_OPTIONS);

		// filter element options length
		expect(wrapper.childAt(0).children('')).toHaveLength(filterKeys.length);

		filterKeys.forEach((key, i) => {
			// option ${ i } html tag
			expect(wrapper.childAt(0).childAt(i).name()).toBe('option');
			// option ${ i } value
			expect(wrapper.childAt(0).childAt(i).prop('value')).toBe(key);
			// option ${ i } selected
			expect(wrapper.childAt(0).childAt(i).prop('selected')).toBe(key === 'up');
			// option ${ i } text
			expect(wrapper.childAt(0).childAt(i).text()).toBe(FILTER_OPTIONS[key]);
		});

		// head className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.head);
		// head title html tag
		expect(wrapper.childAt(1).childAt(0).name()).toBe('h2');
		// head title className
		expect(wrapper.childAt(1).childAt(0).prop('className')).toBe(styles.title);
		// head title tooltip props
		expect(wrapper.childAt(1).childAt(0).prop('prop_from_useTooltip')).toBe(true);
		// head title text
		expect(wrapper.childAt(1).childAt(0).text()).toBe('test_name');
		// [writePermission = false, state.editMode = false, upstream.zoneSize = null] head children length
		expect(wrapper.childAt(1).children()).toHaveLength(2);
		// this.renderPeers result
		expect(wrapper.childAt(2).text()).toBe('renderPeers_result');
		// this.renderPeers called once
		expect(instance.renderPeers).toHaveBeenCalled();
		// [1] peers order
		expect(instance.renderPeers.mock.calls[0][0][0].id).toBe('test_1');
		// [1] peers order
		expect(instance.renderPeers.mock.calls[0][0][1].id).toBe('test_2');
		// [1] peers order
		expect(instance.renderPeers.mock.calls[0][0][2].id).toBe('test_3');
		// [1] peers order
		expect(instance.renderPeers.mock.calls[0][0][3].id).toBe('test_4');
		// [1] peers order
		expect(instance.renderPeers.mock.calls[0][0][4].id).toBe('test_5');

		// useTooltip called once
		expect(tooltips.useTooltip).toHaveBeenCalled();
		// useTooltip call arg
		expect(tooltips.useTooltip.mock.calls[0][0].type.displayName).toBe('UpstreamStatsTooltip');
		// useTooltip call arg props
		expect(tooltips.useTooltip.mock.calls[0][0].props.upstream).toEqual(props.upstream);

		instance.renderPeers.mockClear();
		wrapper.setState({
			sortOrder: 'desc',
			editor: 'test_editor'
		});
		wrapper.update();
		expect(instance.renderPeers).toHaveBeenCalledTimes(1);
		// [2] peers order
		expect(instance.renderPeers.mock.calls[0][0][0].id).toBe('test_5');
		// [2] peers order
		expect(instance.renderPeers.mock.calls[0][0][1].id).toBe('test_3');
		// [2] peers order
		expect(instance.renderPeers.mock.calls[0][0][2].id).toBe('test_2');
		// [2] peers order
		expect(instance.renderPeers.mock.calls[0][0][3].id).toBe('test_1');
		// [2] peers order
		expect(instance.renderPeers.mock.calls[0][0][4].id).toBe('test_4');

		// upstreams editor
		expect(wrapper.childAt(0).name()).toBe('UpstreamsEditor');
		// upstreams editor, prop upstream
		expect(wrapper.childAt(0).prop('upstream')).toEqual(props.upstream);
		expect(wrapper.childAt(0).prop('servers')).toBeNull();
		// upstreams editor, prop isStream
		expect(wrapper.childAt(0).prop('isStream')).toBe(false);
		// upstreams editor, prop onClose
		expect(wrapper.childAt(0).prop('onClose').name).toBe('bound closeEditor');
		// upstreams editor, prop upstreamsApi
		expect(wrapper.childAt(0).prop('upstreamsApi')).toBe('upstreamsApi_test');
		// [writePermission = true, state.editMode = false, upstream.zoneSize = null] head children length
		expect(wrapper.childAt(2).children()).toHaveLength(2);
		// [state.editMode = false] head, toggle el className
		expect(wrapper.childAt(2).childAt(1).prop('className')).toBe(styles.edit);
		// [state.editMode = false] head, toggle el onClick
		expect(wrapper.childAt(2).childAt(1).prop('onClick').name).toBe('bound toggleEditMode');

		const selectedServers = new Map([
			['test_1', props.upstream.peers[0]]
		]);

		wrapper.setState({
			editor: 'edit',
			editMode: true,
			selectedServers
		});

		// [state.editor = edit] upstreams editor, prop peers
		expect(wrapper.childAt(0).prop('servers')).toEqual(selectedServers);
		// [writePermission = true, state.editMode = true, upstream.zoneSize = null] head children length
		expect(wrapper.childAt(2).children()).toHaveLength(4);
		// [state.editMode = false] head, toggle el className
		expect(wrapper.childAt(2).childAt(1).prop('className')).toBe(styles['edit-active']);
		// head, edit button className
		expect(wrapper.childAt(2).childAt(2).prop('className')).toBe(styles.btn);

		jest.spyOn(instance, 'editSelectedUpstream').mockClear().mockImplementation(() => 'editSelectedUpstream_result');

		// head, edit button onClick result
		expect(wrapper.childAt(2).childAt(2).prop('onClick')()).toBe('editSelectedUpstream_result');
		// this.editSelectedUpstream called
		expect(instance.editSelectedUpstream).toHaveBeenCalled();
		// head, add button className
		expect(wrapper.childAt(2).childAt(3).prop('className')).toBe(styles.btn);
		// head, add button onClick
		expect(wrapper.childAt(2).childAt(3).prop('onClick').name).toBe('bound addUpstream');

		tooltips.useTooltip.mockClear();
		props.upstream.zoneSize = 'zoneSize_test';
		wrapper.setProps(props);

		// [writePermission = true, state.editMode = true, valid upstream.zoneSize] head children length
		expect(wrapper.childAt(2).children()).toHaveLength(5);
		// head, zone capacity className
		expect(wrapper.childAt(2).childAt(4).prop('className')).toBe(styles['zone-capacity']);
		window.temp1 = wrapper.childAt(2);
		// head, zone capacity, tooltiped el
		expect(wrapper.childAt(2).childAt(4).childAt(2).prop('prop_from_useTooltip')).toBe(true);
		// head, zone capacity, tooltiped el, progress bar
		expect(wrapper.childAt(2).childAt(4).childAt(2).childAt(0)
			.name()).toBe('ProgressBar');
		// head, zone capacity, tooltiped el, progress bar props
		expect(wrapper.childAt(2).childAt(4).childAt(2).childAt(0)
			.prop('percentage')).toBe('zoneSize_test');

		// useTooltip called twice
		expect(tooltips.useTooltip).toHaveBeenCalledTimes(2);
		// useTooltip call 2, arg 1
		expect(tooltips.useTooltip.mock.calls[1][0].type.displayName).toBe('SharedZoneTooltip');
		// useTooltip call 2, arg 1, props
		expect(tooltips.useTooltip.mock.calls[1][0].props.zone).toBe('slab_test');
		// useTooltip call 2, arg 2
		expect(tooltips.useTooltip.mock.calls[1][1]).toBe('hint');

		instance.filterPeers.mockClear();
		props.showOnlyFailed = true;
		wrapper.setProps(props);

		// [showOnlyFailed = true] this.filterPeers called once
		expect(instance.filterPeers).toHaveBeenCalled();
		// [showOnlyFailed = true] this.filterPeers call args
		expect(instance.filterPeers).toHaveBeenCalledWith(props.upstream.peers, 'failed');

		instance.filterPeers.mockImplementation(() => ([]));

		expect(instance.render()).toBeNull();

		instance.filterPeers.mockRestore();
		tooltips.useTooltip.mockRestore();
		instance.renderPeers.mockRestore();

		apiUtils.isAngiePro.mockRestore();
		instance.editSelectedUpstream.mockRestore();
		wrapper.unmount();
	});
});
