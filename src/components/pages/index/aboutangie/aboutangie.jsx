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

import IndexBox from '../indexbox/indexbox.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '#/api';
import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import commonStyles from '#/style.css';
import styles from './style.css';
import tooltipStyles from '../../../tooltip/style.css';
import { getHrefDocs } from './utils.js';

export function AboutAngieTooltip({ data }) {
	return (
		<div>
			<div className={tooltipStyles.row}>
				Перезагрузок:
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
		let text = angie.version;

		if (angie.build) {
			text += ` ${angie.build}`;
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
				<div>
					{this.renderLinkToDocs()}
					{angie.config_files ?
						(
							<a href="#config_files" id="config-files" className={`${commonStyles.fr}`}>Конфиг-файлы</a>
						)
						: null}
				</div>
				<table className={styles.table}>
					<tr>
						<th>Адрес:</th>
						<td>{angie.address}</td>
					</tr>
					<tr>
						<th>Последняя перезагрузка:</th>
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
