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
				Горячий &ndash; метаданные загружены в память
			</div>

			<div className={styles.row}>
				<Icon type="snowflake" className={styles.icon} />
				{' '}
				Холодный &ndash; метаданные загружаются
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
			Всего страниц памяти:
			{' '}
			{zone.pages.total}
			{' '}
			<br />
			Загрузка памяти = использовано страниц / всего страниц
		</div>
	);
}
