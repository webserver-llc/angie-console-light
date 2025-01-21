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

function UpstreamStatsTooltip({ upstream, t }) {
	let queueInfo = null;

	if (upstream.queue) {
		queueInfo = (
			<div className={styles.column}>
				<div>
					{t('Q-Size:')}
					{upstream.queue.size}
					/
					{upstream.queue.max_size}
				</div>
				<div>
					{t('Overflows:')}
					{upstream.queue.overflows}
				</div>
			</div>
		);
	}

	return (
		<div>
			<h5 className={styles.h5}>
				{t('Upstream:')}
				{' '}
				{upstream.name}
			</h5>

			<div className={styles.columns}>
				<div className={styles.column}>
					<div>
						<span className={`${styles['status-tag']} ${styles.status_up}`} />
						{' '}
						{t('Up:')}
						{' '}
						{upstream.stats.up}
					</div>
					<div>
						<span className={`${styles['status-tag']} ${styles.status_unhealthy}`} />
						{' '}
						{t('Failed:')}
						{' '}
						{upstream.stats.failed}
					</div>
					<div>
						<span className={`${styles['status-tag']} ${styles.status_draining}`} />
						{' '}
						{t('Drain:')}
						{' '}
						{upstream.stats.draining}
					</div>
					<div>
						<span className={`${styles['status-tag']} ${styles.status_down}`} />
						{' '}
						{t('Down:')}
						{' '}
						{upstream.stats.down}
					</div>

					{
						upstream.stats.checking ? (
							<div>
								<span className={`${styles['status-tag']} ${styles.status_checking}`} />
								{' '}
								{t('Checking:')}
								{' '}
								{upstream.stats.checking}
							</div>
						)
							: null
					}
				</div>

				{queueInfo}

				<div className={styles.column}>
					{
						typeof upstream.keepalive === 'number' ? (
							<div>
								{t('Keepalive:')}
								{' '}
								{upstream.keepalive}
							</div>
						)
							: null
					}
					<div>
						{t('Zombies:')}
						{' '}
						{upstream.zombies}
					</div>
				</div>
			</div>
		</div>
	);
}

export default withNamespaces('upstreams.upstream-stats-tooltip')(UpstreamStatsTooltip);
