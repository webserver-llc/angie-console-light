/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import IndexBox from '../indexbox/indexbox.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '../../../../api';
import { formatUptime, formatDate } from '../../../../utils.js';
import { useTooltip } from '../../../../tooltips/index.jsx';

import styles from './style.css';
import tooltipStyles from '../../../tooltip/style.css';

export const AboutNginxTooltip = ({ data }) => {
	return (
		<div>
			<div className={ tooltipStyles.row }>Last (re)load: {formatDate(data.nginx.load_timestamp)}</div>
			<div className={ tooltipStyles.row }>Reloads: {data.nginx.generation}</div>
			{ data.processes && <div className={ tooltipStyles.row }>Respawned: {data.processes.respawned}</div> }
		</div>
	);
};

export class AboutNginx extends React.Component {
	render() {
		const { props: { data: { nginx } } } = this;

		return (<IndexBox className={this.props.className}>
			<a href="https://www.nginx.com/resources/admin-guide/nginx-plus-releases/" target="_blank" className={ styles.release }>
				{nginx.build} ({nginx.version})
			</a>

			<table className={ styles.table }>
				<tr>
					<th>Address</th>
					<td>{nginx.address}</td>
				</tr>
				<tr>
					<th>PID</th>
					<td>{nginx.ppid}</td>
				</tr>
				<tr>
					<th>Uptime</th>
					<td>
						<span className={ styles.uptime } {...useTooltip(<AboutNginxTooltip data={this.props.data} />)}>
							{ formatUptime(Date.parse(nginx.timestamp) - Date.parse(nginx.load_timestamp)) }
						</span>
					</td>
				</tr>
			</table>
		</IndexBox>);
	}
}

export default DataBinder(AboutNginx, [
	api.nginx,
	api.processes
]);
