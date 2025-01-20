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
import api from '../../api';
import DataBinder from '../databinder/databinder.jsx';
import SortableTable from '../table/sortabletable.jsx';
import TableSortControl from '../table/tablesortcontrol.jsx';
import mapperResolvers from '../../api/mappers/resolvers.js';
import calculateResolvers from '../../calculators/resolvers.js';
import styles from '../table/style.css';

export class Resolvers extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'resolversSortOrder';
	}

	render() {
		const { t } = this.props;
		const resolvers = Array.from(this.props.data.resolvers);

		if (this.state.sortOrder === 'desc') {
			resolvers.sort(([nameA, a], [nameB, b]) => a.alert ? -1 : 1);
		}

		return (
			<div>
				<h1>{t('Resolvers')}</h1>

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
							<th colSpan={3}>{t('Requests')}</th>
							<th colSpan={8}>{t('Responses')}</th>
						</tr>
						<tr className={`${styles['right-align']} ${styles['sub-header']}`}>
							<th className={styles.bdr} />
							<th>A, AAAA</th>
							<th>SRV</th>
							<th className={styles.bdr}>PTR</th>
							<th>{t('Success')}</th>
							<th>{t('Format error')}</th>
							<th>{t('Server failure')}</th>
							<th>{t('Host not found')}</th>
							<th>{t('Unimplemented')}</th>
							<th>{t('Operation refused')}</th>
							<th>{t('Unknown')}</th>
							<th>{t('Timed out')}</th>
						</tr>
					</thead>
					<tbody className={styles['right-align']}>
						{
							resolvers.map(([resolver, { requests, responses, alert }]) => (
								<tr>
									<td className={alert ? styles.alert : styles.ok} />
									<td className={`${styles['left-align']} ${styles.bold} ${styles.bdr}`}>{resolver}</td>
									<td>{requests.name}</td>
									<td>{requests.srv}</td>
									<td className={styles.bdr}>{requests.addr}</td>
									<td>{responses.noerror}</td>
									<td>{responses.formerr}</td>
									<td>{responses.servfail}</td>
									<td>{responses.nxdomain}</td>
									<td>{responses.notimp}</td>
									<td>{responses.refused}</td>
									<td>{responses.unknown}</td>
									<td>{responses.timedout}</td>
								</tr>
							)
							)
						}
					</tbody>
				</table>
			</div>
		);
	}
}

Resolvers.defaultProps = {
	// i18n for testing
	t: key => key,
};

export default DataBinder(withNamespaces('pages.resolvers')(Resolvers), [
	api.resolvers.setMapper(mapperResolvers).process(calculateResolvers)
]);
