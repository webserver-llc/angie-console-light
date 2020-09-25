/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';
import UpstreamsList, { FILTER_OPTIONS } from '../upstreamslist.jsx';
import SortableTable from '../../table/sortabletable.jsx';
import appsettings from '../../../appsettings';
import * as api from '../../../api';
import * as tooltips from '../../../tooltips/index.jsx';
import styles from '../style.css';
import tableStyles from '../../table/style.css';

describe('<UpstreamsList />', () => {
	const props = {
		upstream: {
			peers: []
		}
	};

	it('extends SortableTable', () => {
		expect(UpstreamsList.prototype instanceof SortableTable).to.be.true;
	});

	it('constructor()', () => {
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();
		const toggleEditModeSpy = spy(instance.toggleEditMode, 'bind');
		const changeFilterRuleSpy = spy(instance.changeFilterRule, 'bind');
		const addUpstreamSpy = spy(instance.addUpstream, 'bind');
		const editSelectedUpstreamSpy = spy(instance.editSelectedUpstream, 'bind');
		const showEditorSpy = spy(instance.showEditor, 'bind');
		const closeEditorSpy = spy(instance.closeEditor, 'bind');
		const selectAllPeersSpy = spy(instance.selectAllPeers, 'bind');
		const selectPeerSpy = spy(instance.selectPeer, 'bind');

		stub(appsettings, 'getSetting').callsFake(() => 'get_settings_result');

		instance.FILTERING_SETTINGS_KEY = 'FILTERING_SETTINGS_KEY';
		instance.constructor();

		expect(wrapper.state('editMode'), 'state editMode').to.be.false;
		expect(wrapper.state('editor'), 'state editor').to.be.false;
		expect(wrapper.state('selectedPeers'), 'state selectedPeers').to.be.an.instanceof(Map);
		expect(wrapper.state('selectedPeers'), 'state selectedPeers size').to.have.lengthOf(0);
		expect(wrapper.state('filtering'), 'state filtering').to.be.equal('get_settings_result');

		expect(appsettings.getSetting.called, 'getSetting called').to.be.true;
		expect(
			appsettings.getSetting.calledWith('FILTERING_SETTINGS_KEY', 'all'),
			'getSetting call args'
		).to.be.true;

		expect(toggleEditModeSpy.calledOnce, 'this.toggleColumns.bind called once').to.be.true;
		expect(toggleEditModeSpy.args[0][0], 'this.toggleColumns.bind arg').to.be.deep.equal(instance);
		expect(changeFilterRuleSpy.calledOnce, 'this.changeFilterRule.bind called once').to.be.true;
		expect(changeFilterRuleSpy.args[0][0], 'this.changeFilterRule.bind arg').to.be.deep.equal(instance);
		expect(addUpstreamSpy.calledOnce, 'this.addUpstream.bind called once').to.be.true;
		expect(addUpstreamSpy.args[0][0], 'this.addUpstream.bind arg').to.be.deep.equal(instance);
		expect(editSelectedUpstreamSpy.calledOnce, 'this.editSelectedUpstream.bind called once').to.be.true;
		expect(editSelectedUpstreamSpy.args[0][0], 'this.editSelectedUpstream.bind arg').to.be.deep.equal(instance);
		expect(showEditorSpy.calledOnce, 'this.showEditor.bind called once').to.be.true;
		expect(showEditorSpy.args[0][0], 'this.showEditor.bind arg').to.be.deep.equal(instance);
		expect(closeEditorSpy.calledOnce, 'this.closeEditor.bind called once').to.be.true;
		expect(closeEditorSpy.args[0][0], 'this.closeEditor.bind arg').to.be.deep.equal(instance);
		expect(selectAllPeersSpy.calledOnce, 'this.selectAllPeers.bind called once').to.be.true;
		expect(selectAllPeersSpy.args[0][0], 'this.selectAllPeers.bind arg').to.be.deep.equal(instance);
		expect(selectPeerSpy.calledOnce, 'this.selectPeer.bind called once').to.be.true;
		expect(selectPeerSpy.args[0][0], 'this.selectPeer.bind arg').to.be.deep.equal(instance);

		appsettings.getSetting.restore();
		wrapper.unmount();
	});

	it('toggleEditMode()', () => {
		const upstream = {
			name: '%!£@$',
			peers: []
		};
		const wrapper = shallow(
			<UpstreamsList
				upstream={ upstream }
			/>
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');

		stub(window, 'alert').callsFake(() => {});

		instance.toggleEditMode();

		expect(window.alert.calledOnce, 'alert called').to.be.true;
		expect(stateSpy.notCalled, 'this.setState not called').to.be.true;

		window.alert.resetHistory();
		upstream.name = 'test_1';
		wrapper.setProps({ upstream });

		let isWritableResult = null;
		let thenSpy = spy();

		stub(api, 'isWritable').callsFake(() => isWritableResult);
		stub(api, 'checkWritePermissions').callsFake(() => ({
			then: thenSpy
		}));

		instance.toggleEditMode();

		expect(api.isWritable.calledOnce, 'isWritable called').to.be.true;
		expect(api.checkWritePermissions.calledOnce, 'checkWritePermissions called').to.be.true;
		expect(api.checkWritePermissions.args[0][0], 'checkWritePermissions arg').to.be.true;
		expect(thenSpy.calledOnce, 'checkWritePermissions.then called').to.be.true;
		expect(thenSpy.args[0][0], 'checkWritePermissions.then callback').to.be.a('function');

		stub(instance, 'toggleEditMode').callsFake(() => {});
		thenSpy.args[0][0](true);

		expect(instance.toggleEditMode.calledOnce, 'this.toggleEditMode called').to.be.true;
		expect(window.alert.notCalled, 'alert not called').to.be.true;

		instance.toggleEditMode.resetHistory();
		thenSpy.args[0][0](false);

		expect(instance.toggleEditMode.notCalled, 'this.toggleEditMode not called').to.be.true;
		expect(window.alert.calledOnce, 'alert called').to.be.true;

		instance.toggleEditMode.resetHistory();
		window.alert.resetHistory();
		thenSpy.args[0][0](null);

		expect(instance.toggleEditMode.notCalled, 'this.toggleEditMode not called').to.be.true;
		expect(window.alert.notCalled, 'alert not called').to.be.true;

		instance.toggleEditMode.restore();

		expect(stateSpy.notCalled, 'this.setState not called').to.be.true;

		isWritableResult = true;
		instance.toggleEditMode();

		expect(stateSpy.calledOnce, 'this.setState called once').to.be.true;
		expect(stateSpy.args[0][0], 'this.setState call 1, args').to.be.deep.equal({
			editMode: true
		});

		instance.toggleEditMode();

		expect(stateSpy.calledTwice, 'this.setState called twice').to.be.true;
		expect(stateSpy.args[1][0], 'this.setState call 2, args').to.be.deep.equal({
			editMode: false,
			selectedPeers: new Map()
		});

		stateSpy.restore();
		window.alert.restore();
		api.isWritable.restore();
		wrapper.unmount();
	});

	it('editSelectedUpstream()', () => {
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');

		stub(instance, 'showEditor').callsFake(() => {});

		instance.editSelectedUpstream();

		expect(
			stateSpy.notCalled,
			'[no peer, no selectedPeers] this.setState not called'
		).to.be.true;
		expect(
			instance.showEditor.notCalled,
			'[no peer, no selectedPeers] this.showEditor not called'
		).to.be.true;

		const peer = { id: 'peer_1' };

		instance.editSelectedUpstream(peer);

		expect(
			stateSpy.calledOnce,
			'[with peer, no selectedPeers] this.setState called once'
		).to.be.true;
		expect(
			stateSpy.args[0][0],
			'[with peer, no selectedPeers] this.setState call args'
		).to.be.deep.equal({
			selectedPeers: new Map([[peer.id, peer]])
		});
		expect(
			instance.showEditor.calledOnce,
			'[with peer, no selectedPeers] this.showEditor called once'
		).to.be.true;
		expect(
			instance.showEditor.args[0][0],
			'[with peer, no selectedPeers] this.showEditor call args'
		).to.be.equal('edit');

		stateSpy.resetHistory();
		instance.showEditor.resetHistory();
		instance.editSelectedUpstream();

		expect(
			stateSpy.notCalled,
			'[no peer, with selectedPeers] this.setState not called'
		).to.be.true;
		expect(
			instance.showEditor.calledOnce,
			'[no peer, with selectedPeers] this.showEditor called once'
		).to.be.true;
		expect(
			instance.showEditor.args[0][0],
			'[no peer, with selectedPeers] this.showEditor call args'
		).to.be.equal('edit');

		stateSpy.restore();
		instance.showEditor.restore();
		wrapper.unmount();
	});

	it('addUpstream()', () => {
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance, 'showEditor').callsFake(() => {});

		instance.addUpstream();

		expect(instance.showEditor.calledOnce, 'this.showEditor called').to.be.true;
		expect(instance.showEditor.args[0][0], 'this.showEditor call args').to.be.equal('add');

		instance.showEditor.restore();
		wrapper.unmount();
	});

	it('closeEditor()', () => {
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');

		instance.closeEditor();

		expect(stateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(stateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			editor: null
		});

		stateSpy.restore();
		wrapper.unmount();
	});

	it('showEditor()', () => {
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');

		instance.showEditor('test_mode');

		expect(stateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(stateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			editor: 'test_mode'
		});

		stateSpy.restore();
		wrapper.unmount();
	});

	it('changeFilterRule()', () => {
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');

		stub(appsettings, 'setSetting').callsFake(() => {});

		instance.FILTERING_SETTINGS_KEY = 'FILTERING_SETTINGS_KEY';
		instance.changeFilterRule({ target: { value: 'test_value' } });

		expect(appsettings.setSetting.calledOnce, 'appsettings.setSetting called once').to.be.true;
		expect(
			appsettings.setSetting.calledWith('FILTERING_SETTINGS_KEY', 'test_value'),
			'appsettings.setSetting call arguments'
		).to.be.true;
		expect(stateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(stateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			filtering: 'test_value'
		});

		stateSpy.restore();
		appsettings.setSetting.restore();
		wrapper.unmount();
	});

	it('renderEmptyList()', () => {
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);

		wrapper.setState({ filtering: 'filtering_test' });

		const emptyList = shallow(
			wrapper.instance().renderEmptyList()
		);

		expect(emptyList.name(), 'empty list html tag').to.be.equal('tr');
		expect(emptyList.text(), 'empty list text').to.be.equal(
			"No servers with 'filtering_test' state found in this upstream group."
		);
		expect(emptyList.childAt(0).prop('className'), 'empty list, child className').to.be.equal(
			tableStyles['left-align']
		);
		expect(emptyList.childAt(0).prop('colSpan'), 'empty list, child colSpan').to.be.equal(30);

		wrapper.unmount();
	});

	it('filterPeers()', () => {
		const peers = [
			{ state: 'up' },
			{ state: 'unavail' },
			{ state: 'unhealthy' },
			{ state: 'draining' },
			{ state: 'down' }
		];
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();

		wrapper.setState({ filtering: 'up' });

		expect(
			instance.filterPeers(peers),
			'[default filtering] up filtering'
		).to.be.deep.equal([{ state: 'up' }]);
		expect(
			instance.filterPeers(peers, 'failed'),
			'failed filtering'
		).to.be.deep.equal([
			{ state: 'unavail' },
			{ state: 'unhealthy' }
		]);
		expect(
			instance.filterPeers(peers, 'drain'),
			'drain filtering'
		).to.be.deep.equal([{ state: 'draining' }]);
		expect(
			instance.filterPeers(peers, 'down'),
			'down filtering'
		).to.be.deep.equal([{ state: 'down' }]);
		expect(
			instance.filterPeers(peers, 'all'),
			'all filtering'
		).to.be.deep.equal(peers);

		wrapper.unmount();
	});

	it('selectAllPeers()', () => {
		const peers = [
			{ id: 'test_1' }
		];
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');

		instance.selectAllPeers(peers);

		expect(stateSpy.calledOnce, '[reset selected] this.setState called').to.be.true;
		expect(stateSpy.args[0][0], '[reset selected] this.setState call arg').to.be.deep.equal({
			selectedPeers: new Map([])
		});

		stateSpy.resetHistory();
		instance.selectAllPeers(peers, true);

		expect(stateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(stateSpy.args[0][0], 'this.setState call arg').to.be.deep.equal({
			selectedPeers: new Map([
				[peers[0].id, peers[0]]
			])
		});

		stateSpy.restore();
		wrapper.unmount();
	});

	it('selectPeer()', () => {
		const peers = [
			{ id: 'test_1' }
		];
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();
		const stateSpy = spy(instance, 'setState');

		instance.selectPeer(peers[0], true);

		expect(stateSpy.calledOnce, '[select peer] this.setState called').to.be.true;
		expect(stateSpy.args[0][0], '[select peer] this.setState call arg').to.be.deep.equal({
			selectedPeers: new Map([
				['test_1', peers[0]]
			])
		});

		stateSpy.resetHistory();
		instance.selectPeer(peers[0]);

		expect(stateSpy.calledOnce, '[unselect peer] this.setState called').to.be.true;
		expect(stateSpy.args[0][0], '[unselect peer] this.setState call arg').to.be.deep.equal({
			selectedPeers: new Map()
		});

		stateSpy.restore();
		wrapper.unmount();
	});

	it('getSelectAllCheckbox()', () => {
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance, 'selectAllPeers').callsFake(() => 'selectAllPeers_result');

		expect(instance.getSelectAllCheckbox(), 'editMode = false').to.be.a('null');

		wrapper.setState({ editMode: true });

		let checkbox = shallow(instance.getSelectAllCheckbox([]));

		expect(checkbox.name(), 'checkbox html tag').to.be.equal('th');
		expect(checkbox.prop('rowSpan'), 'checkbox rowSpan').to.be.equal('2');
		expect(
			checkbox.prop('className'),
			'checkbox className'
		).to.be.equal(tableStyles['checkbox']);
		expect(
			checkbox.childAt(0).name(),
			'checkbox, input html tag'
		).to.be.equal('input');
		expect(
			checkbox.childAt(0).prop('type'),
			'checkbox, input type'
		).to.be.equal('checkbox');
		expect(
			checkbox.childAt(0).prop('checked'),
			'[peers same as selectedPeers] checkbox, input checked'
		).to.be.true;
		expect(
			checkbox.childAt(0).prop('onChange'),
			'checkbox, input onChange'
		).to.be.a('function');
		expect(
			checkbox.childAt(0).prop('onChange')({
				target: { checked: 'target_checked' }
			}),
			'checkbox, input onChange return'
		).to.be.equal('selectAllPeers_result');
		expect(instance.selectAllPeers.calledOnce, 'this.selectAllPeers called once').to.be.true;
		expect(
			instance.selectAllPeers.calledWith([], 'target_checked'),
			'this.selectAllPeers call arguments'
		).to.be.true;

		checkbox = shallow(instance.getSelectAllCheckbox([1, 2, 3]));

		expect(
			checkbox.childAt(0).prop('checked'),
			'[peers differs from selectedPeers] checkbox, input checked'
		).to.be.false;

		instance.selectAllPeers.restore();
		wrapper.unmount();
	});

	it('getCheckbox()', () => {
		const peer = { id: 'test_1' };
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance, 'selectPeer').callsFake(() => 'selectPeer_result');

		expect(instance.getCheckbox(), 'editMode = false').to.be.a('null');

		wrapper.setState({ editMode: true });

		let checkbox = shallow(instance.getCheckbox(peer));

		expect(checkbox.name(), 'checkbox html tag').to.be.equal('td');
		expect(
			checkbox.prop('className'),
			'checkbox className'
		).to.be.equal(tableStyles['checkbox']);
		expect(
			checkbox.childAt(0).name(),
			'checkbox, input html tag'
		).to.be.equal('input');
		expect(
			checkbox.childAt(0).prop('type'),
			'checkbox, input type'
		).to.be.equal('checkbox');
		expect(
			checkbox.childAt(0).prop('checked'),
			'[peer IS NOT in selectedPeers] checkbox, input checked'
		).to.be.false;
		expect(
			checkbox.childAt(0).prop('onChange'),
			'checkbox, input onChange'
		).to.be.a('function');
		expect(
			checkbox.childAt(0).prop('onChange')({
				target: { checked: 'target_checked' }
			}),
			'checkbox, input onChange return'
		).to.be.equal('selectPeer_result');
		expect(instance.selectPeer.calledOnce, 'this.selectPeer called once').to.be.true;
		expect(
			instance.selectPeer.calledWith(peer, 'target_checked'),
			'this.selectPeer call arguments'
		).to.be.true;

		wrapper.setState({
			selectedPeers: new Map([
				[peer.id, peer]
			])
		});
		checkbox = shallow(instance.getCheckbox(peer));

		expect(
			checkbox.childAt(0).prop('checked'),
			'[peer IS in selectedPeers] checkbox, input checked'
		).to.be.true;

		instance.selectPeer.restore();
		wrapper.unmount();
	});

	it('render()', () => {
		const props = {
			name: 'test_name',
			upstream: {
				peers: [
					{ id: 'test_1', state: 'up' },
					{ id: 'test_2', state: 'unavail' },
					{ id: 'test_3', state: 'unhealthy' },
					{ id: 'test_4', state: 'draining' },
					{ id: 'test_5', state: 'down' }
				],
				zoneSize: null,
				slab: 'slab_test'
			},
			showOnlyFailed: false,
			isStream: 'isStream_test',
			upstreamsApi: 'upstreamsApi_test'
		};
		const wrapper = shallow(
			<UpstreamsList { ...props } />
		);
		const instance = wrapper.instance();
		let isWritableResult = false;

		stub(api, 'isWritable').callsFake(() => isWritableResult);
		stub(Array.prototype, 'sort').callsFake(() => 'test_sort_result');
		stub(instance, 'filterPeers').callsFake(peers => peers);
		stub(tooltips, 'useTooltip').callsFake(() => ({
			prop_from_useTooltip: true
		}));
		stub(instance, 'renderPeers').callsFake(() => 'renderPeers_result');

		wrapper.setState({ filtering: 'up' });

		expect(
			instance.filterPeers.calledOnce,
			'[showOnlyFailed = false] this.filterPeers called once'
		).to.be.true;
		expect(
			instance.filterPeers.calledWith(props.upstream.peers),
			'[showOnlyFailed = false] this.filterPeers call args'
		).to.be.true;
		expect(
			Array.prototype.sort.notCalled,
			'[state.sortOrder = asc] peers.sort not called'
		).to.be.true;
		expect(
			api.isWritable.calledTwice,
			'[isWritable returns false] isWritable called twice'
		).to.be.true;
		expect(wrapper.prop('className'), 'wrapper className').to.be.equal(styles['upstreams-list']);
		expect(wrapper.prop('id'), 'wrapper id').to.be.equal('upstream-test_name');
		expect(wrapper.childAt(0).name(), '[state.editor = false] filter element').to.be.equal('select');
		expect(
			wrapper.childAt(0).prop('name'),
			'[state.editor = false] filter element name'
		).to.be.equal('filter');
		expect(
			wrapper.childAt(0).prop('className'),
			'filter element className'
		).to.be.equal(styles['filter']);
		expect(
			wrapper.childAt(0).prop('onChange').name,
			'filter element onChange'
		).to.be.equal('bound changeFilterRule');

		const filterKeys = Object.keys(FILTER_OPTIONS);

		expect(
			wrapper.childAt(0).children(''),
			'filter element options length'
		).to.have.lengthOf(filterKeys.length);

		filterKeys.forEach((key, i) => {
			expect(
				wrapper.childAt(0).childAt(i).name(),
				`option ${ i } html tag`
			).to.be.equal('option');
			expect(
				wrapper.childAt(0).childAt(i).prop('value'),
				`option ${ i } value`
			).to.be.equal(key);
			expect(
				wrapper.childAt(0).childAt(i).prop('selected'),
				`option ${ i } selected`
			).to.be.equal(key === 'up');
			expect(
				wrapper.childAt(0).childAt(i).text(),
				`option ${ i } text`
			).to.be.equal(FILTER_OPTIONS[key]);
		});

		expect(
			wrapper.childAt(1).prop('className'),
			'head className'
		).to.be.equal(styles['head']);
		expect(
			wrapper.childAt(1).childAt(0).name(),
			'head title html tag'
		).to.be.equal('h2');
		expect(
			wrapper.childAt(1).childAt(0).prop('className'),
			'head title className'
		).to.be.equal(styles['title']);
		expect(
			wrapper.childAt(1).childAt(0).prop('prop_from_useTooltip'),
			'head title tooltip props'
		).to.be.true;
		expect(
			wrapper.childAt(1).childAt(0).text(),
			'head title text'
		).to.be.equal('test_name');
		expect(
			wrapper.childAt(1).children(),
			'[writePermission = false, state.editMode = false, upstream.zoneSize = null] head children length'
		).to.have.lengthOf(1);
		expect(wrapper.childAt(2).text(), 'this.renderPeers result').to.be.equal('renderPeers_result');
		expect(instance.renderPeers.calledOnce, 'this.renderPeers called once').to.be.true;
		expect(
			instance.renderPeers.args[0][0],
			'this.renderPeers call args'
		).to.be.deep.equal(props.upstream.peers);

		expect(tooltips.useTooltip.calledOnce, 'useTooltip called once').to.be.true;
		expect(
			tooltips.useTooltip.args[0][0].nodeName.prototype.displayName,
			'useTooltip call arg'
		).to.be.equal('UpstreamStatsTooltip');
		expect(
			tooltips.useTooltip.args[0][0].attributes.upstream,
			'useTooltip call arg props'
		).to.be.deep.equal(props.upstream);

		api.isWritable.resetHistory();
		isWritableResult = null;
		wrapper.setState({
			sortOrder: 'desc',
			editor: 'test_editor'
		});

		expect(
			Array.prototype.sort.calledOnce,
			'[state.sortOrder = desc] peers.sort called'
		).to.be.true;
		expect(
			Array.prototype.sort.getCall(0).thisValue,
			'peers.sort called on peers'
		).to.be.deep.equal(props.upstream.peers);
		expect(
			Array.prototype.sort.args[0][0]({ state: 'up' }),
			'peers.sort call arg, check 1'
		).to.be.equal(1);
		expect(
			Array.prototype.sort.args[0][0]({ state: 'down' }),
			'peers.sort call arg, check 2'
		).to.be.equal(-1);
		expect(
			Array.prototype.sort.args[0][0]({ state: 'unhealthy' }),
			'peers.sort call arg, check 3'
		).to.be.equal(-1);
		expect(
			Array.prototype.sort.args[0][0]({ state: 'unavail' }),
			'peers.sort call arg, check 4'
		).to.be.equal(-1);
		expect(
			api.isWritable.calledTwice,
			'[isWritable returns null] isWritable called twice'
		).to.be.true;
		expect(wrapper.childAt(0).name(), 'upstreams editor').to.be.equal('UpstreamsEditor');
		expect(
			wrapper.childAt(0).prop('upstream'),
			'upstreams editor, prop upstream'
		).to.be.deep.equal(props.upstream);
		expect(
			wrapper.childAt(0).prop('peers'),
			'upstreams editor, prop peers'
		).to.be.a('null');
		expect(
			wrapper.childAt(0).prop('isStream'),
			'upstreams editor, prop isStream'
		).to.be.equal('isStream_test');
		expect(
			wrapper.childAt(0).prop('onClose').name,
			'upstreams editor, prop onClose'
		).to.be.equal('bound closeEditor');
		expect(
			wrapper.childAt(0).prop('upstreamsApi'),
			'upstreams editor, prop upstreamsApi'
		).to.be.equal('upstreamsApi_test');
		expect(
			wrapper.childAt(2).children(),
			'[writePermission = true, state.editMode = false, upstream.zoneSize = null] head children length'
		).to.have.lengthOf(2);
		expect(
			wrapper.childAt(2).childAt(1).prop('className'),
			'[state.editMode = false] head, toggle el className'
		).to.be.equal(styles['edit']);
		expect(
			wrapper.childAt(2).childAt(1).prop('onClick').name,
			'[state.editMode = false] head, toggle el onClick'
		).to.be.equal('bound toggleEditMode');

		const selectedPeers = new Map([
			['test_1', props.upstream.peers[0]]
		]);

		api.isWritable.resetHistory();
		isWritableResult = true;
		wrapper.setState({
			editor: 'edit',
			editMode: true,
			selectedPeers
		});

		expect(
			api.isWritable.calledOnce,
			'[isWritable returns true] isWritable called once'
		).to.be.true;
		expect(
			wrapper.childAt(0).prop('peers'),
			'[state.editor = edit] upstreams editor, prop peers'
		).to.be.deep.equal(selectedPeers);
		expect(
			wrapper.childAt(2).children(),
			'[writePermission = true, state.editMode = true, upstream.zoneSize = null] head children length'
		).to.have.lengthOf(4);
		expect(
			wrapper.childAt(2).childAt(1).prop('className'),
			'[state.editMode = false] head, toggle el className'
		).to.be.equal(styles['edit-active']);
		expect(
			wrapper.childAt(2).childAt(2).prop('className'),
			'head, edit button className'
		).to.be.equal(styles['btn']);

		stub(instance, 'editSelectedUpstream').callsFake(() => 'editSelectedUpstream_result');

		expect(
			wrapper.childAt(2).childAt(2).prop('onClick')(),
			'head, edit button onClick result'
		).to.be.equal('editSelectedUpstream_result');
		expect(
			instance.editSelectedUpstream.calledOnce,
			'this.editSelectedUpstream called'
		).to.be.true;
		expect(
			wrapper.childAt(2).childAt(3).prop('className'),
			'head, add button className'
		).to.be.equal(styles['btn']);
		expect(
			wrapper.childAt(2).childAt(3).prop('onClick').name,
			'head, add button onClick'
		).to.be.equal('bound addUpstream');

		tooltips.useTooltip.resetHistory();
		props.upstream.zoneSize = 'zoneSize_test';
		wrapper.setProps(props);

		expect(
			wrapper.childAt(2).children(),
			'[writePermission = true, state.editMode = true, valid upstream.zoneSize] head children length'
		).to.have.lengthOf(5);
		expect(
			wrapper.childAt(2).childAt(4).prop('className'),
			'head, zone capacity className'
		).to.be.equal(styles['zone-capacity']);
		expect(
			wrapper.childAt(2).childAt(4).childAt(1).prop('prop_from_useTooltip'),
			'head, zone capacity, tooltiped el'
		).to.be.true;
		expect(
			wrapper.childAt(2).childAt(4).childAt(1).childAt(0).name(),
			'head, zone capacity, tooltiped el, progress bar'
		).to.be.equal('ProgressBar');
		expect(
			wrapper.childAt(2).childAt(4).childAt(1).childAt(0).prop('percentage'),
			'head, zone capacity, tooltiped el, progress bar props'
		).to.be.equal('zoneSize_test');

		expect(tooltips.useTooltip.calledTwice, 'useTooltip called twice').to.be.true;
		expect(
			tooltips.useTooltip.args[1][0].nodeName.prototype.displayName,
			'useTooltip call 2, arg 1'
		).to.be.equal('SharedZoneTooltip');
		expect(
			tooltips.useTooltip.args[1][0].attributes.zone,
			'useTooltip call 2, arg 1, props'
		).to.be.equal('slab_test');
		expect(
			tooltips.useTooltip.args[1][1],
			'useTooltip call 2, arg 2'
		).to.be.equal('hint');

		instance.filterPeers.resetHistory();
		props.showOnlyFailed = true;
		wrapper.setProps(props);

		expect(
			instance.filterPeers.calledOnce,
			'[showOnlyFailed = true] this.filterPeers called once'
		).to.be.true;
		expect(
			instance.filterPeers.calledWith(props.upstream.peers, 'failed'),
			'[showOnlyFailed = true] this.filterPeers call args'
		).to.be.true;

		instance.filterPeers.callsFake(() => ([]));

		expect(
			instance.render(),
			'[showOnlyFailed = true, this.filterPeers returns empty array] render result'
		).to.be.a('null');

		Array.prototype.sort.restore();
		instance.filterPeers.restore();
		tooltips.useTooltip.restore();
		instance.renderPeers.restore();
		instance.editSelectedUpstream.restore();
		wrapper.unmount();
	});
});
