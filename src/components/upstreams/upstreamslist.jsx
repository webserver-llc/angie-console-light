/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import SortableTable from '../table/sortabletable.jsx';
import ProgressBar from '../progressbar/progressbar.jsx';
import { getSetting, setSetting } from '../../appsettings';
import UpstreamsEditor from './editor/upstreamseditor.jsx';

import styles from './style.css';
import tableStyles from '../table/style.css';

const FILTER_OPTIONS = {
	all: 'Show all',
	up: 'Up',
	failed: 'Failed',
	drain: 'Drain',
	down: 'Down'
};

export default class UpstreamsList extends SortableTable {
	constructor(props) {
		super(props);

		Object.assign(this.state, {
			editMode: false,
			editor: false,
			selectedPeers: new Map(),
			filtering: getSetting(this.FILTERING_SETTINGS_KEY, 'all')
		});

		this.toggleEditMode = this.toggleEditMode.bind(this);
		this.changeFilterRule = this.changeFilterRule.bind(this);

		this.addUpstream = this.addUpstream.bind(this);
		this.editSelectedUpstream = this.editSelectedUpstream.bind(this);
		this.showEditor = this.showEditor.bind(this);
		this.closeEditor = this.closeEditor.bind(this);
		this.selectAllPeers = this.selectAllPeers.bind(this);
		this.selectPeer = this.selectPeer.bind(this);
	}

	toggleEditMode() {
		if (/[^\x20-\x7F]/.test(this.props.upstream.name)) {
			alert('Sorry, upstream configuration is not available for the upstreams with non-ascii characters in their names');
			return;
		}

		const editMode = !this.state.editMode;

		const state = {
			editMode
		};

		if (!editMode) {
			state.selectedPeers = new Map();
		}

		this.setState(state);
	}

	editSelectedUpstream(peer) {
		if (peer) {
			this.setState({
				selectedPeers: new Map([[peer.id, peer]])
			});

			this.showEditor('edit');
			return;
		}

		if (this.state.selectedPeers.size > 0) {
			this.showEditor('edit');
		}
	}

	addUpstream() {
		this.showEditor('add');
	}

	closeEditor() {
		this.setState({
			editor: null
		});
	}

	showEditor(mode) {
		this.setState({
			editor: mode
		});
	}

	changeFilterRule(evt) {
		setSetting(this.FILTERING_SETTINGS_KEY, evt.target.value);

		this.setState({
			filtering: evt.target.value
		});
	}

	renderEmptyList() {
		return (<tr>
			<td styleName="tableStyles.left-align" colSpan={30}>
				No servers with '{this.state.filtering}' state found in this upstream group.
			</td>
		</tr>);
	}

	renderPeers() {
		throw new Error('need to declare renderPeers()');
	}

	filterPeers(data, filtering = this.state.filtering) {
		return data.filter((item) => {
			let needOrder = 'all';

			if (filtering === 'all') {
				return true;
			}

			switch (item.state) {
				case 'up':
					needOrder = 'up';
					break;
				case 'unavail':
				case 'unhealthy':
					needOrder = 'failed';
					break;
				case 'draining':
					needOrder = 'drain';
					break;
				case 'down':
					needOrder = 'down';
					break;
			}

			return needOrder === filtering;
		});
	}

	selectAllPeers(allPeers, state) {
		this.setState({
			selectedPeers: new Map(state ? allPeers.map(peer => [peer.id, peer]) : [])
		});
	}

	selectPeer(peer, state) {
		const { selectedPeers } = this.state;

		if (state) {
			selectedPeers.set(peer.id, peer);
		} else {
			selectedPeers.delete(peer.id);
		}

		this.setState({
			selectedPeers
		});
	}

	getSelectAllCheckbox(peers) {
		return this.state.editMode ?
			<th rowSpan="2" styleName="tableStyles.checkbox">
				<input
					type="checkbox"
					onChange={(evt) => this.selectAllPeers(peers, evt.target.checked)}
					checked={this.state.selectedPeers.size === peers.length}
				/>
			</th>
		: null;
	}

	getCheckbox(peer) {
		return this.state.editMode ?
			<td styleName="tableStyles.checkbox">
				<input
					type="checkbox"
					onChange={(evt) => this.selectPeer(peer, evt.target.checked)}
					checked={this.state.selectedPeers.has(peer.id)}
				/>
			</td>
		: null;
	}

	render() {
		const { name, upstream } = this.props;

		let peers;

		if (this.props.showOnlyFailed) {
			peers = this.filterPeers(upstream.peers, 'failed');

			if (peers.length === 0) {
				return null;
			}
		} else {
			peers = this.filterPeers(upstream.peers);
		}

		if (this.state.sortOrder === 'desc') {
			peers = peers.sort((a) => {
				if (a.state === 'down' || a.state === 'unhealthy' || a.state === 'unavail') {
					return -1;
				}

				return 1;
			});
		}

		return (<div styleName="styles.upstreams-list" id={`upstream-${name}`}>

			{
				this.state.editor ?
					<UpstreamsEditor
						upstream={upstream}
						peers={this.state.editor === 'edit' ? this.state.selectedPeers : null}
						isStream={this.props.isStream}
						onClose={this.closeEditor}
						upstreamsApi={this.props.upstreamsApi}
					/>
				: null
			}

			<select name="filter" styleName="styles.filter" onChange={this.changeFilterRule}>
				{
					Object.keys(FILTER_OPTIONS).map(value => (
						<option value={value} key={value} selected={this.state.filtering === value}>
							{ FILTER_OPTIONS[value] }
						</option>
					))
				}
			</select>

			<div styleName="styles.head">
				<h2 styleName="styles.title">{ name }</h2>

				{ this.props.writePermission ?
					<span styleName={this.state.editMode ? 'styles.edit-active' : 'styles.edit'} onClick={this.toggleEditMode} /> : null
				}

				{
					this.props.writePermission && this.state.editMode ?
						[
							<span styleName="styles.btn" key="edit" onClick={() => this.editSelectedUpstream()}>Edit selected</span>,
							<span styleName="styles.btn" key="add" onClick={this.addUpstream}>Add server</span>
						]
					: null
				}

				{
					upstream.zoneSize !== null ?
						<span styleName="styles.zone-capacity">Zone: <ProgressBar percentage={upstream.zoneSize} /></span>
					: null
				}
			</div>

			{ this.renderPeers(peers) }
		</div>);
	}
}