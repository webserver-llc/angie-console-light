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
import Icon from '../icon/icon.jsx';
import styles from '../tooltip/style.css';

export function CacheStateTooltip() {
	return (
		<div>
			<div className={styles.row}>
				<Icon type="sun" className={styles.icon} />
				{' '}
				Warm &ndash; using metadata in shmem
			</div>

			<div className={styles.row}>
				<Icon type="snowflake" className={styles.icon} />
				{' '}
				Cold &ndash; loading metadata
			</div>
		</div>
	);
}

export function SharedZoneTooltip({ zone }) {
	return (
		<div>
			Использовано страниц памяти:
			{' '}
			{zone.pages.used}
			{' '}
			<br />
			Всего страниц:
			{' '}
			{zone.pages.total}
			{' '}
			<br />
			Страниц памяти = Использованы страницы / Всего страниц
		</div>
	);
}
