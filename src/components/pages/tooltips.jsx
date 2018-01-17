/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import Icon from '../icon/icon.jsx';
import styles from '../tooltip/style.css';

export const CacheStateTooltip = () => (
	<div>
		<div styleName="row">
			<Icon type="sun" styleName="icon" /> Warm &ndash; using metadata in shmem
		</div>

		<div styleName="row">
			<Icon type="snowflake" styleName="icon" /> Cold &ndash; loading metadata
		</div>
	</div>
);

export const SharedZoneTooltip = ({ zone }) => (<div>
	Used memory pages: { zone.pages.used } <br />
	Total pages: { zone.pages.total } <br />
	Memory usage = Used pages / Total pages
</div>);
