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
import DataBinder from '#/components/databinder/databinder.jsx';
import api from '#/api';
import calculateConnections from '#/calculators/connections.js';
import styles from './style.css';

export class Connections extends React.Component {
	constructor() {
		super();

		this.state = {
			tab: 'conns'
		};
	}

	changeTab(tab) {
		this.setState({ tab });
	}

	render() {
		const { props: { t, className, data: { connections } }, state: { tab } } = this;
		let tabsStyleName = styles.tabs;
		const isConnsTab = tab === 'conns';

		if (!isConnsTab) {
			tabsStyleName += ` ${styles.tabs_ssl}`;
		}

		return (
			<IndexBox className={className}>
				{
					isConnsTab ? (
						<span className={styles.counter}>
							{t('Accepted')}
							:
							{' '}
							{connections.accepted}
						</span>
					)
						: null
				}

				<div className={tabsStyleName}>
					<div className={isConnsTab ? styles['tab-active'] : styles.tab} onClick={this.changeTab.bind(this, 'conns')}>
						<span>{t('Connections')}</span>
					</div>
				</div>

				{
					isConnsTab ? (
						<table className={styles.table}>
							<tr>
								<th>{t('Current')}</th>
								<th>{t('Accepted/s')}</th>
								<th>{t('Active')}</th>
								<th>{t('Idle')}</th>
								<th>{t('Dropped')}</th>
							</tr>
							<tr>
								<td>{connections.current}</td>
								<td>{connections.accepted_s}</td>
								<td>{connections.active}</td>
								<td>{connections.idle}</td>
								<td>{connections.dropped}</td>
							</tr>
						</table>
					)
						: null
				}
			</IndexBox>
		);
	}
}

export default DataBinder(withNamespaces('pages.index.connections')(Connections), [
	api.connections.process(calculateConnections),
]);
