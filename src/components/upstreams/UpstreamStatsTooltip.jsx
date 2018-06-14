/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './tooltip.css';

export default ({ upstream }) => {
	let queueInfo = null;

	if (upstream.queue) {
		queueInfo = (<div styleName="column">
			<div>Q-Size: {upstream.queue.size}/{upstream.queue.max_size}</div>
			<div>Overflows: {upstream.queue.overflows} </div>
		</div>);
	}

	return (<div>
		<h5 styleName="h5">Upstream: { upstream.name }</h5>

		<div styleName="columns">
			<div styleName="column">
				<div><span styleName="status-tag status_up" /> Up: { upstream.stats.up }</div>
				<div><span styleName="status-tag status_unhealthy" /> Failed: { upstream.stats.failed }</div>
				<div><span styleName="status-tag status_draining" /> Drain: { upstream.stats.draining }</div>
				<div><span styleName="status-tag status_down" /> Down: { upstream.stats.down }</div>

				{
					upstream.stats.checking ?
						<div><span styleName="status-tag status_checking" /> Checking: { upstream.stats.checking }</div>
					: null
				}
			</div>

			{ queueInfo }

			<div styleName="column">
				{
					typeof upstream.keepalive === 'number' ?
						<div>Keepalive: { upstream.keepalive }</div>
					: null
				}
				<div>Zombies: { upstream.zombies }</div>
			</div>
		</div>
	</div>);
};

