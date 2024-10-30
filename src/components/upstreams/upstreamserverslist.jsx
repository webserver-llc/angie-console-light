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
import { styles } from '#/components/table';

export default function UpstreamServerList(
	{
		servers,
		editSelectedUpstream,
		renderSelectCheckbox,
		renderAllSelectCheckbox
	}) {
	function renderEmptyList() {
		return (
			<tr>
				<td className={styles['left-align']} colSpan={30}>
					Не найдены сервера в этой группе апстримов.
				</td>
			</tr>
		);
	}

	function getStateServer(down) {
		if (down === 'drain') {
			return down;
		}

		return down ? 'down' : 'up';
	}

	function renderTbody() {
		if (servers.size === 0) {
			return renderEmptyList();
		}

		return Array.from(servers).map(([[serverName, serverDomain], server]) => (
			<tr>
				<td className={styles[getStateServer(server.down)]} />
				{renderSelectCheckbox(serverName, server)}
				<td
					className={`${styles['left-align']} ${styles.bold} ${styles.address}`}
				>
					<div className={styles['address-container']}>
						{server.backup ? <span>b&nbsp;</span> : null}
						{serverName}
					</div>
					<span
						className={styles['edit-peer']}
						onClick={() => editSelectedUpstream(serverName, server)}
					/>
					{serverDomain ? <div className={styles['below-title-text']}>{serverDomain}</div> : null}
				</td>
				<td>{server.weight}</td>
				<td>{getStateServer(server.down)}</td>
				<td>{server.max_conns}</td>
				<td>{server.max_fails}</td>
				<td>{server.fail_timeout}</td>
			</tr>
		));
	}

	return (
		<table className={`${styles.table} ${styles.firstChild10px}`}>
			<thead>
				<tr>
					<th />
					{renderAllSelectCheckbox()}
					<th>Сервер</th>
					<th>Вес</th>
					<th>Состония</th>
					<th>Max_conns</th>
					<th>Max_fails</th>
					<th>Fail_timeout</th>
				</tr>
			</thead>
			<tbody className={styles['right-align']}>
				{renderTbody()}
			</tbody>
		</table>
	);
}
