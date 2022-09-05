/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';

import styles from './tooltip.css';
import utils from '#/utils.js';

export default function ConnectionsTooltip({ peer }){
	return (
		<div>
			{
				peer.selected ?
					<div>
						<div>Last: {utils.formatDate(peer.selected)}</div>
						<div>({utils.formatUptime(new Date().getTime() - Date.parse(peer.selected))} ago)</div>
					</div>
					: 'Last: unknown'
			}
		</div>
	);
};
