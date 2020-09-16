
/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './tooltip.css';

import { formatUptime, formatDate } from '../../utils.js';

export default function ConnectionsTooltip({ peer }){
	return (
		<div>
			{
				peer.selected ?
					<div>
						<div>Last: {formatDate(peer.selected)}</div>
						<div>({formatUptime(new Date().getTime() - Date.parse(peer.selected))} ago)</div>
					</div>
					: 'Last: unknown'
			}
		</div>
	);
};
