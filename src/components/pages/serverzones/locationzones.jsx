/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';

import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import {
	SortableTable,
	TableSortControl,
	tableUtils,
	styles,
} from '#/components/table';

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

								const { codes } = location.responses;
								const codes4xx = utils.getHTTPCodesArray(codes, '4');

								return (<tr>
									<td className={ status } />
									<td className={ `${ styles['left-align'] } ${ styles.bold } ${ styles.bdr }` }>{ name }</td>
									<td>{ location.requests }</td>
									<td className={ styles.bdr }>{ location.zone_req_s }</td>
									<td>{ tableUtils.responsesTextWithTooltip(location.responses['1xx'], codes, '1') }</td>
									<td>{ tableUtils.responsesTextWithTooltip(location.responses['2xx'], codes, '2') }</td>
									<td>{ tableUtils.responsesTextWithTooltip(location.responses['3xx'], codes, '3') }</td>
									<td className={ `${ styles.flash }${ location['4xxChanged'] ? (' ' + styles['red-flash']) : '' }` }>
										<span
											className={ styles.hinted }
											{ ...tooltips.useTooltip(
												<div>
													{
														codes4xx.length > 0
															? codes4xx.map(({ code, value }) => (
																<div key={ code }>{ code }: { value }</div>
															))
															: (
																<div>4xx: { location.responses['4xx'] }</div>
															)
													}

													<div key="discarded">499/444/408: { location.discarded }</div>
												</div>,
												'hint'
											) }
										>
											{ location.responses['4xx'] + location.discarded }
										</span>
									</td>
									<td className={ `${ styles.flash }${ location['5xxChanged'] ? (' ' + styles['red-flash']) : '' }` }>
										{ tableUtils.responsesTextWithTooltip(location.responses['5xx'], codes, '5') }
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
