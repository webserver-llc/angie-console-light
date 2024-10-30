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
import mapperResolvers from '../../api/mappers/resolvers.js';
import calculateResolvers from '../../calculators/resolvers.js';
import styles from '../table/style.css';

export class Resolvers extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'resolversSortOrder';
	}

	render() {
		const resolvers = Array.from(this.props.data.resolvers);

		if (this.state.sortOrder === 'desc') {
			resolvers.sort(([nameA, a], [nameB, b]) => a.alert ? -1 : 1);
		}

		return (
			<div>
				<h1>DNS Резолверы</h1>

				<table className={`${styles.table} ${styles.wide}`}>
					<thead>
						<tr>
							<TableSortControl order={this.state.sortOrder} onChange={this.changeSorting} />
							<th>Зона</th>
							<th colSpan={3}>Запросы</th>
							<th colSpan={8}>Ответы</th>
						</tr>
						<tr className={`${styles['right-align']} ${styles['sub-header']}`}>
							<th className={styles.bdr} />
							<th>Имя</th>
							<th>SRV</th>
							<th className={styles.bdr}>Адрес</th>
							<th>Успешных</th>
							<th>Ошибок формата запроса</th>
							<th>Сервер не завершил запрос</th>
							<th>Ресурсов не найдено</th>
							<th>Неимплементированы</th>
							<th>Отказано в операции</th>
							<th>Неизвестных</th>
							<th>Истекших</th>
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

export default DataBinder(Resolvers, [
	api.resolvers.setMapper(mapperResolvers).process(calculateResolvers)
]);
