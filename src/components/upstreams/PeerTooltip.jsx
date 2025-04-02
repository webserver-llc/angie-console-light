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

import styles from './tooltip.css';
import utils from '#/utils.js';

function PeerTooltip({ peer, t }) {
	let state = null;

	function formatUptime(ms, short = false) {
		return utils.formatUptime(ms, short, utils.translateUptimeUnits({ t }));
	}

	if (peer.state === 'unavail') {
		state = (
			<span>
				<span className={styles.status_unavail}>{t('Failed')}</span>
				{' '}
				(
				{t('Passive health check failed')}
				)
			</span>
		);
	} else if (peer.state === 'unhealthy') {
		state = (
			<span>
				<span className={styles.status_unavail}>{t('Failed')}</span>
				{' '}
				(
				{t('Active health check failed')}
				)
			</span>
		);
	} else if (peer.state === 'checking') {
		state = <span className={styles[`status_${peer.state}`]}>{t('Checking')}</span>;
	} else if (peer.state === 'up') {
		state = <span className={styles[`status_${peer.state}`]}>{t('Up')}</span>;
	} else if (peer.state === 'down') {
		state = <span className={styles[`status_${peer.state}`]}>{t('Down')}</span>;
	} else if (peer.state === 'busy') {
		state = <span className={styles[`status_${peer.state}`]}>{t('Busy')}</span>;
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
				peer.backup ? <div className={styles.row}>{t('Type: backup')}</div> : null
			}

			<div className={styles.row}>
				{t('Total downtime:')}
				{' '}
				{formatUptime(peer.downtime)}
			</div>

			{
				peer.isHttp && peer.downstart ? (
					<div className={styles.row}>
						{t('Down since:')}
						{' '}
						{utils.formatDate(peer.downstart)}
					</div>
				) : null
			}
		</div>
	);
}

export default withNamespaces('upstreams.peer-tooltip')(PeerTooltip);
