/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';

import IndexBox from '../indexbox/indexbox.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '#/api';
import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import styles from './style.css';
import tooltipStyles from '../../../tooltip/style.css';

export const AboutAngieTooltip = ({ data }) => {
	return (
		<div>
			<div className={ tooltipStyles.row }>Reloads: {data.angie.generation}</div>
		</div>
	);
};

export class AboutAngie extends React.Component {
	render() {
		const { props: { data: { angie } } } = this;

		return (<IndexBox className={this.props.className}>
			<a href="https://angie.software/#id2" target="_blank" className={ styles.release }>
				{angie.build} ({angie.version})
			</a>

			<table className={ styles.table }>
				<tr>
					<th>Address</th>
					<td>{angie.address}</td>
				</tr>
				<tr>
					<th>Last reload</th>
					<td>
						<span className={ styles.uptime } {...tooltips.useTooltip(<AboutAngieTooltip data={this.props.data} />)}>
							{ utils.formatUptime(Date.now() - Date.parse(angie.load_time)) }
						</span>
					</td>
				</tr>
			</table>
		</IndexBox>);
	}
}

export default DataBinder(AboutAngie, [
	api.angie,
	api.processes
]);
