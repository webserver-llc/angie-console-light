
/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './tooltip.css';

import { formatUptime, formatDate } from '../../utils.js';

export default function PeerTooltip({ peer }){
	let state = null;

	if (peer.state === 'unavail') {
		state = <span><span styleName="status_unavail">failed</span> (Passive health check failed)</span>;
	} else if (peer.state === 'unhealthy') {
		state = <span><span styleName="status_unavail">failed</span> (Active health check failed)</span>;
	} else {
		state = <span styleName={`status_${peer.state}`}>{peer.state}</span>;
	}

	let lastCheck;

	if (peer.health_status === null) {
		lastCheck = 'unknown';
	} else if(peer.health_status) {
		lastCheck = 'passed';
	} else {
		lastCheck = 'failed';
	}

	return (<div>
		{'name' in peer ? <div styleName="row">{peer.name}</div> : null}
		<h5 styleName="h5">{peer.backup ? 'b ' : ''}{peer.server}</h5>
		<div styleName="row">{state}</div>

		{
			peer.backup ? <div styleName="row">Type: backup</div> : null
		}

		<div styleName="row">Total downtime: {formatUptime(peer.downtime)}</div>
		<div styleName="row">Last check: {lastCheck}</div>

		{
			peer.isHttp && peer.downstart ? <div styleName="row">Down since: {formatDate(peer.downstart)} </div> : null
		}
	</div>);
};