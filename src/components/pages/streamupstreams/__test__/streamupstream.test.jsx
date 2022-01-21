/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
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
		expect(StreamUpstream.prototype instanceof UpstreamsList).to.be.true;
	});

	it('get SORTING_SETTINGS_KEY', () => {
		const wrapper = shallow(
			<StreamUpstream
				{ ...props }
			/>
		);

		expect(wrapper.instance().SORTING_SETTINGS_KEY).to.be.equal('sorting-stream-upstreams-test');

		wrapper.unmount();
	});

	it('get FILTERING_SETTINGS_KEY', () => {
		const wrapper = shallow(
			<StreamUpstream
				{ ...props }
			/>
		);

		expect(wrapper.instance().FILTERING_SETTINGS_KEY).to.be.equal('filtering-stream-upstreams-test');

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
			connections: 20,
			server_conn_s: 100000,
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
			connect_time: 999,
			first_byte_time: 9,
			response_time: 11
		}, {
			id: 2,
			state: 'up',
			backup: true,
			server: 'test_server_2',
			max_conns: '123/s',
			health_checks: {},
			health_status: false
		}, {
			id: 3,
			state: 'up',
			health_checks: {},
			health_status: true
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

		let table = shallow(
			instance.renderPeers([])
		);

		expect(table.type(), 'table html tag').to.be.equal('table');
		expect(table.prop('className'), 'table className').to.be.equal(
			`${ styles['table'] } ${ styles['wide'] }`
		);

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

		const headRow = table.childAt(0).childAt(0);

		expect(headRow.childAt(2).prop('colSpan'), 'head row 1, child 3 colspan').to.be.equal('3');
		expect(headRow.childAt(3).prop('colSpan'), 'head row 1, child 4 colspan').to.be.equal('4');
		expect(headRow.childAt(4).prop('colSpan'), 'head row 1, child 5 colspan').to.be.equal('4');
		expect(headRow.childAt(5).prop('colSpan'), 'head row 1, child 6 colspan').to.be.equal('2');
		expect(headRow.childAt(6).prop('colSpan'), 'head row 1, child 7 colspan').to.be.equal('4');
		expect(headRow.childAt(7).prop('colSpan'), 'head row 1, child 8 colspan').to.be.equal('3');
		expect(table.childAt(0).childAt(1).children(), 'head row 2, children length').to.have.lengthOf(20);

		const headTooltips = table.find(`thead .${ styles['hinted'] }`);

		expect(headTooltips, 'thead tooltips length').to.have.lengthOf(2);
		expect(headTooltips.at(0).prop('prop_from_useTooltip'), 'thead tooltip 1 props').to.be.true;
		expect(headTooltips.at(1).prop('prop_from_useTooltip'), 'thead tooltip 2 props').to.be.true;
		expect(tooltips.useTooltip.calledTwice, 'useTooltip called twice').to.be.true;
		expect(tooltips.useTooltip.args[0][0], 'useTooltip, call 1, arg 1').to.be.equal('Total downtime');
		expect(tooltips.useTooltip.args[0][1], 'useTooltip, call 1, arg 2').to.be.equal('hint');
		expect(tooltips.useTooltip.args[1][0], 'useTooltip, call 2, arg 1').to.be.equal('Weight');
		expect(tooltips.useTooltip.args[1][1], 'useTooltip, call 2, arg 2').to.be.equal('hint');

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
			'[peer 1] connections className'
		).to.be.equal(styles['hinted']);
		expect(
			tbody.childAt(0).childAt(5).childAt(0).prop('prop_from_useTooltip'),
			'[peer 1] connections, useTooltip applied'
		).to.be.true;
		expect(
			tbody.childAt(0).childAt(5).childAt(0).text(),
			'[peer 1] connections text'
		).to.be.equal('20');
		expect(tbody.childAt(0).childAt(6).text(), '[peer 1] server_conn_s').to.be.equal('100000');
		expect(tbody.childAt(0).childAt(7).text(), '[peer 1] active').to.be.equal('10000');
		expect(
			tbody.childAt(0).childAt(8).prop('className'),
			'[peer 1] max_conns className'
		).to.be.equal(styles['bdr']);
		expect(tbody.childAt(0).childAt(8).text(), '[peer 1] max_conns').to.be.equal('∞');
		expect(
			tbody.childAt(0).childAt(9).prop('className'),
			'[peer 1] server_sent_s className'
		).to.be.equal(styles['px60']);
		expect(tbody.childAt(0).childAt(9).text(), '[peer 1] server_sent_s').to.be.equal('readable_bytes_formatted');
		expect(
			tbody.childAt(0).childAt(10).prop('className'),
			'[peer 1] server_rcvd_s className'
		).to.be.equal(styles['px60']);
		expect(tbody.childAt(0).childAt(10).text(), '[peer 1] server_rcvd_s').to.be.equal('readable_bytes_formatted');
		expect(tbody.childAt(0).childAt(11).text(), '[peer 1] sent').to.be.equal('readable_bytes_formatted');
		expect(
			tbody.childAt(0).childAt(12).prop('className'),
			'[peer 1] received className'
		).to.be.equal(styles['bdr']);
		expect(tbody.childAt(0).childAt(12).text(), '[peer 1] received').to.be.equal('readable_bytes_formatted');
		expect(tbody.childAt(0).childAt(13).text(), '[peer 1] fails').to.be.equal('1');
		expect(tbody.childAt(0).childAt(14).text(), '[peer 1] unavail').to.be.equal('2');
		expect(tbody.childAt(0).childAt(15).text(), '[peer 1] health_checks.checks').to.be.equal('24');
		expect(tbody.childAt(0).childAt(16).text(), '[peer 1] health_checks.fails').to.be.equal('3');
		expect(tbody.childAt(0).childAt(17).text(), '[peer 1] health_checks.unhealthy').to.be.equal('0');
		expect(
			tbody.childAt(0).childAt(18).prop('className'),
			'[peer 1] health_status className'
		).to.be.equal(`${ styles['left-align'] } ${ styles['bdr'] } ${ styles['flash'] }`);
		expect(tbody.childAt(0).childAt(18).text(), '[peer 1] health_status').to.be.equal('–');
		expect(tbody.childAt(0).childAt(19).text(), '[peer 1] connect_time').to.be.equal('ms_formatted');
		expect(tbody.childAt(0).childAt(20).text(), '[peer 1] first_byte_time').to.be.equal('ms_formatted');
		expect(tbody.childAt(0).childAt(21).text(), '[peer 1] response_time').to.be.equal('ms_formatted');

		expect(
			tbody.childAt(1).childAt(2).childAt(0).text(),
			'[peer 2] address-container text'
		).to.be.equal('b test_server_2');
		expect(tbody.childAt(1).childAt(8).text(), '[peer 2] max_conns').to.be.equal('123/s');
		expect(
			tbody.childAt(1).childAt(18).prop('className'),
			'[peer 2] health_status className'
		).to.be.equal(`${ styles['left-align'] } ${ styles['bdr'] } ${ styles['flash'] } ${ styles['red-flash'] }`);
		expect(tbody.childAt(1).childAt(18).text(), '[peer 2] health_status').to.be.equal('failed');

		expect(
			tbody.childAt(2).childAt(18).prop('className'),
			'[peer 3] health_status className'
		).to.be.equal(`${ styles['left-align'] } ${ styles['bdr'] } ${ styles['flash'] }`);
		expect(tbody.childAt(2).childAt(18).text(), '[peer 3] health_status').to.be.equal('passed');

		expect(tooltips.useTooltip.callCount, 'useTooltip call count').to.be.equal(8);
		expect(
			tooltips.useTooltip.args[2][0].nodeName.prototype.displayName,
			'useTooltip, call 3, arg 1'
		).to.be.equal('PeerTooltip');
		expect(
			tooltips.useTooltip.args[2][0].attributes.peer,
			'useTooltip, call 3, arg 1, attr peer'
		).to.be.deep.equal(peers[0]);
		expect(
			tooltips.useTooltip.args[3][0].nodeName.prototype.displayName,
			'useTooltip, call 4, arg 1'
		).to.be.equal('ConnectionsTooltip');
		expect(
			tooltips.useTooltip.args[3][0].attributes.peer,
			'useTooltip, call 4, arg 1, attr peer'
		).to.be.deep.equal(peers[0]);
		expect(tooltips.useTooltip.args[3][1], 'useTooltip, call 4, arg 2').to.be.equal('hint');
		expect(
			tooltips.useTooltip.args[4][0].nodeName.prototype.displayName,
			'useTooltip, call 5, arg 1'
		).to.be.equal('PeerTooltip');
		expect(
			tooltips.useTooltip.args[4][0].attributes.peer,
			'useTooltip, call 5, arg 1, attr peer'
		).to.be.deep.equal(peers[1]);
		expect(
			tooltips.useTooltip.args[5][0].nodeName.prototype.displayName,
			'useTooltip, call 6, arg 1'
		).to.be.equal('ConnectionsTooltip');
		expect(
			tooltips.useTooltip.args[5][0].attributes.peer,
			'useTooltip, call 6, arg 1, attr peer'
		).to.be.deep.equal(peers[1]);
		expect(tooltips.useTooltip.args[5][1], 'useTooltip, call 6, arg 2').to.be.equal('hint');
		expect(
			tooltips.useTooltip.args[6][0].nodeName.prototype.displayName,
			'useTooltip, call 7, arg 1'
		).to.be.equal('PeerTooltip');
		expect(
			tooltips.useTooltip.args[6][0].attributes.peer,
			'useTooltip, call 7, arg 1, attr peer'
		).to.be.deep.equal(peers[2]);
		expect(
			tooltips.useTooltip.args[7][0].nodeName.prototype.displayName,
			'useTooltip, call 8, arg 1'
		).to.be.equal('ConnectionsTooltip');
		expect(
			tooltips.useTooltip.args[7][0].attributes.peer,
			'useTooltip, call 8, arg 1, attr peer'
		).to.be.deep.equal(peers[2]);
		expect(tooltips.useTooltip.args[7][1], 'useTooltip, call 8, arg 2').to.be.equal('hint');

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

		expect(utils.formatMs.callCount, 'formatMs call count').to.be.equal(9);
		expect(utils.formatMs.args[0][0], 'formatMs call 1, arg 1').to.be.equal(999);
		expect(utils.formatMs.args[1][0], 'formatMs call 2, arg 1').to.be.equal(9);
		expect(utils.formatMs.args[2][0], 'formatMs call 3, arg 1').to.be.equal(11);
		expect(utils.formatMs.args[3][0], 'formatMs call 4, arg 1').to.be.an('undefined');
		expect(utils.formatMs.args[4][0], 'formatMs call 5, arg 1').to.be.an('undefined');
		expect(utils.formatMs.args[5][0], 'formatMs call 6, arg 1').to.be.an('undefined');
		expect(utils.formatMs.args[6][0], 'formatMs call 7, arg 1').to.be.an('undefined');
		expect(utils.formatMs.args[7][0], 'formatMs call 8, arg 1').to.be.an('undefined');
		expect(utils.formatMs.args[8][0], 'formatMs call 9, arg 1').to.be.an('undefined');

		expect(table.find(`.${ styles['edit-peer'] }`), '[editMode = false] edit-peer').to.have.lengthOf(0);

		wrapper.setState({ editMode: true });
		table = shallow(
			instance.renderPeers(peers)
		);

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

		instance.getSelectAllCheckbox.restore();
		tooltips.useTooltip.restore();
		instance.renderEmptyList.restore();
		instance.getCheckbox.restore();
		utils.formatUptime.restore();
		utils.formatReadableBytes.restore();
		utils.formatMs.restore();
		instance.editSelectedUpstream.restore();
		wrapper.unmount();
	});
});
