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
import api from '../../api';
import DataBinder from '../databinder/databinder.jsx';
import SortableTable from '../table/sortabletable.jsx';
import TableSortControl from '../table/tablesortcontrol.jsx';
import calculateWorkers from '../../calculators/workers.js';
import styles from '../table/style.css';
import appsettings from '../../appsettings';
import utils from '../../utils.js';

const WorkersSortingKeys = {
	sortOrder: 'workersSortOrder_id',
	sortOrderByPid: 'workersSortOrder_pid',
	sortOrderByAccepted: 'workersSortOrder_connAccepted',
	sortOrderByAcceptedPerSec: 'workersSortOrder_acceptedPerSeq',
	sortOrderByDropped: 'workersSortOrder_connDropped',
	sortOrderByActive: 'workersSortOrder_connActive',
	sortOrderByIdle: 'workersSortOrder_connIdle',
	sortOrderByTotal: 'workersSortOrder_reqTotal',
	sortOrderByCurrent: 'workersSortOrder_reqCurrent',
	sortOrderByReqPerSec: 'workersSortOrder_reqPerSec',
};

export class Workers extends SortableTable {
	constructor(props) {
		super(props);

		this.state = {
			...this.state,
			sortOrderByPid: appsettings.getSetting(WorkersSortingKeys.sortOrderByPid, 'asc'),
			sortOrderByAccepted: appsettings.getSetting(WorkersSortingKeys.sortOrderByAccepted, 'asc'),
			sortOrderByAcceptedPerSec: appsettings.getSetting(WorkersSortingKeys.sortOrderByAcceptedPerSec, 'asc'),
			sortOrderByDropped: appsettings.getSetting(WorkersSortingKeys.sortOrderByDropped, 'asc'),
			sortOrderByActive: appsettings.getSetting(WorkersSortingKeys.sortOrderByActive, 'asc'),
			sortOrderByIdle: appsettings.getSetting(WorkersSortingKeys.sortOrderByIdle, 'asc'),
			sortOrderByTotal: appsettings.getSetting(WorkersSortingKeys.sortOrderByTotal, 'asc'),
			sortOrderByCurrent: appsettings.getSetting(WorkersSortingKeys.sortOrderByCurrent, 'asc'),
			sortOrderByReqPerSec: appsettings.getSetting(WorkersSortingKeys.sortOrderByReqPerSec, 'asc'),
			activeSort: appsettings.getSetting('workersActiveSort', 'sortOrder'),
		};

		if (!(this.state.activeSort in this.state)) {
			this.state.activeSort = 'sortOrder';
		}
	}

	changeSorting(sortOrder) {
		if (this.state.activeSort !== 'sortOrder') {
			this.setState({
				activeSort: 'sortOrder',
			});

			appsettings.setSetting('workersActiveSort', 'sortOrder');
		} else {
			super.changeSorting(sortOrder);
		}
	}

	get SORTING_SETTINGS_KEY() {
		return WorkersSortingKeys.sortOrder;
	}

	changeSortingBy(stateKey, sortOrder) {
		if (this.state.activeSort !== stateKey) {
			this.setState({
				activeSort: stateKey,
			});

			appsettings.setSetting('workersActiveSort', stateKey);
		} else {
			this.setState({
				[stateKey]: sortOrder,
			});

			appsettings.setSetting(WorkersSortingKeys[stateKey], sortOrder);
		}
	}

	render() {
		const { workers } = this.props.data;
		const { activeSort } = this.state;

		if (activeSort === 'sortOrderByPid') {
			sortByPid(this.state, workers);
		} else if (activeSort === 'sortOrderByAccepted') {
			sortByAccepted(this.state, workers);
		} else if (activeSort === 'sortOrderByAcceptedPerSec') {
			sortByConnsPerSeq(this.state, workers);
		} else if (activeSort === 'sortOrderByDropped') {
			sortByDropped(this.state, workers);
		} else if (activeSort === 'sortOrderByActive') {
			sortByActive(this.state, workers);
		} else if (activeSort === 'sortOrderByIdle') {
			sortByIdle(this.state, workers);
		} else if (activeSort === 'sortOrderByTotal') {
			sortByTotal(this.state, workers);
		} else if (activeSort === 'sortOrderByCurrent') {
			sortByCurrent(this.state, workers);
		} else if (activeSort === 'sortOrderByReqPerSec') {
			sortByReqPerSec(this.state, workers);
		} else {
			if (this.state.sortOrder === 'desc') {
				workers.sort((a, b) => a.id > b.id ? -1 : 1);
			} else {
				workers.sort((a, b) => a.id < b.id ? -1 : 1);
			}
		}

		return (<div>
			<h1>Workers</h1>

			<table className={ `${ styles.table } ${ styles.thin }` }>
				<thead>
					<tr>
						<th className={ styles['no-bdr'] }>ID</th>
						<TableSortControl
							firstSortLabel='Sort by ID - desc'
							secondSortLabel='Sort by ID - asc'
							order={this.state.sortOrder}
							onChange={this.changeSorting}
							isActive={this.state.activeSort === 'sortOrder'}
							isInline
						/>
						<th className={ styles['no-bdr'] }>PID</th>
						<TableSortControl
							firstSortLabel='Sort by PID - desc'
							secondSortLabel='Sort by PID - asc'
							order={this.state.sortOrderByPid}
							onChange={this.changeSortingBy.bind(this, 'sortOrderByPid')}
							isActive={this.state.activeSort === 'sortOrderByPid'}
							isInline
						/>
						<th colSpan={10}>Connections</th>
						<th colSpan={6}>Requests</th>
					</tr>
					<tr className={ `${ styles['right-align'] } ${ styles['sub-header'] }` }>
						<th />
						<th />

						<th>Accepted</th>
						<TableSortControl
							firstSortLabel='Sort by Accepted - desc'
							secondSortLabel='Sort by Accepted - asc'
							order={this.state.sortOrderByAccepted}
							onChange={this.changeSortingBy.bind(this, 'sortOrderByAccepted')}
							isActive={this.state.activeSort === 'sortOrderByAccepted'}
							singleRow
							isInline
						/>

						<th>Accepted/s</th>
						<TableSortControl
							firstSortLabel='Sort by Accepted/s - desc'
							secondSortLabel='Sort by Accepted/s - asc'
							order={this.state.sortOrderByAcceptedPerSec}
							onChange={this.changeSortingBy.bind(this, 'sortOrderByAcceptedPerSec')}
							isActive={this.state.activeSort === 'sortOrderByAcceptedPerSec'}
							singleRow
							isInline
						/>

						<th>Active</th>
						<TableSortControl
							firstSortLabel='Sort by Active - desc'
							secondSortLabel='Sort by Active - asc'
							order={this.state.sortOrderByActive}
							onChange={this.changeSortingBy.bind(this, 'sortOrderByActive')}
							isActive={this.state.activeSort === 'sortOrderByActive'}
							singleRow
							isInline
						/>

						<th>Idle</th>
						<TableSortControl
							firstSortLabel='Sort by Idle - desc'
							secondSortLabel='Sort by Idle - asc'
							order={this.state.sortOrderByIdle}
							onChange={this.changeSortingBy.bind(this, 'sortOrderByIdle')}
							isActive={this.state.activeSort === 'sortOrderByIdle'}
							singleRow
							isInline
						/>

						<th>Dropped</th>
						<TableSortControl
							firstSortLabel='Sort by Dropped - desc'
							secondSortLabel='Sort by Dropped - asc'
							order={this.state.sortOrderByDropped}
							onChange={this.changeSortingBy.bind(this, 'sortOrderByDropped')}
							isActive={this.state.activeSort === 'sortOrderByDropped'}
							singleRow
							isInline
						/>

						<th>Current</th>
						<TableSortControl
							firstSortLabel='Sort by Current - desc'
							secondSortLabel='Sort by Current - asc'
							order={this.state.sortOrderByCurrent}
							onChange={this.changeSortingBy.bind(this, 'sortOrderByCurrent')}
							isActive={this.state.activeSort === 'sortOrderByCurrent'}
							singleRow
							isInline
						/>

						<th>Total</th>
						<TableSortControl
							firstSortLabel='Sort by Total - desc'
							secondSortLabel='Sort by Total - asc'
							order={this.state.sortOrderByTotal}
							onChange={this.changeSortingBy.bind(this, 'sortOrderByTotal')}
							isActive={this.state.activeSort === 'sortOrderByTotal'}
							singleRow
							isInline
						/>

						<th>Запр./сек.</th>
						<TableSortControl
							firstSortLabel='Отсортировать по убыванию запр./сек.'
							secondSortLabel='Отсортировать по возрастанию запр./сек.'
							order={this.state.sortOrderByReqPerSec}
							onChange={this.changeSortingBy.bind(this, 'sortOrderByReqPerSec')}
							isActive={this.state.activeSort === 'sortOrderByReqPerSec'}
							singleRow
							isInline
						/>
					</tr>
				</thead>
				<tbody className={ styles['right-align'] }>
					{
						workers.map(({
							id,
							pid,
							connections = {},
							http: {
								requests = {},
							} = {
								requests: {},
							}
						}) =>
							<tr>
								<td colSpan={2}>{ utils.formatNumber(id) }</td>
								<td colSpan={2}>{ utils.formatNumber(pid) }</td>
								<td colSpan={2}>{ utils.formatNumber(connections.accepted) }</td>
								<td colSpan={2}>{ utils.formatNumber(connections.acceptedPerSec) }</td>
								<td colSpan={2}>{ utils.formatNumber(connections.active) }</td>
								<td colSpan={2}>{ utils.formatNumber(connections.idle) }</td>
								<td colSpan={2}>{ utils.formatNumber(connections.dropped) }</td>
								<td colSpan={2}>{ utils.formatNumber(requests.current) }</td>
								<td colSpan={2}>{ utils.formatNumber(requests.total) }</td>
								<td colSpan={2}>{ utils.formatNumber(requests.reqsPerSec) }</td>
							</tr>
						)
					}
				</tbody>
			</table>
		</div>);
	}
}

export default DataBinder(Workers, [
	api.workers.process(calculateWorkers),
]);

export function sortByPid(state, workers) {
	let moreOrEqual = 1;
	let less = -1;

	if (state.sortOrderByPid === 'desc') {
		moreOrEqual = -1;
		less = 1;
	}

	workers.sort((a, b) => a.pid >= b.pid ? moreOrEqual : less);
}

export function sortByAccepted(state, workers) {
	let moreOrEqual = 1;
	let less = -1;

	if (state.sortOrderByAccepted === 'desc') {
		moreOrEqual = -1;
		less = 1;
	}

	workers.sort((a, b) => {
		if (
			'connections' in a &&
			'accepted' in a.connections
		) {
			if (
				'connections' in b &&
				'accepted' in b.connections
			) {
				return a.connections.accepted >= b.connections.accepted ? moreOrEqual : less;
			} else return -1;
		} else return 1;
	});
}

export function sortByConnsPerSeq(state, workers) {
	let moreOrEqual = 1;
	let less = -1;

	if (state.sortOrderByAcceptedPerSec === 'desc') {
		moreOrEqual = -1;
		less = 1;
	}

	workers.sort((a, b) => {
		if (
			'connections' in a &&
			'acceptedPerSec' in a.connections
		) {
			if (
				'connections' in b &&
				'acceptedPerSec' in b.connections
			) {
				return a.connections.acceptedPerSec >= b.connections.acceptedPerSec ? moreOrEqual : less;
			} else return -1;
		} else return 1;
	});
}

export function sortByDropped(state, workers) {
	let moreOrEqual = 1;
	let less = -1;

	if (state.sortOrderByDropped === 'desc') {
		moreOrEqual = -1;
		less = 1;
	}

	workers.sort((a, b) => {
		if (
			'connections' in a &&
			'dropped' in a.connections
		) {
			if (
				'connections' in b &&
				'dropped' in b.connections
			) {
				return a.connections.dropped >= b.connections.dropped ? moreOrEqual : less;
			} else return -1;
		} else return 1;
	});
}

export function sortByActive(state, workers) {
	let moreOrEqual = 1;
	let less = -1;

	if (state.sortOrderByActive === 'desc') {
		moreOrEqual = -1;
		less = 1;
	}

	workers.sort((a, b) => {
		if (
			'connections' in a &&
			'active' in a.connections
		) {
			if (
				'connections' in b &&
				'active' in b.connections
			) {
				return a.connections.active >= b.connections.active ? moreOrEqual : less;
			} else return -1;
		} else return 1;
	});
}

export function sortByIdle(state, workers) {
	let moreOrEqual = 1;
	let less = -1;

	if (state.sortOrderByIdle === 'desc') {
		moreOrEqual = -1;
		less = 1;
	}

	workers.sort((a, b) => {
		if (
			'connections' in a &&
			'idle' in a.connections
		) {
			if (
				'connections' in b &&
				'idle' in b.connections
			) {
				return a.connections.idle >= b.connections.idle ? moreOrEqual : less;
			} else return -1;
		} else return 1;
	});
}

export function sortByTotal(state, workers) {
	let moreOrEqual = 1;
	let less = -1;

	if (state.sortOrderByTotal === 'desc') {
		moreOrEqual = -1;
		less = 1;
	}

	workers.sort((a, b) => {
		if (
			'http' in a &&
			'requests' in a.http &&
			'total' in a.http.requests
		) {
			if (
				'http' in b &&
				'requests' in b.http &&
				'total' in b.http.requests
			) {
				return a.http.requests.total >= b.http.requests.total ? moreOrEqual : less;
			} else return -1;
		} else return 1;
	});
}

export function sortByCurrent(state, workers) {
	let moreOrEqual = 1;
	let less = -1;

	if (state.sortOrderByCurrent === 'desc') {
		moreOrEqual = -1;
		less = 1;
	}

	workers.sort((a, b) => {
		if (
			'http' in a &&
			'requests' in a.http &&
			'current' in a.http.requests
		) {
			if (
				'http' in b &&
				'requests' in b.http &&
				'current' in b.http.requests
			) {
				return a.http.requests.current >= b.http.requests.current ? moreOrEqual : less;
			} else return -1;
		} else return 1;
	});
}

export function sortByReqPerSec(state, workers) {
	let moreOrEqual = 1;
	let less = -1;

	if (state.sortOrderByReqPerSec === 'desc') {
		moreOrEqual = -1;
		less = 1;
	}

	workers.sort((a, b) => {
		if (
			'http' in a &&
			'requests' in a.http &&
			'reqsPerSec' in a.http.requests
		) {
			if (
				'http' in b &&
				'requests' in b.http &&
				'reqsPerSec' in b.http.requests
			) {
				return a.http.requests.reqsPerSec >= b.http.requests.reqsPerSec ? moreOrEqual : less;
			} else return -1;
		} else return 1;
	});
}
