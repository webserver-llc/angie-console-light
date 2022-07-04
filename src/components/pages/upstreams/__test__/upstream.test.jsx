/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub, spy } from 'sinon';
import appsettings from '../../../../appsettings';
import tooltips from '../../../../tooltips/index.jsx';
import utils from '../../../../utils.js';
import Upstream from '../upstream.jsx';
import styles from '../../../table/style.css';

describe('<Upstream />', () => {
	const props = {
		name: 'test',
		upstream: {
			peers: []
		}
	};

	it('constructor()', () => {
		stub(appsettings, 'getSetting').callsFake(() => 'get_settings_result');

		const toggleColumnsBindSpy = spy(Upstream.prototype.toggleColumns, 'bind');
		const hoverColumnsBindSpy = spy(Upstream.prototype.hoverColumns, 'bind');
		const wrapper = shallow(<Upstream { ...props } />);

		expect(wrapper.state('hoveredColumns'), 'state hoveredColumns').to.be.false;
		expect(wrapper.state('columnsExpanded'), 'state columnsExpanded').to.be.equal('get_settings_result');
		expect(appsettings.getSetting.called, 'getSetting called').to.be.true;
		expect(
			appsettings.getSetting.calledWith('columns-expanded-http-upstreams-test', false),
			'getSetting call args'
		).to.be.true;
		expect(toggleColumnsBindSpy.calledOnce, 'this.toggleColumns.bind called once').to.be.true;
		expect(toggleColumnsBindSpy.args[0][0] instanceof Upstream, 'this.toggleColumns.bind arg').to.be.true;
		expect(hoverColumnsBindSpy.calledOnce, 'this.hoverColumns.bind called once').to.be.true;
		expect(hoverColumnsBindSpy.args[0][0] instanceof Upstream, 'this.hoverColumns.bind arg').to.be.true;

		hoverColumnsBindSpy.restore();
		toggleColumnsBindSpy.restore();
		appsettings.getSetting.restore();
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(
			<Upstream
				{ ...props }
			/>
		);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).to.be.equal('sorting-http-upstreams-test');
	});

	it('get FILTERING_SETTINGS_KEY', () => {
		const wrapper = shallow(
			<Upstream
				{ ...props }
			/>
		);

		expect(wrapper.instance().FILTERING_SETTINGS_KEY).to.be.equal('filtering-http-upstreams-test');
	});

	it('toggleColumns()', () => {
		const wrapper = shallow(
			<Upstream
				{ ...props }
			/>
		);
		const instance = wrapper.instance();

		stub(instance, 'setState').callsFake(() => {});
		stub(appsettings, 'setSetting').callsFake(() => {});

		instance.toggleColumns();

		expect(instance.setState.calledOnce, 'this.setState called').to.be.true;
		expect(instance.setState.args[0][0], 'this.setState args').to.be.deep.equal({
			columnsExpanded: true
		});
		expect(appsettings.setSetting.calledOnce, 'appsettings.setSetting called').to.be.true;
		expect(appsettings.setSetting.args[0][0], 'appsettings.setSetting arg 1').to.be.equal(
			'columns-expanded-http-upstreams-test'
		);
		expect(appsettings.setSetting.args[0][1], 'appsettings.setSetting arg 2').to.be.true;

		instance.setState.restore();
		appsettings.setSetting.restore();
	});

	it('hoverColumns()', () => {
		const hoveredColumns = 'hoveredColumns';
		const wrapper = shallow(
			<Upstream
				{ ...props }
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		instance.hoverColumns(hoveredColumns);

		expect(setStateSpy.notCalled, 'this.setState not called').to.be.true;

		instance.setState({ columnsExpanded: true });
		wrapper.update();
		setStateSpy.resetHistory();
		instance.hoverColumns(hoveredColumns);

		expect(setStateSpy, 'this.setState called once').to.be.calledOnce;
		expect(setStateSpy.args[0][0], 'this.setState args').to.be.deep.equal({ hoveredColumns });

		setStateSpy.restore();
	});

	it('renderPeers()', () => {
		const peers = [{
			id: 1,
			state: 'up',
			backup: false,
			server: 'test_server_1',
			downtime: 1000,
			weight: 1,
			requests: 123,
			server_req_s: 3,
			responses: {
				'1xx': 0,
				'2xx': 110,
				'3xx': 1,
				'4xx': 10,
				'5xx': 2
			},
			'4xxChanged': true,
			'5xxChanged': false,
			active: 10000,
			max_conns: Infinity,
			server_sent_s: 40,
			server_rcvd_s: 39,
			sent: 400,
			received: 399,
			fails: 1,
			unavail: 2,
			health_checks: {
				checks: 24,
				fails: 3,
				unhealthy: 0
			},
			health_status: null,
			header_time: 999,
			response_time: 99
		}, {
			id: 2,
			state: 'up',
			backup: true,
			server: 'test_server_2',
			responses: {
				'1xx': 1,
				'2xx': 210,
				'3xx': 2,
			},
			'4xxChanged': false,
			'5xxChanged': true,
			max_conns: '123/s',
			health_checks: {},
			health_status: false
		}, {
			id: 3,
			state: 'up',
			responses: {
				'1xx': 2,
				'2xx': 310,
				'3xx': 3,
			},
			health_checks: {},
			health_status: true
		}];
		const wrapper = shallow(
			<Upstream
				name="test"
				upstream={{
					peers: []
				}}
			/>
		);
		const instance = wrapper.instance();

		stub(instance, 'getSelectAllCheckbox').callsFake(
			() => <div id="getSelectAllCheckbox_result" />
		);
		stub(tooltips, 'useTooltip').callsFake(() => ({
			prop_from_useTooltip: true
		}));
		stub(instance, 'renderEmptyList').callsFake(
			() => <tr id="renderEmptyList_result" />
		);
		stub(instance, 'getCheckbox').callsFake(
			({ id }) => <td id={ `getCheckbox_result_${ id }` } />
		);
		stub(utils, 'formatUptime').callsFake(() => 'time_formatted');
		stub(utils, 'formatReadableBytes').callsFake(() => 'readable_bytes_formatted');
		stub(utils, 'formatMs').callsFake(() => 'ms_formatted');
		stub(instance, 'editSelectedUpstream').callsFake(() => 'edit_selected_upstream_result');
		stub(instance, 'hoverColumns').callsFake(() => 'hover_columns_result');

		let table = shallow(
			instance.renderPeers([])
		);

		expect(table.type(), 'table html tag').to.be.equal('table');
		expect(table.prop('className'), 'table className').to.be.equal(
			`${ styles['table'] } ${ styles['wide'] }`
		);
		expect(
			wrapper.find('table col'),
			'[editMode = false, columnsExpanded = false] table col length'
		).to.have.lengthOf(23);

		const tableSortControl = table.find('TableSortControl');

		expect(tableSortControl.prop('secondSortLabel'), 'TableSortControl secondSortLabel').to.be.equal(
			'Sort by status - down first'
		);
		expect(tableSortControl.prop('order'), 'TableSortControl order').to.be.equal(
			wrapper.state('sortOrder')
		);
		expect(tableSortControl.prop('onChange').name, 'TableSortControl onChange').to.be.equal(
			'bound changeSorting'
		);
		expect(
			table.find('#getSelectAllCheckbox_result'),
			'this.getSelectAllCheckbox result pasted'
		).to.have.lengthOf(1);
		expect(instance.getSelectAllCheckbox.calledOnce, 'this.getSelectAllCheckbox called once').to.be.true;
		expect(
			instance.getSelectAllCheckbox.args[0][0],
			'this.getSelectAllCheckbox call arg'
		).to.be.deep.equal([]);

		const headRow = table.find('thead').childAt(0);

		expect(headRow.childAt(2).prop('colSpan'), 'head row 1, child 3 colspan').to.be.equal('3');
		expect(headRow.childAt(3).prop('colSpan'), 'head row 1, child 4 colspan').to.be.equal('2');
		expect(
			headRow.childAt(4).prop('colSpan'),
			'[columnsExpanded = false] head row 1, child 5 colspan'
		).to.be.equal(3);
		expect(headRow.childAt(5).prop('colSpan'), 'head row 1, child 6 colspan').to.be.equal('2');
		expect(headRow.childAt(6).prop('colSpan'), 'head row 1, child 7 colspan').to.be.equal('4');
		expect(headRow.childAt(7).prop('colSpan'), 'head row 1, child 8 colspan').to.be.equal('2');
		expect(headRow.childAt(8).prop('colSpan'), 'head row 1, child 8 colspan').to.be.equal('4');
		expect(headRow.childAt(9).prop('colSpan'), 'head row 1, child 8 colspan').to.be.equal('2');
		expect(
			table.find('thead').childAt(1).children(),
			'[columnsExpanded = false] head row 2, children length'
		).to.have.lengthOf(22);

		const headTooltips = table.find(`thead .${ styles['hinted'] }`);

		expect(headTooltips, 'thead tooltips length').to.have.lengthOf(4);
		expect(headTooltips.at(0).prop('prop_from_useTooltip'), 'thead tooltip 1 props').to.be.true;
		expect(headTooltips.at(1).prop('prop_from_useTooltip'), 'thead tooltip 2 props').to.be.true;
		expect(headTooltips.at(2).prop('prop_from_useTooltip'), 'thead tooltip 3 props').to.be.true;
		expect(headTooltips.at(3).prop('prop_from_useTooltip'), 'thead tooltip 4 props').to.be.true;
		expect(tooltips.useTooltip.callCount, 'useTooltip call count').to.be.equal(4);
		expect(tooltips.useTooltip.args[0][0], 'useTooltip, call 1, arg 1').to.be.equal('Total downtime');
		expect(tooltips.useTooltip.args[0][1], 'useTooltip, call 1, arg 2').to.be.equal('hint');
		expect(tooltips.useTooltip.args[1][0], 'useTooltip, call 2, arg 1').to.be.equal('Weight');
		expect(tooltips.useTooltip.args[1][1], 'useTooltip, call 2, arg 2').to.be.equal('hint');
		expect(tooltips.useTooltip.args[2][0], 'useTooltip, call 3, arg 1').to.be.equal('Active');
		expect(tooltips.useTooltip.args[2][1], 'useTooltip, call 3, arg 2').to.be.equal('hint');
		expect(tooltips.useTooltip.args[3][0], 'useTooltip, call 4, arg 1').to.be.equal('Limit');
		expect(tooltips.useTooltip.args[3][1], 'useTooltip, call 4, arg 2').to.be.equal('hint');

		let tbody = table.find('tbody');

		expect(tbody.children(), '[no peers] tbody children').to.have.lengthOf(1);
		expect(tbody.childAt(0).prop('id'), '[no peers] tbody child').to.be.equal('renderEmptyList_result');
		expect(instance.renderEmptyList.calledOnce, 'this.renderEmptyList called once').to.be.true;
		expect(instance.getCheckbox.notCalled, 'this.getCheckbox not called').to.be.true;

		tooltips.useTooltip.resetHistory();
		instance.renderEmptyList.resetHistory();
		table = shallow(
			instance.renderPeers(peers)
		);
		tbody = table.find('tbody');

		expect(
			instance.renderEmptyList.notCalled,
			'[with peers] this.renderEmptyList not called'
		).to.be.true;
		expect(tbody.children(), '[with peers] tbody children length').to.have.lengthOf(3);
		expect(tbody.childAt(0).children(), '[peer 1] td count').to.have.lengthOf(24);
		expect(tbody.childAt(0).childAt(0).prop('className'), '[peer 1] peer state').to.be.equal(styles['up']);
		expect(
			tbody.childAt(0).childAt(1).prop('id'),
			'[peer 1] this.getCheckbox rendered'
		).to.be.equal('getCheckbox_result_1');
		expect(
			tbody.childAt(0).childAt(2).childAt(0).prop('className'),
			'[peer 1] address-container className'
		).to.be.equal(styles['address-container']);
		expect(
			tbody.childAt(0).childAt(2).childAt(0).prop('prop_from_useTooltip'),
			'[peer 1] address-container, useTooltip applied'
		).to.be.true;
		expect(
			tbody.childAt(0).childAt(2).childAt(0).text(),
			'[peer 1] address-container text'
		).to.be.equal('test_server_1');
		expect(tbody.childAt(0).childAt(3).text(), '[peer 1] peer downtime').to.be.equal('time_formatted');
		expect(tbody.childAt(0).childAt(4).text(), '[peer 1] peer weight').to.be.equal('1');
		expect(
			tbody.childAt(0).childAt(5).childAt(0).prop('className'),
			'[peer 1] requests className'
		).to.be.equal(styles['hinted']);
		expect(
			tbody.childAt(0).childAt(5).childAt(0).prop('prop_from_useTooltip'),
			'[peer 1] requests, useTooltip applied'
		).to.be.true;
		expect(
			tbody.childAt(0).childAt(5).childAt(0).text(),
			'[peer 1] requests text'
		).to.be.equal('123');
		expect(tbody.childAt(0).childAt(6).text(), '[peer 1] server_req_s').to.be.equal('3');
		expect(
			tbody.childAt(0).childAt(7).prop('className'),
			'[peer 1] collapse-columns className'
		).to.be.equal(styles['collapse-columns']);
		expect(
			tbody.childAt(0).childAt(7).prop('rowspan'),
			'[peer 1] collapse-columns rowspan'
		).to.be.equal(3);
		expect(
			tbody.childAt(0).childAt(7).prop('onClick').name,
			'[peer 1] collapse-columns onClick'
		).to.be.equal('bound toggleColumns');
		expect(
			tbody.childAt(0).childAt(8).prop('className'),
			'[peer 1] responses 4xx className'
		).to.be.equal(`${ styles['flash'] } ${ styles['red-flash'] }`);
		expect(tbody.childAt(0).childAt(8).text(), '[peer 1] responses 4xx').to.be.equal('10');
		expect(
			tbody.childAt(0).childAt(9).prop('className'),
			'[peer 1] responses 5xx className'
		).to.be.equal(`${ styles['bdr'] } ${ styles['flash'] }`);
		expect(tbody.childAt(0).childAt(9).text(), '[peer 1] responses 5xx').to.be.equal('2');
		expect(
			tbody.childAt(0).childAt(10).prop('className'),
			'[peer 1] active className'
		).to.be.equal(styles['center-align']);
		expect(tbody.childAt(0).childAt(10).text(), '[peer 1] active').to.be.equal('10000');
		expect(
			tbody.childAt(0).childAt(11).prop('className'),
			'[peer 1] max_conns className'
		).to.be.equal(`${ styles['center-align'] } ${ styles['bdr'] }`);
		expect(tbody.childAt(0).childAt(11).text(), '[peer 1] max_conns').to.be.equal('∞');
		expect(
			tbody.childAt(0).childAt(12).prop('className'),
			'[peer 1] server_sent_s className'
		).to.be.equal(styles['px60']);
		expect(tbody.childAt(0).childAt(12).text(), '[peer 1] server_sent_s').to.be.equal('readable_bytes_formatted');
		expect(
			tbody.childAt(0).childAt(13).prop('className'),
			'[peer 1] server_rcvd_s className'
		).to.be.equal(styles['px60']);
		expect(tbody.childAt(0).childAt(13).text(), '[peer 1] server_rcvd_s').to.be.equal('readable_bytes_formatted');
		expect(tbody.childAt(0).childAt(14).text(), '[peer 1] sent').to.be.equal('readable_bytes_formatted');
		expect(tbody.childAt(0).childAt(15).text(), '[peer 1] received').to.be.equal('readable_bytes_formatted');
		expect(tbody.childAt(0).childAt(16).text(), '[peer 1] fails').to.be.equal('1');
		expect(
			tbody.childAt(0).childAt(17).prop('className'),
			'[peer 1] unavail className'
		).to.be.equal(styles['bdr']);
		expect(tbody.childAt(0).childAt(17).text(), '[peer 1] unavail').to.be.equal('2');
		expect(tbody.childAt(0).childAt(18).text(), '[peer 1] health checks').to.be.equal('24');
		expect(tbody.childAt(0).childAt(19).text(), '[peer 1] health fails').to.be.equal('3');
		expect(tbody.childAt(0).childAt(20).text(), '[peer 1] health unhealthy').to.be.equal('0');
		expect(
			tbody.childAt(0).childAt(21).prop('className'),
			'[peer 1] health_status className'
		).to.be.equal(`${ styles['left-align'] } ${ styles['bdr'] } ${ styles['flash'] }`);
		expect(tbody.childAt(0).childAt(21).text(), '[peer 1] health_status').to.be.equal('–');
		expect(tbody.childAt(0).childAt(22).text(), '[peer 1] header_time').to.be.equal('ms_formatted');
		expect(tbody.childAt(0).childAt(23).text(), '[peer 1] response_time').to.be.equal('ms_formatted');

		expect(tbody.childAt(1).children(), '[peer 2] td count').to.have.lengthOf(23);
		expect(
			tbody.childAt(1).childAt(2).childAt(0).text(),
			'[peer 2] address-container text'
		).to.be.equal('b test_server_2');
		expect(
			tbody.childAt(1).childAt(7).prop('className'),
			'[peer 2] responses 4xx className'
		).to.be.equal(styles['flash']);
		expect(
			tbody.childAt(1).childAt(8).prop('className'),
			'[peer 2] responses 5xx className'
		).to.be.equal(`${ styles['bdr'] } ${ styles['flash'] } ${ styles['red-flash'] }`);
		expect(tbody.childAt(1).childAt(10).text(), '[peer 2] max_conns').to.be.equal('123/s');
		expect(
			tbody.childAt(1).childAt(20).prop('className'),
			'[peer 2] health_status className'
		).to.be.equal(`${ styles['left-align'] } ${ styles['bdr'] } ${ styles['flash'] } ${ styles['red-flash'] }`);
		expect(tbody.childAt(1).childAt(20).text(), '[peer 2] health_status').to.be.equal('failed');

		expect(tbody.childAt(2).children(), '[peer 3] td count').to.have.lengthOf(23);
		expect(
			tbody.childAt(2).childAt(20).prop('className'),
			'[peer 3] health_status className'
		).to.be.equal(`${ styles['left-align'] } ${ styles['bdr'] } ${ styles['flash'] }`);
		expect(tbody.childAt(2).childAt(20).text(), '[peer 3] health_status').to.be.equal('passed');

		expect(tooltips.useTooltip.callCount, 'useTooltip call count').to.be.equal(10);
		expect(
			tooltips.useTooltip.args[4][0].type.name,
			'useTooltip, call 5, arg 1'
		).to.be.equal('PeerTooltip');
		expect(
			tooltips.useTooltip.args[4][0].props.peer,
			'useTooltip, call 5, arg 1, attr peer'
		).to.be.deep.equal(peers[0]);
		expect(
			tooltips.useTooltip.args[5][0].type.name,
			'useTooltip, call 6, arg 1'
		).to.be.equal('ConnectionsTooltip');
		expect(
			tooltips.useTooltip.args[5][0].props.peer,
			'useTooltip, call 6, arg 1, attr peer'
		).to.be.deep.equal(peers[0]);
		expect(tooltips.useTooltip.args[5][1], 'useTooltip, call 6, arg 2').to.be.equal('hint');
		expect(
			tooltips.useTooltip.args[6][0].type.name,
			'useTooltip, call 7, arg 1'
		).to.be.equal('PeerTooltip');
		expect(
			tooltips.useTooltip.args[6][0].props.peer,
			'useTooltip, call 7, arg 1, attr peer'
		).to.be.deep.equal(peers[1]);
		expect(
			tooltips.useTooltip.args[7][0].type.name,
			'useTooltip, call 8, arg 1'
		).to.be.equal('ConnectionsTooltip');
		expect(
			tooltips.useTooltip.args[7][0].props.peer,
			'useTooltip, call 8, arg 1, attr peer'
		).to.be.deep.equal(peers[1]);
		expect(tooltips.useTooltip.args[7][1], 'useTooltip, call 8, arg 2').to.be.equal('hint');
		expect(
			tooltips.useTooltip.args[8][0].type.name,
			'useTooltip, call 9, arg 1'
		).to.be.equal('PeerTooltip');
		expect(
			tooltips.useTooltip.args[8][0].props.peer,
			'useTooltip, call 9, arg 1, attr peer'
		).to.be.deep.equal(peers[2]);
		expect(
			tooltips.useTooltip.args[9][0].type.name,
			'useTooltip, call 10, arg 1'
		).to.be.equal('ConnectionsTooltip');
		expect(
			tooltips.useTooltip.args[9][0].props.peer,
			'useTooltip, call 10, arg 1, attr peer'
		).to.be.deep.equal(peers[2]);
		expect(tooltips.useTooltip.args[9][1], 'useTooltip, call 10, arg 2').to.be.equal('hint');

		expect(utils.formatUptime.calledThrice, 'formatUptime called thrice').to.be.true;
		expect(utils.formatUptime.args[0][0], 'formatUptime call 1, arg 1').to.be.equal(1000);
		expect(utils.formatUptime.args[0][1], 'formatUptime call 1, arg 2').to.be.true;
		expect(utils.formatUptime.args[1][0], 'formatUptime call 2, arg 1').to.be.an('undefined');
		expect(utils.formatUptime.args[1][1], 'formatUptime call 2, arg 2').to.be.true;
		expect(utils.formatUptime.args[2][0], 'formatUptime call 3, arg 1').to.be.an('undefined');
		expect(utils.formatUptime.args[2][1], 'formatUptime call 3, arg 2').to.be.true;

		expect(utils.formatReadableBytes.callCount, 'formatReadableBytes call count').to.be.equal(12);
		expect(utils.formatReadableBytes.args[0][0], 'formatReadableBytes call 1, arg 1').to.be.equal(40);
		expect(utils.formatReadableBytes.args[1][0], 'formatReadableBytes call 2, arg 1').to.be.equal(39);
		expect(utils.formatReadableBytes.args[2][0], 'formatReadableBytes call 3, arg 1').to.be.equal(400);
		expect(utils.formatReadableBytes.args[3][0], 'formatReadableBytes call 4, arg 1').to.be.equal(399);
		expect(utils.formatReadableBytes.args[4][0], 'formatReadableBytes call 5, arg 1').to.be.an('undefined');
		expect(utils.formatReadableBytes.args[5][0], 'formatReadableBytes call 6, arg 1').to.be.an('undefined');
		expect(utils.formatReadableBytes.args[6][0], 'formatReadableBytes call 7, arg 1').to.be.an('undefined');
		expect(utils.formatReadableBytes.args[7][0], 'formatReadableBytes call 8, arg 1').to.be.an('undefined');
		expect(utils.formatReadableBytes.args[8][0], 'formatReadableBytes call 9, arg 1').to.be.an('undefined');
		expect(utils.formatReadableBytes.args[9][0], 'formatReadableBytes call 10, arg 1').to.be.an('undefined');
		expect(utils.formatReadableBytes.args[10][0], 'formatReadableBytes call 11, arg 1').to.be.an('undefined');
		expect(utils.formatReadableBytes.args[11][0], 'formatReadableBytes call 12, arg 1').to.be.an('undefined');

		expect(utils.formatMs.callCount, 'formatMs call count').to.be.equal(6);
		expect(utils.formatMs.args[0][0], 'formatMs call 1, arg 1').to.be.equal(999);
		expect(utils.formatMs.args[1][0], 'formatMs call 2, arg 1').to.be.equal(99);
		expect(utils.formatMs.args[2][0], 'formatMs call 3, arg 1').to.be.an('undefined');
		expect(utils.formatMs.args[3][0], 'formatMs call 4, arg 1').to.be.an('undefined');
		expect(utils.formatMs.args[4][0], 'formatMs call 5, arg 1').to.be.an('undefined');
		expect(utils.formatMs.args[5][0], 'formatMs call 6, arg 1').to.be.an('undefined');

		expect(table.find(`.${ styles['edit-peer'] }`), '[editMode = false] edit-peer').to.have.lengthOf(0);

		wrapper.setState({
			hoveredColumns: true,
			editMode: true,
			columnsExpanded: true
		});
		table = shallow(
			instance.renderPeers(peers)
		);

		expect(table.prop('className'), 'table className').to.be.equal(
			`${ styles['table'] } ${ styles['wide'] } ${ styles['hovered-expander'] }`
		);
		expect(
			wrapper.find('table col'),
			'[editMode = true, columnsExpanded = true] table col length'
		).to.have.lengthOf(27);
		expect(
			table.find('thead').childAt(0).childAt(4).prop('colSpan'),
			'[columnsExpanded = true] head row 1, child 5 colspan'
		).to.be.equal(6);
		expect(
			table.find('thead').childAt(1).children(),
			'[columnsExpanded = true] head row 2, children length'
		).to.have.lengthOf(25);

		const editPeer = table.find(`.${ styles['edit-peer'] }`);

		expect(editPeer, '[editMode = true] edit-peer').to.have.lengthOf(3);
		expect(editPeer.at(0).prop('onClick'), '[editMode = true] edit-peer onClick').to.be.a('function');

		let clickOnEditPeerResult = editPeer.at(0).prop('onClick')();

		expect(
			clickOnEditPeerResult,
			'[peer 1] edit-peer onClick result'
		).to.be.equal('edit_selected_upstream_result');
		expect(instance.editSelectedUpstream.calledOnce, 'this.editSelectedUpstream called once').to.be.true;
		expect(
			instance.editSelectedUpstream.args[0][0],
			'this.editSelectedUpstream call 1, arg'
		).to.be.deep.equal(peers[0]);

		clickOnEditPeerResult = editPeer.at(1).prop('onClick')();

		expect(
			clickOnEditPeerResult,
			'[peer 2] edit-peer onClick result'
		).to.be.equal('edit_selected_upstream_result');
		expect(instance.editSelectedUpstream.calledTwice, 'this.editSelectedUpstream called twice').to.be.true;
		expect(
			instance.editSelectedUpstream.args[1][0],
			'this.editSelectedUpstream call 2, arg'
		).to.be.deep.equal(peers[1]);

		clickOnEditPeerResult = editPeer.at(2).prop('onClick')();

		expect(
			clickOnEditPeerResult,
			'[peer 3] edit-peer onClick result'
		).to.be.equal('edit_selected_upstream_result');
		expect(instance.editSelectedUpstream.calledThrice, 'this.editSelectedUpstream called thrice').to.be.true;
		expect(
			instance.editSelectedUpstream.args[2][0],
			'this.editSelectedUpstream call 3, arg'
		).to.be.deep.equal(peers[2]);

		tbody = table.find('tbody');

		expect(tbody.childAt(0).children(), '[columnsExpanded = true, peer 1] td count').to.have.lengthOf(27);
		expect(
			tbody.childAt(0).childAt(7).prop('rowspan'),
			'[columnsExpanded = true, peer 1] collapse-columns rowspan'
		).to.be.equal(3);
		expect(
			tbody.childAt(0).childAt(7).prop('onClick').name,
			'[columnsExpanded = true, peer 1] collapse-columns onClick'
		).to.be.equal('bound toggleColumns');
		expect(
			tbody.childAt(0).childAt(7).prop('onMouseEnter')(),
			'[columnsExpanded = true, peer 1] collapse-columns onMouseEnter'
		).to.be.equal('hover_columns_result');
		expect(instance.hoverColumns.calledOnce, '[onMouseEnter] this.hoverColumns called').to.be.true;
		expect(instance.hoverColumns.args[0][0], '[onMouseEnter] this.hoverColumns call arg').to.be.true;
		instance.hoverColumns.resetHistory();
		expect(
			tbody.childAt(0).childAt(7).prop('onMouseLeave')(),
			'[columnsExpanded = true, peer 1] collapse-columns onMouseLeave'
		).to.be.equal('hover_columns_result');
		expect(instance.hoverColumns.calledOnce, '[onMouseLeave] this.hoverColumns called').to.be.true;
		expect(instance.hoverColumns.args[0][0], '[onMouseLeave] this.hoverColumns call arg').to.be.false;
		expect(
			tbody.childAt(0).childAt(8).prop('className'),
			'[columnsExpanded = true, peer 1] 1xx className'
		).to.be.equal(styles['responses-column']);
		expect(
			tbody.childAt(0).childAt(8).text(),
			'[columnsExpanded = true, peer 1] 1xx'
		).to.be.equal('0');
		expect(
			tbody.childAt(0).childAt(9).prop('className'),
			'[columnsExpanded = true, peer 1] 2xx className'
		).to.be.equal(styles['responses-column']);
		expect(
			tbody.childAt(0).childAt(9).text(),
			'[columnsExpanded = true, peer 1] 2xx'
		).to.be.equal('110');
		expect(
			tbody.childAt(0).childAt(10).prop('className'),
			'[columnsExpanded = true, peer 1] 3xx className'
		).to.be.equal(styles['responses-column']);
		expect(
			tbody.childAt(0).childAt(10).text(),
			'[columnsExpanded = true, peer 1] 3xx'
		).to.be.equal('1');

		expect(tbody.childAt(1).children(), '[columnsExpanded = true, peer 2] td count').to.have.lengthOf(26);
		expect(
			tbody.childAt(1).childAt(7).prop('className'),
			'[columnsExpanded = true, peer 2] 1xx className'
		).to.be.equal(styles['responses-column']);
		expect(
			tbody.childAt(1).childAt(7).text(),
			'[columnsExpanded = true, peer 2] 1xx'
		).to.be.equal('1');
		expect(
			tbody.childAt(1).childAt(8).prop('className'),
			'[columnsExpanded = true, peer 2] 2xx className'
		).to.be.equal(styles['responses-column']);
		expect(
			tbody.childAt(1).childAt(8).text(),
			'[columnsExpanded = true, peer 2] 2xx'
		).to.be.equal('210');
		expect(
			tbody.childAt(1).childAt(9).prop('className'),
			'[columnsExpanded = true, peer 2] 3xx className'
		).to.be.equal(styles['responses-column']);
		expect(
			tbody.childAt(1).childAt(9).text(),
			'[columnsExpanded = true, peer 2] 3xx'
		).to.be.equal('2');

		expect(tbody.childAt(2).children(), '[columnsExpanded = true, peer 3] td count').to.have.lengthOf(26);
		expect(
			tbody.childAt(2).childAt(7).prop('className'),
			'[columnsExpanded = true, peer 3] 1xx className'
		).to.be.equal(styles['responses-column']);
		expect(
			tbody.childAt(2).childAt(7).text(),
			'[columnsExpanded = true, peer 3] 1xx'
		).to.be.equal('2');
		expect(
			tbody.childAt(2).childAt(8).prop('className'),
			'[columnsExpanded = true, peer 3] 2xx className'
		).to.be.equal(styles['responses-column']);
		expect(
			tbody.childAt(2).childAt(8).text(),
			'[columnsExpanded = true, peer 3] 2xx'
		).to.be.equal('310');
		expect(
			tbody.childAt(2).childAt(9).prop('className'),
			'[columnsExpanded = true, peer 3] 3xx className'
		).to.be.equal(styles['responses-column']);
		expect(
			tbody.childAt(2).childAt(9).text(),
			'[columnsExpanded = true, peer 3] 3xx'
		).to.be.equal('3');

		instance.getSelectAllCheckbox.restore();
		tooltips.useTooltip.restore();
		instance.renderEmptyList.restore();
		instance.getCheckbox.restore();
		utils.formatUptime.restore();
		utils.formatReadableBytes.restore();
		utils.formatMs.restore();
		instance.editSelectedUpstream.restore();
		instance.hoverColumns.restore();
	});
});
