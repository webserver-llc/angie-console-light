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

import IndexBox from '../indexbox/indexbox.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '#/api';
import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import commonStyles from '#/style.css';
import styles from './style.css';
import tooltipStyles from '../../../tooltip/style.css';
import { getHrefDocs } from './utils.js';

export function AboutAngieTooltip({ t, data }) {
	return (
		<div>
			<div className={tooltipStyles.row}>
				{t('Reload')}
				:
				{' '}
				{data.angie.generation}
			</div>
		</div>
	);
}

AboutAngieTooltip.defaultProps = {
	// i18n for testing
	t: key => key
};

export class AboutAngie extends React.Component {
	formatUptime(ms, short = false) {
		const { t } = this.props;
		return utils.formatUptime(ms, short, utils.translateUptimeUnits({ t }));
	}

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
		const { props: { t, data: { angie } } } = this;

		return (
			<IndexBox className={this.props.className}>
				<div>
					{this.renderLinkToDocs()}
					{angie.config_files ?
						(
							<a href="#config_files" id="config-files" className={`${commonStyles.fr}`}>{t('Config Files')}</a>
						)
						: null}
				</div>
				<table className={styles.table}>
					<tr>
						<th>
							{t('Address')}
							:
						</th>
						<td>{angie.address}</td>
					</tr>
					<tr>
						<th>
							{t('Last reload')}
							:
						</th>
						<td>
							<span className={styles.uptime} {...tooltips.useTooltip(<AboutAngieTooltip t={t} data={this.props.data} />)}>
								{this.formatUptime(Date.now() - Date.parse(angie.load_time))}
							</span>
						</td>
					</tr>
				</table>
			</IndexBox>
		);
	}
}

export default DataBinder(withNamespaces('pages.index.aboutangie')(AboutAngie), [
	api.angie,
	api.processes
]);
