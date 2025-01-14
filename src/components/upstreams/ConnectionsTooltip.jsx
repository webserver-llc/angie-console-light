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

import utils from '#/utils.js';

function ConnectionsTooltip({ title = 'Last', peer, t }) {
	return (
		<div>
			{
				peer.selected ? (
					<div>
						<div>
							{t('Last')}
							:
							{' '}
							{utils.formatDate(peer.selected)}
						</div>
						<div>
							(
							{utils.formatUptime(new Date().getTime() - Date.parse(peer.selected))}
							{' '}
							{t('ago')}
							)
						</div>
					</div>
				)
					: `${title}: неизвестно`
			}
		</div>
	);
}

export default withNamespaces('upstreams.connections-tooltip')(ConnectionsTooltip);
