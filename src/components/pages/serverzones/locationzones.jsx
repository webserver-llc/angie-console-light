/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import utils from '../../../utils';
import SortableTable from '../../table/sortabletable.jsx';
import TableSortControl from '../../table/tablesortcontrol.jsx';
import tooltips from '../../../tooltips/index.jsx';
import styles from '../../table/style.css';

export default class Locations extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'locationsSortOrder';
	}

	render(){
		const { data } = this.props;
		let component = null;

		if (data) {
			const locations = Array.from(data);

			if (this.state.sortOrder === 'desc') {
				locations.sort( ([nameA, a], [nameB, b]) =>
					a.alert || a.warning ? - 1 : 1
				);
			}

			component = (<div>
				<h1>Location Zones</h1>

				<table className={ `${ styles.table } ${ styles.wide }` }>
					<thead>
						<tr>
							<TableSortControl order={this.state.sortOrder} onChange={this.changeSorting} />
							<th>Zone</th>
							<th colSpan="2">Requests</th>
							<th colSpan="6">Responses</th>
							<th colSpan="4">Traffic</th>
						</tr>
						<tr className={ `${ styles['right-align'] } ${ styles['sub-header'] }` }>
							<th className={ styles.bdr } />
							<th>Total</th>
							<th className={ styles.bdr }>Req/s</th>
							<th>1xx</th>
							<th>2xx</th>
							<th>3xx</th>
							<th>4xx</th>
							<th>5xx</th>
							<th className={ styles.bdr }>Total</th>
							<th>Sent/s</th>
							<th>Rcvd/s</th>
							<th>Sent</th>
							<th>Rcvd</th>
						</tr>
					</thead>
					<tbody className={ styles['right-align'] }>
						{
							locations.map(([name, location]) => {
								let status = styles.ok;

								if (location.warning) {
									status = styles.warning;
								} else if (location['5xxChanged']) {
									status = styles.alert;
								}

								return (<tr>
									<td className={ status } />
									<td className={ `${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }` }>{ name }</td>
									<td>{ location.requests }</td>
									<td className={ styles.bdr }>{ location.zone_req_s }</td>
									<td>{ location.responses['1xx'] }</td>
									<td>{ location.responses['2xx'] }</td>
									<td>{ location.responses['3xx'] }</td>
									<td className={ `${ styles.flash }${ location['4xxChanged'] ? (' ' + styles['red-flash']) : '' }` }>
										<span
											className={ styles.hinted }
											{ ...tooltips.useTooltip(
												<div>4xx: { location.responses['4xx'] } <br /> 499/444/408: { location.discarded }</div>,
												'hint'
											) }
										>
											{ location.responses['4xx'] + location.discarded }
										</span>
									</td>
									<td className={ `${ styles.flash }${ location['5xxChanged'] ? (' ' + styles['red-flash']) : '' }` }>
										{ location.responses['5xx'] }
									</td>
									<td className={ styles.bdr }>{ location.responses.total }</td>
									<td className={ styles.px60 }>{ utils.formatReadableBytes(location.sent_s) }</td>
									<td className={ styles.px60 }>{ utils.formatReadableBytes(location.rcvd_s) }</td>
									<td className={ styles.px60 }>{ utils.formatReadableBytes(location.sent) }</td>
									<td className={ styles.px60 }>{ utils.formatReadableBytes(location.received) }</td>
								</tr>);
							})
						}
					</tbody>
				</table>
			</div>);
		}

		return component;
	}
}
