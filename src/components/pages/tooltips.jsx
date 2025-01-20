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
import Icon from '../icon/icon.jsx';
import styles from '../tooltip/style.css';

function CacheStateTooltip({ t }) {
	return (
		<div>
			<div className={styles.row}>
				<Icon type="sun" className={styles.icon} />
				{' '}
				{t('Warm — using metadata in shmem')}
			</div>

			<div className={styles.row}>
				<Icon type="snowflake" className={styles.icon} />
				{' '}
				{t('Cold — loading metadata')}
			</div>
		</div>
	);
}

CacheStateTooltip = withNamespaces('pages.tooltips')(CacheStateTooltip);

function SharedZoneTooltip({ t, zone }) {
	return (
		<div>
			{t('Used memory pages')}
			:
			{' '}
			{zone.pages.used}
			{' '}
			<br />
			{t('Total memory pages')}
			:
			{' '}
			{zone.pages.total}
			{' '}
			<br />
			{t('Memory usage = Used memory pages / Total memory pages')}
		</div>
	);
}

SharedZoneTooltip = withNamespaces('pages.tooltips')(SharedZoneTooltip);

export { CacheStateTooltip, SharedZoneTooltip };
