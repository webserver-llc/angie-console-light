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

	getCurrentCell(value) {
		return (
			<td className={styles.current}>
				{value}
				{
					typeof value == 'number' ?
						<span className={styles.current__sec}>/сек</span>
						: null
				}
			</td>
		);
	}

	render() {
		const { props: { data: { connections, ssl } }, state: { tab } } = this;
		let tabsStyleName = styles.tabs;
		const isConnsTab = this.state.tab === 'conns';

		if (!isConnsTab) {
			tabsStyleName += ` ${styles.tabs_ssl}`;
		}

		return (
			<IndexBox className={this.props.className}>
				{
					isConnsTab ? (
						<span className={styles.counter}>
							Принято: 
							{connections.accepted}
						</span>
					)
						: null
				}

				<div className={tabsStyleName}>
					<div className={isConnsTab ? styles['tab-active'] : styles.tab} onClick={this.changeTab.bind(this, 'conns')}>
						<span>Соединения</span>
					</div>
				</div>

				{
					isConnsTab ? (
						<table className={styles.table}>
							<tr>
								<th>Текущие</th>
								<th>Принято/сек</th>
								<th>Активные</th>
								<th>Простаивающие</th>
								<th>Сброшенные</th>
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

export default DataBinder(Connections, [
	api.connections.process(calculateConnections),
]);
