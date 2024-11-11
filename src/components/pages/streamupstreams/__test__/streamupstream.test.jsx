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
import StreamUpstream from '../streamupstream.jsx';
import UpstreamsList from '../../../upstreams/upstreamslist.jsx';
import tooltips from '../../../../tooltips/index.jsx';
import utils from '../../../../utils.js';
import styles from '../../../table/style.css';

describe('<StreamUpstream />', () => {
	const props = {
		name: 'test',
		upstream: {
			peers: []
		}
	};

	it('extends UpstreamsList', () => {
		expect(StreamUpstream.prototype instanceof UpstreamsList).toBe(true);
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(
			<StreamUpstream
				{...props}
			/>
		);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).toBe('sorting-stream-upstreams-test');

		wrapper.unmount();
	});

	it('get FILTERING_SETTINGS_KEY', () => {
		const wrapper = shallow(
			<StreamUpstream
				{...props}
			/>
		);

		expect(wrapper.instance().FILTERING_SETTINGS_KEY).toBe('filtering-stream-upstreams-test');

		wrapper.unmount();
	});

	it('renderPeers()', () => {
		const peers = [{
			id: 1,
			state: 'up',
			backup: false,
			server: 'test_server_1',
			downtime: 1000,
			weight: 1,
			requests: 20,
			server_conn_s: 100000,
			active: 10000,
			max_conns: Infinity,
			server_sent_s: 40,
			server_rcvd_s: 39,
			sent: 400,
			received: 399,
			fails: 1,
			unavail: 2
		}, {
			id: 2,
			state: 'up',
			backup: true,
			server: 'test_server_2',
			max_conns: '123/s'
		}, {
			id: 3,
			state: 'up'
		}];
		const wrapper = shallow(
			<StreamUpstream
				name="test"
				upstream={{
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
			({ id }) => <td id={`getCheckbox_result_${id}`} />
		);
		jest.spyOn(utils, 'formatUptime').mockClear().mockImplementation(() => 'time_formatted');
		jest.spyOn(utils, 'formatReadableBytes').mockClear().mockImplementation(() => 'readable_bytes_formatted');
		jest.spyOn(utils, 'formatMs').mockClear().mockImplementation(() => 'ms_formatted');
		jest.spyOn(instance, 'editSelectedUpstream').mockClear().mockImplementation(() => 'edit_selected_upstream_result');

		let table = shallow(
			instance.renderPeers([])
		);

		// table html tag
		expect(table.type()).toBe('table');
		// table className
		expect(table.prop('className')).toBe(`${styles.table} ${styles.wide}`);

		const tableSortControl = table.find('TableSortControl');

		// TableSortControl secondSortLabel
		expect(tableSortControl.prop('secondSortLabel')).toBe('Отсортировать по статусу — сначала недоступные');
		// TableSortControl order
		expect(tableSortControl.prop('order')).toBe(wrapper.state('sortOrder'));
		// TableSortControl onChange
		expect(tableSortControl.prop('onChange').name).toBe('bound changeSorting');
		// this.getSelectAllCheckbox result pasted
		expect(table.find('#getSelectAllCheckbox_result')).toHaveLength(1);
		// this.getSelectAllCheckbox called once
		expect(instance.getSelectAllCheckbox).toHaveBeenCalledTimes(1);
		// this.getSelectAllCheckbox call arg
		expect(instance.getSelectAllCheckbox.mock.calls[0][0]).toEqual([]);

		const headRow = table.childAt(0).childAt(0);

		// head row 1, child 3 colspan
		expect(headRow.childAt(2).prop('colSpan')).toBe('3');
		// head row 1, child 4 colspan
		expect(headRow.childAt(3).prop('colSpan')).toBe('4');
		// head row 1, child 5 colspan
		expect(headRow.childAt(4).prop('colSpan')).toBe('4');
		// head row 1, child 6 colspan
		expect(headRow.childAt(5).prop('colSpan')).toBe('2');
		// head row 2, children length
		expect(table.childAt(0).childAt(1).children()).toHaveLength(13);

		// TODO: Add tests for SSL stat cells

		const headTooltips = table.find(`thead .${styles.hinted}`);

		// thead tooltips length
		expect(headTooltips).toHaveLength(2);
		// thead tooltip 1 props
		expect(headTooltips.at(0).prop('prop_from_useTooltip')).toBe(true);
		// thead tooltip 2 props
		expect(headTooltips.at(1).prop('prop_from_useTooltip')).toBe(true);
		// useTooltip called twice
		expect(tooltips.useTooltip).toHaveBeenCalledTimes(2);
		// useTooltip, call 1, arg 1
		expect(tooltips.useTooltip.mock.calls[0][0]).toBe('Общий простой');
		// useTooltip, call 1, arg 2
		expect(tooltips.useTooltip.mock.calls[0][1]).toBe('hint');
		// useTooltip, call 2, arg 1
		expect(tooltips.useTooltip.mock.calls[1][0]).toBe('Вес');
		// useTooltip, call 2, arg 2
		expect(tooltips.useTooltip.mock.calls[1][1]).toBe('hint');

		let tbody = table.find('tbody');

		// [no peers] tbody children
		expect(tbody.children()).toHaveLength(1);
		// [no peers] tbody child
		expect(tbody.childAt(0).prop('id')).toBe('renderEmptyList_result');
		// this.renderEmptyList called once
		expect(instance.renderEmptyList).toHaveBeenCalledTimes(1);
		// this.getCheckbox not called
		expect(instance.getCheckbox).not.toHaveBeenCalled();

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
		// [peer 1] connections className
		expect(tbody.childAt(0).childAt(5).childAt(0).prop('className')).toBe(styles.hinted);
		// [peer 1] connections, useTooltip applied
		expect(tbody.childAt(0).childAt(5).childAt(0).prop('prop_from_useTooltip')).toBe(true);
		// [peer 1] connections text
		expect(tbody.childAt(0).childAt(5).childAt(0).text()).toBe('20');
		// [peer 1] server_conn_s
		expect(tbody.childAt(0).childAt(6).text()).toBe('100000');
		// [peer 1] active
		expect(tbody.childAt(0).childAt(7).text()).toBe('10000');
		// [peer 1] max_conns className
		expect(tbody.childAt(0).childAt(8).prop('className')).toBe(styles.bdr);
		// [peer 1] max_conns
		expect(tbody.childAt(0).childAt(8).text()).toBe('∞');
		// [peer 1] server_sent_s className
		expect(tbody.childAt(0).childAt(9).prop('className')).toBe(styles.px60);
		// [peer 1] server_sent_s
		expect(tbody.childAt(0).childAt(9).text()).toBe('readable_bytes_formatted');
		// [peer 1] server_rcvd_s className
		expect(tbody.childAt(0).childAt(10).prop('className')).toBe(styles.px60);
		// [peer 1] server_rcvd_s
		expect(tbody.childAt(0).childAt(10).text()).toBe('readable_bytes_formatted');
		// [peer 1] sent
		expect(tbody.childAt(0).childAt(11).text()).toBe('readable_bytes_formatted');
		// [peer 1] received className
		expect(tbody.childAt(0).childAt(12).prop('className')).toBe(styles.bdr);
		// [peer 1] received
		expect(tbody.childAt(0).childAt(12).text()).toBe('readable_bytes_formatted');
		// [peer 1] fails
		expect(tbody.childAt(0).childAt(13).text()).toBe('1');
		// [peer 1] unavail
		expect(tbody.childAt(0).childAt(14).text()).toBe('2');

		// [peer 2] address-container text
		expect(tbody.childAt(1).childAt(2).childAt(0).text()).toBe('b test_server_2');
		// [peer 2] max_conns
		expect(tbody.childAt(1).childAt(8).text()).toBe('123/s');

		expect(tooltips.useTooltip).toHaveBeenCalledTimes(8);
		// useTooltip, call 3, arg 1
		expect(tooltips.useTooltip.mock.calls[2][0].type.name).toBe('PeerTooltip');
		// useTooltip, call 3, arg 1, attr peer
		expect(tooltips.useTooltip.mock.calls[2][0].props.peer).toEqual(peers[0]);
		// useTooltip, call 4, arg 1
		expect(tooltips.useTooltip.mock.calls[3][0].type.name).toBe('ConnectionsTooltip');
		// useTooltip, call 4, arg 1, attr peer
		expect(tooltips.useTooltip.mock.calls[3][0].props.peer).toEqual(peers[0]);
		// useTooltip, call 4, arg 2
		expect(tooltips.useTooltip.mock.calls[3][1]).toBe('hint');
		// useTooltip, call 5, arg 1
		expect(tooltips.useTooltip.mock.calls[4][0].type.name).toBe('PeerTooltip');
		// useTooltip, call 5, arg 1, attr peer
		expect(tooltips.useTooltip.mock.calls[4][0].props.peer).toEqual(peers[1]);
		// useTooltip, call 6, arg 1
		expect(tooltips.useTooltip.mock.calls[5][0].type.name).toBe('ConnectionsTooltip');
		// useTooltip, call 6, arg 1, attr peer
		expect(tooltips.useTooltip.mock.calls[5][0].props.peer).toEqual(peers[1]);
		// useTooltip, call 6, arg 2
		expect(tooltips.useTooltip.mock.calls[5][1]).toBe('hint');
		// useTooltip, call 7, arg 1
		expect(tooltips.useTooltip.mock.calls[6][0].type.name).toBe('PeerTooltip');
		// useTooltip, call 7, arg 1, attr peer
		expect(tooltips.useTooltip.mock.calls[6][0].props.peer).toEqual(peers[2]);
		// useTooltip, call 8, arg 1
		expect(tooltips.useTooltip.mock.calls[7][0].type.name).toBe('ConnectionsTooltip');
		// useTooltip, call 8, arg 1, attr peer
		expect(tooltips.useTooltip.mock.calls[7][0].props.peer).toEqual(peers[2]);
		// useTooltip, call 8, arg 2
		expect(tooltips.useTooltip.mock.calls[7][1]).toBe('hint');

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
		expect(table.find(`.${styles['edit-peer']}`)).toHaveLength(0);

		wrapper.setState({ editMode: true });
		table = shallow(
			instance.renderPeers(peers)
		);

		const editPeer = table.find(`.${styles['edit-peer']}`);

		// [editMode = true] edit-peer
		expect(editPeer).toHaveLength(3);
		expect(editPeer.at(0).prop('onClick')).toBeInstanceOf(Function);

		let clickOnEditPeerResult = editPeer.at(0).prop('onClick')();

		// [peer 1] edit-peer onClick result
		expect(clickOnEditPeerResult).toBe('edit_selected_upstream_result');
		// this.editSelectedUpstream called once
		expect(instance.editSelectedUpstream).toHaveBeenCalledTimes(1);
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

		instance.getSelectAllCheckbox.mockRestore();
		tooltips.useTooltip.mockRestore();
		instance.renderEmptyList.mockRestore();
		instance.getCheckbox.mockRestore();
		utils.formatUptime.mockRestore();
		utils.formatReadableBytes.mockRestore();
		utils.formatMs.mockRestore();
		instance.editSelectedUpstream.mockRestore();
		wrapper.unmount();
	});
});
