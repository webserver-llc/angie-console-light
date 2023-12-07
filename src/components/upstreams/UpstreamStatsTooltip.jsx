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
import styles from './tooltip.css';

export default function UpstreamStatsTooltip({ upstream }){
	let queueInfo = null;

	if (upstream.queue) {
		queueInfo = (<div className={ styles.column }>
			<div>Q-Size: {upstream.queue.size}/{upstream.queue.max_size}</div>
			<div>Overflows: {upstream.queue.overflows} </div>
		</div>);
	}

	return (<div>
		<h5 className={ styles.h5 }>Upstream: { upstream.name }</h5>

		<div className={ styles.columns }>
			<div className={ styles.column }>
				<div><span className={ `${ styles['status-tag'] } ${ styles['status_up'] }` } /> Up: { upstream.stats.up }</div>
				<div><span className={ `${ styles['status-tag'] } ${ styles['status_unhealthy'] }` } /> Failed: { upstream.stats.failed }</div>
				<div><span className={ `${ styles['status-tag'] } ${ styles['status_draining'] }` } /> Drain: { upstream.stats.draining }</div>
				<div><span className={ `${ styles['status-tag'] } ${ styles['status_down'] }` } /> Down: { upstream.stats.down }</div>

				{
					upstream.stats.checking ?
						<div><span className={ `${ styles['status-tag'] } ${ styles['status_checking'] }` } /> Checking: { upstream.stats.checking }</div>
					: null
				}
			</div>

			{ queueInfo }

			<div className={ styles.column }>
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

