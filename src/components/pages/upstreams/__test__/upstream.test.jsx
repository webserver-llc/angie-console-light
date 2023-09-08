/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import appsettings from '../../../../appsettings';
import tooltips from '../../../../tooltips/index.jsx';
import utils from '../../../../utils.js';
import envUtils from '../../../../env';
import Upstream from '../upstream.jsx';
import styles from '../../../table/style.css';
import { tableUtils } from '#/components/table';

describe('<Upstream />', () => {
	const props = {
		name: 'test',
		upstream: {
			peers: []
		}
	};

	it('constructor()', () => {
		jest.spyOn(appsettings, 'getSetting').mockClear().mockImplementation(() => 'get_settings_result');

		const toggleColumnsBindSpy = jest.spyOn(Upstream.prototype.toggleColumns, 'bind').mockClear();
		const hoverColumnsBindSpy = jest.spyOn(Upstream.prototype.hoverColumns, 'bind').mockClear();
		const wrapper = shallow(<Upstream {...props} />);

		// state hoveredColumns
		expect(wrapper.state('hoveredColumns')).toBe(false);
		// state columnsExpanded
		expect(wrapper.state('columnsExpanded')).toBe('get_settings_result');
		// getSetting called
		expect(appsettings.getSetting).toHaveBeenCalled();
		// getSetting call args
		expect(appsettings.getSetting).toHaveBeenCalledWith('columns-expanded-http-upstreams-test', false);
		// this.toggleColumns.bind called once
		expect(toggleColumnsBindSpy).toHaveBeenCalled();
		// this.toggleColumns.bind arg
		expect(toggleColumnsBindSpy.mock.calls[0][0] instanceof Upstream).toBe(true);
		// this.hoverColumns.bind called once
		expect(hoverColumnsBindSpy).toHaveBeenCalled();
		// this.hoverColumns.bind arg
		expect(hoverColumnsBindSpy.mock.calls[0][0] instanceof Upstream).toBe(true);

		hoverColumnsBindSpy.mockRestore();
		toggleColumnsBindSpy.mockRestore();
		appsettings.getSetting.mockRestore();
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(
			<Upstream
				{...props}
			/>
		);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).toBe('sorting-http-upstreams-test');
	});

	it('get FILTERING_SETTINGS_KEY', () => {
		const wrapper = shallow(
			<Upstream
				{...props}
			/>
		);

		expect(wrapper.instance().FILTERING_SETTINGS_KEY).toBe('filtering-http-upstreams-test');
	});

	it('toggleColumns()', () => {
		const wrapper = shallow(
			<Upstream
				{...props}
			/>
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'setState').mockClear().mockImplementation(() => {});
		jest.spyOn(appsettings, 'setSetting').mockClear().mockImplementation(() => {});

		instance.toggleColumns();

		// this.setState called
		expect(instance.setState).toHaveBeenCalled();
		// this.setState args
		expect(instance.setState.mock.calls[0][0]).toEqual({
			columnsExpanded: true,
			hoveredColumns: false,
		});
		// appsettings.setSetting called
		expect(appsettings.setSetting).toHaveBeenCalled();
		// appsettings.setSetting arg 1
		expect(appsettings.setSetting.mock.calls[0][0]).toBe('columns-expanded-http-upstreams-test');
		// appsettings.setSetting arg 2
		expect(appsettings.setSetting.mock.calls[0][1]).toBe(true);

		instance.setState.mockRestore();
		appsettings.setSetting.mockRestore();
	});

	it('hoverColumns()', () => {
		const hoveredColumns = 'hoveredColumns';
		const wrapper = shallow(
			<Upstream
				{...props}
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.hoverColumns(hoveredColumns);

		// this.setState not called
		expect(setStateSpy).not.toHaveBeenCalled();

		instance.setState({ columnsExpanded: true });
		wrapper.update();
		setStateSpy.mockReset();
		instance.hoverColumns(hoveredColumns);

		// this.setState called once
		expect(setStateSpy).toHaveBeenCalledTimes(1);
		// this.setState args
		expect(setStateSpy.mock.calls[0][0]).toEqual({ hoveredColumns });

		setStateSpy.mockRestore();
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
				'5xx': 2,
				codes: {
					200: 100,
					201: 10,
					301: 1,
					400: 2,
					403: 2,
					404: 6,
					500: 2,
				},
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
				last: '2023-08-15T10:38:41Z'
			},
			health_status: null,
			header_time: 999,
			response_time: 99,
			ssl: {
				handshakes: 135,
				handshakes_failed: 24,
				session_reuses: 19,
			},
		}, {
			id: 2,
			state: 'up',
			backup: true,
			server: 'test_server_2',
			responses: {
				'1xx': 1,
				'2xx': 210,
				'3xx': 2,
				codes: {
					200: 200,
					201: 10,
					301: 2,
				},
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
				codes: {
					200: 200,
					201: 110,
					301: 2,
					302: 1,
				},
			},
			health_checks: {},
			health_status: true
		}];
		const wrapper = shallow(
			<Upstream
				name="test"
				upstream={{
					configured_health_checks: true,
					peers: []
				}}
			/>
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'getSelectAllCheckbox').mockClear().mockImplementation(
			() => <div id="getSelectAllCheckbox_result" />
		);
		jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({
			prop_from_useTooltip: true
		}));
		jest.spyOn(instance, 'renderEmptyList').mockClear().mockImplementation(
			() => <tr id="renderEmptyList_result" />
		);
		jest.spyOn(instance, 'getCheckbox').mockClear().mockImplementation(
			({ id }) => <td id={`getCheckbox_result_${ id }`} />
		);
		jest.spyOn(utils, 'formatUptime').mockClear().mockImplementation(() => 'time_formatted');
		jest.spyOn(utils, 'formatReadableBytes').mockClear().mockImplementation(() => 'readable_bytes_formatted');
		jest.spyOn(utils, 'formatMs').mockClear().mockImplementation(() => 'ms_formatted');
		jest.spyOn(utils, 'formatLastCheckDate').mockClear().mockImplementation(() => 'ms_formatted');
		jest.spyOn(tableUtils, 'responsesTextWithTooltip').mockClear().mockImplementation((value) => value);
		jest.spyOn(instance, 'editSelectedUpstream').mockClear().mockImplementation(() => 'edit_selected_upstream_result');
		jest.spyOn(instance, 'hoverColumns').mockClear().mockImplementation(() => 'hover_columns_result');

		/**
		 * Empty list
		 */
		let table = shallow(
			instance.renderPeers([])
		);

		// table html tag
		expect(table.type()).toBe('table');
		// table className
		expect(table.prop('className')).toBe(`${ styles.table } ${ styles.wide }`);
		// [editMode = false, columnsExpanded = false] table col length
		expect(wrapper.find('table col')).toHaveLength(20);

		const tableSortControl = table.find('TableSortControl');

		// TableSortControl secondSortLabel
		expect(tableSortControl.prop('secondSortLabel')).toBe('Sort by status - down first');
		// TableSortControl order
		expect(tableSortControl.prop('order')).toBe(wrapper.state('sortOrder'));
		// TableSortControl onChange
		expect(tableSortControl.prop('onChange').name).toBe('bound changeSorting');
		// this.getSelectAllCheckbox result pasted
		expect(table.find('#getSelectAllCheckbox_result')).toHaveLength(1);
		// this.getSelectAllCheckbox called once
		expect(instance.getSelectAllCheckbox).toHaveBeenCalled();
		// this.getSelectAllCheckbox call arg
		expect(instance.getSelectAllCheckbox.mock.calls[0][0]).toEqual([]);

		const headRow = table.find('thead').childAt(0);

		// head row 1, child 3 colspan
		expect(headRow.childAt(2).prop('colSpan')).toBe('3');
		// head row 1, child 4 colspan
		expect(headRow.childAt(3).prop('colSpan')).toBe('2');
		// [columnsExpanded = false] head row 1, child 5 colspan
		expect(headRow.childAt(4).prop('colSpan')).toBe(3);
		// head row 1, child 6 colspan
		expect(headRow.childAt(5).prop('colSpan')).toBe('2');
		// head row 1, child 7 colspan
		expect(headRow.childAt(6).prop('colSpan')).toBe('4');
		// head row 1, child 8 colspan
		expect(headRow.childAt(7).prop('colSpan')).toBe('2');
		// [columnsExpanded = false] head row 2, children length
		expect(table.find('thead').childAt(1).children()).toHaveLength(19);

		const headTooltips = table.find(`thead .${ styles.hinted }`);

		// thead tooltips length
		expect(headTooltips).toHaveLength(4);
		// thead tooltip 1 props
		expect(headTooltips.at(0).prop('prop_from_useTooltip')).toBe(true);
		// thead tooltip 2 props
		expect(headTooltips.at(1).prop('prop_from_useTooltip')).toBe(true);
		// thead tooltip 3 props
		expect(headTooltips.at(2).prop('prop_from_useTooltip')).toBe(true);
		// thead tooltip 4 props
		expect(headTooltips.at(3).prop('prop_from_useTooltip')).toBe(true);
		expect(tooltips.useTooltip).toHaveBeenCalledTimes(4);
		// useTooltip, call 2, arg 1
		expect(tooltips.useTooltip.mock.calls[0][0]).toBe('Total downtime');
		// useTooltip, call 2, arg 2
		expect(tooltips.useTooltip.mock.calls[0][1]).toBe('hint');
		// useTooltip, call 3, arg 1
		expect(tooltips.useTooltip.mock.calls[1][0]).toBe('Weight');
		// useTooltip, call 3, arg 2
		expect(tooltips.useTooltip.mock.calls[1][1]).toBe('hint');
		// useTooltip, call 4, arg 1
		expect(tooltips.useTooltip.mock.calls[2][0]).toBe('Active');
		// useTooltip, call 4, arg 2
		expect(tooltips.useTooltip.mock.calls[2][1]).toBe('hint');
		// useTooltip, call 5, arg 1
		expect(tooltips.useTooltip.mock.calls[3][0]).toBe('Limit');
		// useTooltip, call 5, arg 2
		expect(tooltips.useTooltip.mock.calls[3][1]).toBe('hint');

		let tbody = table.find('tbody');

		// [no peers] tbody children
		expect(tbody.children()).toHaveLength(1);
		// [no peers] tbody child
		expect(tbody.childAt(0).prop('id')).toBe('renderEmptyList_result');
		// this.renderEmptyList called once
		expect(instance.renderEmptyList).toHaveBeenCalled();
		// this.getCheckbox not called
		expect(instance.getCheckbox).not.toHaveBeenCalled();

		/**
		 * Non empty list
		 */
		tooltips.useTooltip.mockClear();
		instance.renderEmptyList.mockClear();
		table = shallow(
			instance.renderPeers(peers)
		);
		tbody = table.find('tbody');

		// [with peers] this.renderEmptyList not called
		expect(instance.renderEmptyList).not.toHaveBeenCalled();
		// [with peers] tbody children length
		expect(tbody.children()).toHaveLength(3);

		// Peer 1
		// [peer 1] td count
		expect(tbody.childAt(0).children()).toHaveLength(21);
		// [peer 1] peer state
		expect(tbody.childAt(0).childAt(0).prop('className')).toBe(styles.up);
		// [peer 1] this.getCheckbox rendered
		expect(tbody.childAt(0).childAt(1).prop('id')).toBe('getCheckbox_result_1');
		// [peer 1] address-container className
		expect(tbody.childAt(0).childAt(2).childAt(0).prop('className')).toBe(styles['address-container']);
		// [peer 1] address-container, useTooltip applied
		expect(tbody.childAt(0).childAt(2).childAt(0).prop('prop_from_useTooltip')).toBe(true);
		// [peer 1] address-container text
		expect(tbody.childAt(0).childAt(2).childAt(0).text()).toBe('test_server_1');
		// [peer 1] peer downtime
		expect(tbody.childAt(0).childAt(3).text()).toBe('time_formatted');
		// [peer 1] peer weight
		expect(tbody.childAt(0).childAt(4).text()).toBe('1');
		// [peer 1] requests className
		expect(tbody.childAt(0).childAt(5).childAt(0).prop('className')).toBe(styles.hinted);
		// [peer 1] requests, useTooltip applied
		expect(tbody.childAt(0).childAt(5).childAt(0).prop('prop_from_useTooltip')).toBe(true);
		// [peer 1] requests text
		expect(tbody.childAt(0).childAt(5).childAt(0).text()).toBe('123');
		// [peer 1] server_req_s
		expect(tbody.childAt(0).childAt(6).text()).toBe('3');
		// [peer 1] collapse-columns className
		expect(tbody.childAt(0).childAt(7).prop('className')).toBe(styles['collapse-columns']);
		// [peer 1] collapse-columns rowspan
		expect(tbody.childAt(0).childAt(7).prop('rowSpan')).toBe(3);
		// [peer 1] collapse-columns onClick
		expect(tbody.childAt(0).childAt(7).prop('onClick').name).toBe('bound toggleColumns');
		// [peer 1] responses 4xx className
		expect(tbody.childAt(0).childAt(8).prop('className')).toBe(`${ styles.flash } ${ styles['red-flash'] }`);
		// [peer 1] responses 4xx
		expect(tbody.childAt(0).childAt(8).text()).toBe('10');
		// [peer 1] responses 5xx className
		expect(tbody.childAt(0).childAt(9).prop('className')).toBe(`${ styles.bdr } ${ styles.flash }`);
		// [peer 1] responses 5xx
		expect(tbody.childAt(0).childAt(9).text()).toBe('2');
		// [peer 1] active className
		expect(tbody.childAt(0).childAt(10).prop('className')).toBe(styles['center-align']);
		// [peer 1] active
		expect(tbody.childAt(0).childAt(10).text()).toBe('10000');
		// [peer 1] max_conns className
		expect(tbody.childAt(0).childAt(11).prop('className')).toBe(`${ styles['center-align'] } ${ styles.bdr }`);
		// [peer 1] max_conns
		expect(tbody.childAt(0).childAt(11).text()).toBe('∞');
		// [peer 1] server_sent_s className
		expect(tbody.childAt(0).childAt(12).prop('className')).toBe(styles.px60);
		// [peer 1] server_sent_s
		expect(tbody.childAt(0).childAt(12).text()).toBe('readable_bytes_formatted');
		// [peer 1] server_rcvd_s className
		expect(tbody.childAt(0).childAt(13).prop('className')).toBe(styles.px60);
		// [peer 1] server_rcvd_s
		expect(tbody.childAt(0).childAt(13).text()).toBe('readable_bytes_formatted');
		// [peer 1] sent
		expect(tbody.childAt(0).childAt(14).text()).toBe('readable_bytes_formatted');
		// [peer 1] received
		expect(tbody.childAt(0).childAt(15).text()).toBe('readable_bytes_formatted');
		// [peer 1] fails
		expect(tbody.childAt(0).childAt(16).text()).toBe('1');
		// [peer 1] unavail className
		expect(tbody.childAt(0).childAt(17).prop('className')).toBe(styles.bdr);
		// [peer 1] unavail
		expect(tbody.childAt(0).childAt(17).text()).toBe('2');
		// [peer 1] health checks
		expect(tbody.childAt(0).childAt(18).text()).toBe('24');
		// [peer 1] health fails
		expect(tbody.childAt(0).childAt(19).text()).toBe('3');
		// [peer 1] health last
		expect(tbody.childAt(0).childAt(20).text()).toBe('ms_formatted');

		// TODO: Add tests for SSL Verify Failures cell

		// Peer 2
		// [peer 2] td count
		expect(tbody.childAt(1).children()).toHaveLength(20);
		// [peer 2] address-container text
		expect(tbody.childAt(1).childAt(2).childAt(0).text()).toBe('b test_server_2');
		// [peer 2] responses 4xx className
		expect(tbody.childAt(1).childAt(7).prop('className')).toBe(styles.flash);
		// [peer 2] responses 5xx className
		expect(tbody.childAt(1).childAt(8).prop('className')).toBe(`${ styles.bdr } ${ styles.flash } ${ styles['red-flash'] }`);
		// [peer 2] max_conns
		expect(tbody.childAt(1).childAt(10).text()).toBe('123/s');

		// TODO: Add tests for SSL Verify Failures cell

		// Peer 3
		// [peer 3] td count
		expect(tbody.childAt(2).children()).toHaveLength(20);

		// Tooltips
		expect(tooltips.useTooltip).toHaveBeenCalledTimes(10);
		// useTooltip, peer 1, PeerTooltip
		expect(tooltips.useTooltip.mock.calls[4][0].type.name).toBe('PeerTooltip');
		// useTooltip, peer 1, PeerTooltip, attr peer
		expect(tooltips.useTooltip.mock.calls[4][0].props.peer).toEqual(peers[0]);
		// useTooltip, peer 1, ConnectionsTooltip
		expect(tooltips.useTooltip.mock.calls[5][0].type.name).toBe('ConnectionsTooltip');
		// useTooltip, peer 1, ConnectionsTooltip, attr peer
		expect(tooltips.useTooltip.mock.calls[5][0].props.peer).toEqual(peers[0]);
		// useTooltip, peer 1, ConnectionsTooltip, arg 2
		expect(tooltips.useTooltip.mock.calls[5][1]).toBe('hint');
		// useTooltip, peer 2, PeerTooltip
		expect(tooltips.useTooltip.mock.calls[6][0].type.name).toBe('PeerTooltip');
		// useTooltip, peer 2, PeerTooltip, attr peer
		expect(tooltips.useTooltip.mock.calls[6][0].props.peer).toEqual(peers[1]);
		// useTooltip, peer 2, ConnectionsTooltip
		expect(tooltips.useTooltip.mock.calls[7][0].type.name).toBe('ConnectionsTooltip');
		// useTooltip, peer 2, ConnectionsTooltip, attr peer
		expect(tooltips.useTooltip.mock.calls[7][0].props.peer).toEqual(peers[1]);
		// useTooltip, peer 2, ConnectionsTooltip, arg 2
		expect(tooltips.useTooltip.mock.calls[7][1]).toBe('hint');
		// useTooltip, peer 3, PeerTooltip
		expect(tooltips.useTooltip.mock.calls[8][0].type.name).toBe('PeerTooltip');
		// useTooltip, peer 3, PeerTooltip, attr peer
		expect(tooltips.useTooltip.mock.calls[8][0].props.peer).toEqual(peers[2]);
		// useTooltip, peer 3, ConnectionsTooltip
		expect(tooltips.useTooltip.mock.calls[9][0].type.name).toBe('ConnectionsTooltip');
		// useTooltip, peer 3, ConnectionsTooltip, attr peer
		expect(tooltips.useTooltip.mock.calls[9][0].props.peer).toEqual(peers[2]);
		// useTooltip, peer 3, ConnectionsTooltip, arg 2
		expect(tooltips.useTooltip.mock.calls[9][1]).toBe('hint');

		expect(tableUtils.responsesTextWithTooltip).toHaveBeenCalledTimes(6);
		// [cols collapsed] responsesTextWithTooltip peer 1, 4xx, arg 1
		expect(tableUtils.responsesTextWithTooltip.mock.calls[0][0]).toBe(peers[0].responses['4xx']);
		// [cols collapsed] responsesTextWithTooltip peer 1, 4xx, arg 2
		expect(tableUtils.responsesTextWithTooltip.mock.calls[0][1]).toBe(peers[0].responses.codes);
		// [cols collapsed] responsesTextWithTooltip peer 1, 4xx, arg 3
		expect(tableUtils.responsesTextWithTooltip.mock.calls[0][2]).toBe('4');
		// [cols collapsed] responsesTextWithTooltip peer 1, 5xx, arg 1
		expect(tableUtils.responsesTextWithTooltip.mock.calls[1][0]).toBe(peers[0].responses['5xx']);
		// [cols collapsed] responsesTextWithTooltip peer 1, 5xx, arg 2
		expect(tableUtils.responsesTextWithTooltip.mock.calls[1][1]).toBe(peers[0].responses.codes);
		// [cols collapsed] responsesTextWithTooltip peer 1, 5xx, arg 3
		expect(tableUtils.responsesTextWithTooltip.mock.calls[1][2]).toBe('5');
		// [cols collapsed] responsesTextWithTooltip peer 2, 4xx, arg 1
		expect(tableUtils.responsesTextWithTooltip.mock.calls[2][0]).toBe(peers[1].responses['4xx']);
		// [cols collapsed] responsesTextWithTooltip peer 2, 4xx, arg 2
		expect(tableUtils.responsesTextWithTooltip.mock.calls[2][1]).toBe(peers[1].responses.codes);
		// [cols collapsed] responsesTextWithTooltip peer 2, 4xx, arg 3
		expect(tableUtils.responsesTextWithTooltip.mock.calls[2][2]).toBe('4');
		// [cols collapsed] responsesTextWithTooltip peer 2, 5xx, arg 1
		expect(tableUtils.responsesTextWithTooltip.mock.calls[3][0]).toBe(peers[1].responses['5xx']);
		// [cols collapsed] responsesTextWithTooltip peer 2, 5xx, arg 2
		expect(tableUtils.responsesTextWithTooltip.mock.calls[3][1]).toBe(peers[1].responses.codes);
		// [cols collapsed] responsesTextWithTooltip peer 2, 5xx, arg 3
		expect(tableUtils.responsesTextWithTooltip.mock.calls[3][2]).toBe('5');
		// [cols collapsed] responsesTextWithTooltip peer 3, 4xx, arg 1
		expect(tableUtils.responsesTextWithTooltip.mock.calls[4][0]).toBe(peers[2].responses['4xx']);
		// [cols collapsed] responsesTextWithTooltip peer 3, 4xx, arg 2
		expect(tableUtils.responsesTextWithTooltip.mock.calls[4][1]).toBe(peers[2].responses.codes);
		// [cols collapsed] responsesTextWithTooltip peer 3, 4xx, arg 3
		expect(tableUtils.responsesTextWithTooltip.mock.calls[4][2]).toBe('4');
		// [cols collapsed] responsesTextWithTooltip peer 3, 5xx, arg 1
		expect(tableUtils.responsesTextWithTooltip.mock.calls[5][0]).toBe(peers[2].responses['5xx']);
		// [cols collapsed] responsesTextWithTooltip peer 3, 5xx, arg 2
		expect(tableUtils.responsesTextWithTooltip.mock.calls[5][1]).toBe(peers[2].responses.codes);
		// [cols collapsed] responsesTextWithTooltip peer 3, 5xx, arg 3
		expect(tableUtils.responsesTextWithTooltip.mock.calls[5][2]).toBe('5');

		// formatUptime called thrice
		expect(utils.formatUptime).toHaveBeenCalledTimes(3);
		// formatUptime call 1, arg 1
		expect(utils.formatUptime.mock.calls[0][0]).toBe(1000);
		// formatUptime call 1, arg 2
		expect(utils.formatUptime.mock.calls[0][1]).toBe(true);
		expect(utils.formatUptime.mock.calls[1][0]).toBeUndefined();
		// formatUptime call 2, arg 2
		expect(utils.formatUptime.mock.calls[1][1]).toBe(true);
		expect(utils.formatUptime.mock.calls[2][0]).toBeUndefined();
		// formatUptime call 3, arg 2
		expect(utils.formatUptime.mock.calls[2][1]).toBe(true);

		expect(utils.formatReadableBytes).toHaveBeenCalledTimes(12);
		// formatReadableBytes call 1, arg 1
		expect(utils.formatReadableBytes.mock.calls[0][0]).toBe(40);
		// formatReadableBytes call 2, arg 1
		expect(utils.formatReadableBytes.mock.calls[1][0]).toBe(39);
		// formatReadableBytes call 3, arg 1
		expect(utils.formatReadableBytes.mock.calls[2][0]).toBe(400);
		// formatReadableBytes call 4, arg 1
		expect(utils.formatReadableBytes.mock.calls[3][0]).toBe(399);
		expect(utils.formatReadableBytes.mock.calls[4][0]).toBeUndefined();
		expect(utils.formatReadableBytes.mock.calls[5][0]).toBeUndefined();
		expect(utils.formatReadableBytes.mock.calls[6][0]).toBeUndefined();
		expect(utils.formatReadableBytes.mock.calls[7][0]).toBeUndefined();
		expect(utils.formatReadableBytes.mock.calls[8][0]).toBeUndefined();
		expect(utils.formatReadableBytes.mock.calls[9][0]).toBeUndefined();
		expect(utils.formatReadableBytes.mock.calls[10][0]).toBeUndefined();
		expect(utils.formatReadableBytes.mock.calls[11][0]).toBeUndefined();

		// [editMode = false] edit-peer
		expect(table.find(`.${ styles['edit-peer'] }`)).toHaveLength(0);

		/**
		 * Non empty list in edit mode + expanded columns
		 */
		tableUtils.responsesTextWithTooltip.mockClear();
		wrapper.setState({
			hoveredColumns: true,
			editMode: true,
			columnsExpanded: true
		});
		table = shallow(
			instance.renderPeers(peers)
		);

		// table className
		expect(table.prop('className')).toBe(`${ styles.table } ${ styles.wide } ${ styles['hovered-expander'] }`);
		// [editMode = true, columnsExpanded = true] table col length
		expect(wrapper.find('table col')).toHaveLength(24);
		// [columnsExpanded = true] head row 1, child 5 colspan
		expect(table.find('thead').childAt(0).childAt(4).prop('colSpan')).toBe(6);
		// [columnsExpanded = true] head row 2, children length
		expect(table.find('thead').childAt(1).children()).toHaveLength(22);

		expect(tableUtils.responsesTextWithTooltip).toHaveBeenCalledTimes(15);
		peers.forEach((peer, i) => {
			const j = i * 5;

			// [cols expanded] responsesTextWithTooltip row ${i}, 1xx, arg 1
			expect(tableUtils.responsesTextWithTooltip.mock.calls[0 + j][0]).toBe(peers[i].responses['1xx']);
			// [cols expanded] responsesTextWithTooltip row ${i}, 1xx, arg 2
			expect(tableUtils.responsesTextWithTooltip.mock.calls[0 + j][1]).toBe(peers[i].responses.codes);
			// [cols expanded] responsesTextWithTooltip row ${i}, 1xx, arg 3
			expect(tableUtils.responsesTextWithTooltip.mock.calls[0 + j][2]).toBe('1');
			// [cols expanded] responsesTextWithTooltip row ${i}, 2xx, arg 1
			expect(tableUtils.responsesTextWithTooltip.mock.calls[1 + j][0]).toBe(peers[i].responses['2xx']);
			// [cols expanded] responsesTextWithTooltip row ${i}, 2xx, arg 2
			expect(tableUtils.responsesTextWithTooltip.mock.calls[1 + j][1]).toBe(peers[i].responses.codes);
			// [cols expanded] responsesTextWithTooltip row ${i}, 2xx, arg 3
			expect(tableUtils.responsesTextWithTooltip.mock.calls[1 + j][2]).toBe('2');
			// [cols expanded] responsesTextWithTooltip row ${i}, 3xx, arg 1
			expect(tableUtils.responsesTextWithTooltip.mock.calls[2 + j][0]).toBe(peers[i].responses['3xx']);
			// [cols expanded] responsesTextWithTooltip row ${i}, 3xx, arg 2
			expect(tableUtils.responsesTextWithTooltip.mock.calls[2 + j][1]).toBe(peers[i].responses.codes);
			// [cols expanded] responsesTextWithTooltip row ${i}, 3xx, arg 3
			expect(tableUtils.responsesTextWithTooltip.mock.calls[2 + j][2]).toBe('3');
			// [cols expanded] responsesTextWithTooltip row ${i}, 4xx, arg 1
			expect(tableUtils.responsesTextWithTooltip.mock.calls[3 + j][0]).toBe(peers[i].responses['4xx']);
			// [cols expanded] responsesTextWithTooltip row ${i}, 4xx, arg 2
			expect(tableUtils.responsesTextWithTooltip.mock.calls[3 + j][1]).toBe(peers[i].responses.codes);
			// [cols expanded] responsesTextWithTooltip row ${i}, 4xx, arg 3
			expect(tableUtils.responsesTextWithTooltip.mock.calls[3 + j][2]).toBe('4');
			// [cols expanded] responsesTextWithTooltip row ${i}, 5xx, arg 1
			expect(tableUtils.responsesTextWithTooltip.mock.calls[4 + j][0]).toBe(peers[i].responses['5xx']);
			// [cols expanded] responsesTextWithTooltip row ${i}, 5xx, arg 2
			expect(tableUtils.responsesTextWithTooltip.mock.calls[4 + j][1]).toBe(peers[i].responses.codes);
			// [cols expanded] responsesTextWithTooltip row ${i}, 5xx, arg 3
			expect(tableUtils.responsesTextWithTooltip.mock.calls[4 + j][2]).toBe('5');
		});

		const editPeer = table.find(`.${ styles['edit-peer'] }`);

		// [editMode = true] edit-peer
		expect(editPeer).toHaveLength(3);
		expect(editPeer.at(0).prop('onClick')).toBeInstanceOf(Function);

		let clickOnEditPeerResult = editPeer.at(0).prop('onClick')();

		// [peer 1] edit-peer onClick result
		expect(clickOnEditPeerResult).toBe('edit_selected_upstream_result');
		// this.editSelectedUpstream called once
		expect(instance.editSelectedUpstream).toHaveBeenCalled();
		// this.editSelectedUpstream call 1, arg
		expect(instance.editSelectedUpstream.mock.calls[0][0]).toEqual(peers[0]);

		clickOnEditPeerResult = editPeer.at(1).prop('onClick')();

		// [peer 2] edit-peer onClick result
		expect(clickOnEditPeerResult).toBe('edit_selected_upstream_result');
		// this.editSelectedUpstream called twice
		expect(instance.editSelectedUpstream).toHaveBeenCalledTimes(2);
		// this.editSelectedUpstream call 2, arg
		expect(instance.editSelectedUpstream.mock.calls[1][0]).toEqual(peers[1]);

		clickOnEditPeerResult = editPeer.at(2).prop('onClick')();

		// [peer 3] edit-peer onClick result
		expect(clickOnEditPeerResult).toBe('edit_selected_upstream_result');
		// this.editSelectedUpstream called thrice
		expect(instance.editSelectedUpstream).toHaveBeenCalledTimes(3);
		// this.editSelectedUpstream call 3, arg
		expect(instance.editSelectedUpstream.mock.calls[2][0]).toEqual(peers[2]);

		tbody = table.find('tbody');

		// [columnsExpanded = true, peer 1] td count
		expect(tbody.childAt(0).children()).toHaveLength(24);
		// [columnsExpanded = true, peer 1] collapse-columns rowspan
		expect(tbody.childAt(0).childAt(7).prop('rowSpan')).toBe(3);
		// [columnsExpanded = true, peer 1] collapse-columns onClick
		expect(tbody.childAt(0).childAt(7).prop('onClick').name).toBe('bound toggleColumns');
		// [columnsExpanded = true, peer 1] collapse-columns onMouseEnter
		expect(tbody.childAt(0).childAt(7).prop('onMouseEnter')()).toBe('hover_columns_result');
		// [onMouseEnter] this.hoverColumns called
		expect(instance.hoverColumns).toHaveBeenCalled();
		// [onMouseEnter] this.hoverColumns call arg
		expect(instance.hoverColumns.mock.calls[0][0]).toBe(true);
		instance.hoverColumns.mockClear();
		// [columnsExpanded = true, peer 1] collapse-columns onMouseLeave
		expect(tbody.childAt(0).childAt(7).prop('onMouseLeave')()).toBe('hover_columns_result');
		// [onMouseLeave] this.hoverColumns called
		expect(instance.hoverColumns).toHaveBeenCalled();
		// [onMouseLeave] this.hoverColumns call arg
		expect(instance.hoverColumns.mock.calls[0][0]).toBe(false);
		// [columnsExpanded = true, peer 1] 1xx className
		expect(tbody.childAt(0).childAt(8).prop('className')).toBe(styles['responses-column']);
		// [columnsExpanded = true, peer 1] 1xx
		expect(tbody.childAt(0).childAt(8).text()).toBe('0');
		// [columnsExpanded = true, peer 1] 2xx className
		expect(tbody.childAt(0).childAt(9).prop('className')).toBe(styles['responses-column']);
		// [columnsExpanded = true, peer 1] 2xx
		expect(tbody.childAt(0).childAt(9).text()).toBe('110');
		// [columnsExpanded = true, peer 1] 3xx className
		expect(tbody.childAt(0).childAt(10).prop('className')).toBe(styles['responses-column']);
		// [columnsExpanded = true, peer 1] 3xx
		expect(tbody.childAt(0).childAt(10).text()).toBe('1');

		// [columnsExpanded = true, peer 2] td count
		expect(tbody.childAt(1).children()).toHaveLength(23);
		// [columnsExpanded = true, peer 2] 1xx className
		expect(tbody.childAt(1).childAt(7).prop('className')).toBe(styles['responses-column']);
		// [columnsExpanded = true, peer 2] 1xx
		expect(tbody.childAt(1).childAt(7).text()).toBe('1');
		// [columnsExpanded = true, peer 2] 2xx className
		expect(tbody.childAt(1).childAt(8).prop('className')).toBe(styles['responses-column']);
		// [columnsExpanded = true, peer 2] 2xx
		expect(tbody.childAt(1).childAt(8).text()).toBe('210');
		// [columnsExpanded = true, peer 2] 3xx className
		expect(tbody.childAt(1).childAt(9).prop('className')).toBe(styles['responses-column']);
		// [columnsExpanded = true, peer 2] 3xx
		expect(tbody.childAt(1).childAt(9).text()).toBe('2');

		// [columnsExpanded = true, peer 3] td count
		expect(tbody.childAt(2).children()).toHaveLength(23);
		// [columnsExpanded = true, peer 3] 1xx className
		expect(tbody.childAt(2).childAt(7).prop('className')).toBe(styles['responses-column']);
		// [columnsExpanded = true, peer 3] 1xx
		expect(tbody.childAt(2).childAt(7).text()).toBe('2');
		// [columnsExpanded = true, peer 3] 2xx className
		expect(tbody.childAt(2).childAt(8).prop('className')).toBe(styles['responses-column']);
		// [columnsExpanded = true, peer 3] 2xx
		expect(tbody.childAt(2).childAt(8).text()).toBe('310');
		// [columnsExpanded = true, peer 3] 3xx className
		expect(tbody.childAt(2).childAt(9).prop('className')).toBe(styles['responses-column']);
		// [columnsExpanded = true, peer 3] 3xx
		expect(tbody.childAt(2).childAt(9).text()).toBe('3');

		instance.getSelectAllCheckbox.mockRestore();
		tooltips.useTooltip.mockRestore();
		instance.renderEmptyList.mockRestore();
		instance.getCheckbox.mockRestore();
		utils.formatUptime.mockRestore();
		utils.formatReadableBytes.mockRestore();
		utils.formatMs.mockRestore();
		utils.formatLastCheckDate.mockRestore();
		tableUtils.responsesTextWithTooltip.mockRestore();
		instance.editSelectedUpstream.mockRestore();
		instance.hoverColumns.mockRestore();
	});

	it('renderPeers() with configured_health_checks = false', () => {
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
				'5xx': 2,
				codes: {
					200: 100,
					201: 10,
					301: 1,
					400: 2,
					403: 2,
					404: 6,
					500: 2,
				},
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
			health_checks: {},
			health_status: null,
			header_time: 999,
			response_time: 99,
			ssl: {
				handshakes: 135,
				handshakes_failed: 24,
				session_reuses: 19,
			},
		}];
		const wrapper = shallow(
			<Upstream
				name="test"
				upstream={{
					configured_health_checks: false,
					peers: []
				}}
			/>
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'getSelectAllCheckbox').mockClear().mockImplementation(
			() => <div id="getSelectAllCheckbox_result" />
		);
		jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({
			prop_from_useTooltip: true
		}));
		jest.spyOn(instance, 'renderEmptyList').mockClear().mockImplementation(
			() => <tr id="renderEmptyList_result" />
		);
		jest.spyOn(instance, 'getCheckbox').mockClear().mockImplementation(
			({ id }) => <td id={`getCheckbox_result_${ id }`} />
		);
		jest.spyOn(utils, 'formatUptime').mockClear().mockImplementation(() => 'time_formatted');
		jest.spyOn(utils, 'formatReadableBytes').mockClear().mockImplementation(() => 'readable_bytes_formatted');
		jest.spyOn(utils, 'formatMs').mockClear().mockImplementation(() => 'ms_formatted');
		jest.spyOn(utils, 'formatLastCheckDate').mockClear().mockImplementation(() => 'ms_formatted');
		jest.spyOn(tableUtils, 'responsesTextWithTooltip').mockClear().mockImplementation((value) => value);
		jest.spyOn(instance, 'editSelectedUpstream').mockClear().mockImplementation(() => 'edit_selected_upstream_result');
		jest.spyOn(instance, 'hoverColumns').mockClear().mockImplementation(() => 'hover_columns_result');

		/**
		 * Empty list
		 */
		const table = shallow(
			instance.renderPeers(peers)
		);

		const thead = table.find('thead');
		// head row 1, children length
		expect(thead.childAt(0).children()).toHaveLength(8);
		// head row 2, children length
		expect(thead.childAt(1).children()).toHaveLength(16);
		const tbody = table.find('tbody');
		// [with peers] tbody children length
		expect(tbody.children()).toHaveLength(1);
		// [peer 1] td count
		expect(tbody.childAt(0).children()).toHaveLength(18);

		instance.getSelectAllCheckbox.mockRestore();
		tooltips.useTooltip.mockRestore();
		instance.renderEmptyList.mockRestore();
		instance.getCheckbox.mockRestore();
		utils.formatUptime.mockRestore();
		utils.formatReadableBytes.mockRestore();
		utils.formatMs.mockRestore();
		utils.formatLastCheckDate.mockRestore();
		tableUtils.responsesTextWithTooltip.mockRestore();
		instance.editSelectedUpstream.mockRestore();
		instance.hoverColumns.mockRestore();
	});

	describe('renderPeers() with isDemoEnv = true', () => {
		beforeEach(() => {
			jest.spyOn(envUtils, 'isDemoEnv').mockClear().mockImplementation(() => true);
		});

		afterEach(() => {
			envUtils.isDemoEnv.mockRestore();
		});

		it('configured_health_checks = false', () => {
			const wrapper = shallow(
				<Upstream
					name="test"
					upstream={{
						configured_health_checks: false,
						peers: []
					}}
				/>
			);
			const instance = wrapper.instance();
			const table = shallow(
				instance.renderPeers([])
			);

			const thead = table.find('thead');
			// head row 1, children length
			expect(thead.childAt(0).children()).toHaveLength(7);
			// head row 2, children length
			expect(thead.childAt(1).children()).toHaveLength(6);
			// head row 3, children length
			expect(thead.childAt(2).children()).toHaveLength(16);
		});

		it('configured_health_checks = true', () => {
			const wrapper = shallow(
				<Upstream
					name="test"
					upstream={{
						configured_health_checks: true,
						peers: []
					}}
				/>
			);
			const instance = wrapper.instance();
			const table = shallow(
				instance.renderPeers([])
			);

			const thead = table.find('thead');
			// head row 1, children length
			expect(thead.childAt(0).children()).toHaveLength(8);
			// head row 2, children length
			expect(thead.childAt(1).children()).toHaveLength(7);
			// head row 3, children length
			expect(thead.childAt(2).children()).toHaveLength(19);
		});
	});
});
