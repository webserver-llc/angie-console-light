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
import { withNamespaces } from 'react-i18next';

import {
	SortableTable,
	TableSortControl,
	tableUtils,
	styles,
} from '#/components/table';
import HumanReadableBytes from '#/components/human-readable-bytes/human-readable-bytes.jsx';

class StreamZones extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'streamZonesSortOrder';
	}

	render() {
		const { t, data } = this.props;
		let component = null;

		if (data) {
			const zones = Array.from(data);

			if (this.state.sortOrder === 'desc') {
				zones.sort(([nameA], [nameB]) =>
					nameA < nameB ? -1 : 1
				);
			}

			component = (
				<div>
					<h1>{t('Server Zones')}</h1>

					<table className={`${styles.table} ${styles.wide}`}>
						<thead>
							<tr>
								<TableSortControl
									firstSortLabel={t('Sort by zone - asc')}
									secondSortLabel={t('Sort by conf order')}
									order={this.state.sortOrder}
									onChange={this.changeSorting}
								/>
								<th>{t('Zone')}</th>
								<th colSpan="3">{t('Requests')}</th>
								<th colSpan="6">{t('Responses')}</th>
								<th colSpan="4">{t('Traffic')}</th>
								<th colSpan="4">SSL</th>
							</tr>
							<tr className={`${styles['right-align']} ${styles['sub-header']}`}>
								<th className={styles.bdr} />
								<th>{t('Current')}</th>
								<th>{t('Total')}</th>
								<th className={styles.bdr}>{t('Req/s')}</th>
								<th>1xx</th>
								<th>2xx</th>
								<th>3xx</th>
								<th>4xx</th>
								<th>5xx</th>
								<th className={styles.bdr}>{t('Total')}</th>
								<th>
									{t('Sent/s')}
									<div className="" />
								</th>
								<th>{t('Rcvd/s')}</th>
								<th>{t('Sent')}</th>
								<th className={styles.bdr}>{t('Rcvd')}</th>
								<th>{t('Handshaked')}</th>
								<th style="max-width: 115px;white-space: initial;">
									{t('Reuses')}
								</th>
								<th style="max-width: 115px;white-space: initial;">
									{t('Timedout')}
								</th>
								<th style="max-width: 115px;white-space: initial;">
									{t('Failed')}
								</th>
							</tr>
						</thead>
						<tbody className={styles['right-align']}>
							{
								zones.map(([name, zone]) => {
									let status = styles.ok;

									if (zone.warning) {
										status = styles.warning;
									} else if (zone['5xxChanged']) {
										status = styles.alert;
									}

									const {
										responses: { codes },
										ssl,
									} = zone;

									return (
										<tr>
											<td className={status} />
											<td className={`${styles['left-align']} ${styles.bold} ${styles.bdr}`}>{name}</td>
											<td>{zone.processing}</td>
											<td>{zone.requests}</td>
											<td className={styles.bdr}>{zone.zone_req_s}</td>
											<td>{tableUtils.responsesTextWithTooltip(zone.responses['1xx'], codes, '1')}</td>
											<td>{tableUtils.responsesTextWithTooltip(zone.responses['2xx'], codes, '2')}</td>
											<td>{tableUtils.responsesTextWithTooltip(zone.responses['3xx'], codes, '3')}</td>
											<td className={`${styles.flash}${zone['4xxChanged'] ? (` ${styles['red-flash']}`) : ''}`}>
												{
													tableUtils.responsesTextWithTooltip(
														zone.responses['4xx'] + zone.discarded,
														{
															...(codes || {
																'4xx': zone.responses['4xx']
															}),
															'499/444/408': zone.discarded,
														},
														'4'
													)
												}
											</td>
											<td className={`${styles.flash}${zone['5xxChanged'] ? (` ${styles['red-flash']}`) : ''}`}>
												{tableUtils.responsesTextWithTooltip(zone.responses['5xx'], codes, '5')}
											</td>
											<td className={styles.bdr}>{zone.responses.total}</td>
											<td className={styles.px60}>
												<HumanReadableBytes value={zone.sent_s} />
											</td>
											<td className={styles.px60}>
												<HumanReadableBytes value={zone.rcvd_s} />
											</td>
											<td className={styles.px60}>
												<HumanReadableBytes value={zone.data.sent} />
											</td>
											<td className={`${styles.px60} ${styles.bdr}`}>
												<HumanReadableBytes value={zone.data.received} />
											</td>
											<td>{ssl ? ssl.handshaked : '–'}</td>
											<td>{ssl ? ssl.reuses : '–'}</td>
											<td>{ssl ? ssl.timedout : '–'}</td>
											<td>{ssl ? ssl.failed : '–'}</td>
										</tr>
									);
								})
							}
						</tbody>
					</table>
				</div>
			);
		}

		return component;
	}
}

export default withNamespaces('pages.serverzones.serverzones')(StreamZones);
