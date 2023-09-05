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
import { getHrefDocs } from './utils.js';

export function AboutAngieTooltip({ data }) {
	return (
		<div>
			<div className={tooltipStyles.row}>
				Reloads:
				{' '}
				{data.angie.generation}
			</div>
		</div>
	);
}

export class AboutAngie extends React.Component {
	renderLinkToDocs() {
		const { props: { data: { angie } } } = this;

		if (!angie.build && !angie.version) return null;

		const hrefToDocs = getHrefDocs();
		let text;
		if (angie.build) {
			text = angie.build;
		}
		if (text) {
			text += ` (${angie.version})`;
		} else {
			text = angie.version;
		}

		return (
			<a href={hrefToDocs} target="_blank" className={styles.release} rel="noreferrer">
				{text}
			</a>
		);
	}

	render() {
		const { props: { data: { angie } } } = this;

		return (
			<IndexBox className={this.props.className}>
				{this.renderLinkToDocs()}

				<table className={styles.table}>
					<tr>
						<th>Address</th>
						<td>{angie.address}</td>
					</tr>
					<tr>
						<th>Last reload</th>
						<td>
							<span className={styles.uptime} {...tooltips.useTooltip(<AboutAngieTooltip data={this.props.data} />)}>
								{ utils.formatUptime(Date.now() - Date.parse(angie.load_time)) }
							</span>
						</td>
					</tr>
				</table>
			</IndexBox>
		);
	}
}

export default DataBinder(AboutAngie, [
	api.angie,
	api.processes
]);
