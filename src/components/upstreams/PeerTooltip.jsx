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

import styles from './tooltip.css';
import utils from '#/utils.js';

export default function PeerTooltip({ peer }) {
	let state = null;

	if (peer.state === 'unavail') {
		state = (
			<span>
				<span className={styles.status_unavail}>Проблемный</span>
				{' '}
				(не прошел пассивную проверку работоспособности)
			</span>
		);
	} else if (peer.state === 'unhealthy') {
		state = (
			<span>
				<span className={styles.status_unavail}>Проблемный</span>
				{' '}
				(не прошел активную проверку работоспособности)
			</span>
		);
	} else if (peer.state === 'checking') {
		state = <span className={styles[`status_${peer.state}`]}>На проверке</span>;
	} else if (peer.state === 'up') {
		state = <span className={styles[`status_${peer.state}`]}>Активен</span>;
	} else if (peer.state === 'down') {
		state = <span className={styles[`status_${peer.state}`]}>Выключен</span>;
	} else {
		state = <span className={styles[`status_${peer.state}`]}>{peer.state}</span>;
	}

	return (
		<div>
			{'name' in peer ? <div className={styles.row}>{peer.name}</div> : null}
			<h5 className={styles.h5}>
				{peer.backup ? 'b ' : ''}
				{peer.server}
			</h5>
			<div className={styles.row}>{state}</div>

			{
				peer.backup ? <div className={styles.row}>Тип: бекап</div> : null
			}

			<div className={styles.row}>
				Простаивает:
				{' '}
				{utils.formatUptime(peer.downtime)}
			</div>

			{
				peer.isHttp && peer.downstart ? (
					<div className={styles.row}>
						Выключен с:
						{' '}
						{utils.formatDate(peer.downstart)}
					</div>
				) : null
			}
		</div>
	);
}
