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
import IndexBox from '../indexbox/indexbox.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '../../../../api';
import calculateRequests from '../../../../calculators/requests.js';
import styles from '../connections/style.css';

export class Requests extends React.Component {
	render() {
		const { data: { requests } } = this.props;

		return (<IndexBox className={this.props.className}>
			<span className={ styles.counter }>Всего:{ requests.total }</span>
			<h3 className={ styles.h3 }>Запросы</h3>

			{
				<table className={ styles.table }>
					<tr>
						<th>Текущие</th>
						<th>Запр./сек</th>
					</tr>
					<tr>
						<td>{ requests.current }</td>
						<td>{ requests.reqs }</td>
					</tr>
				</table>
			}
		</IndexBox>);
	}
}

export default DataBinder(Requests, [
	api.http.requests.process(calculateRequests)
]);
