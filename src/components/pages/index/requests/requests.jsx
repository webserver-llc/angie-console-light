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
import IndexBox from '../indexbox/indexbox.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '../../../../api';
import calculateRequests from '../../../../calculators/requests.js';
import styles from '../connections/style.css';

export class Requests extends React.Component {
	render() {
		const { t, data: { requests } } = this.props;

		return (
			<IndexBox className={this.props.className}>
				<span className={styles.counter}>
					{t('Total')}
					:
					{requests.total}
				</span>
				<h3 className={styles.h3}>{t('Requests')}</h3>

				<table className={styles.table}>
					<tr>
						<th>{t('Current')}</th>
						<th>{t('Req/s')}</th>
					</tr>
					<tr>
						<td>{requests.current}</td>
						<td>{requests.reqs}</td>
					</tr>
				</table>
			</IndexBox>
		);
	}
}

export default DataBinder(withNamespaces('pages.index.requests')(Requests), [
	api.http.requests.process(calculateRequests)
]);
