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

import UpstreamsList from '../../upstreams/upstreamslist.jsx';
import utils from '#/utils.js';
import envUtils from '#/env.js';
import tooltips from '#/tooltips/index.jsx';
import PeerTooltip from '../../upstreams/PeerTooltip.jsx';
import ConnectionsTooltip from '../../upstreams/ConnectionsTooltip.jsx';
import { TableSortControl, styles } from '#/components/table';

class StreamUpstream extends UpstreamsList {
	get SORTING_SETTINGS_KEY() {
		return `sorting-stream-upstreams-${this.props.name}`;
	}

	get FILTERING_SETTINGS_KEY() {
		return `filtering-stream-upstreams-${this.props.name}`;
	}

	formatReadableBytes(value) {
		const { t } = this.props;
		return utils.formatReadableBytes(value, undefined, utils.translateReadableBytesUnits({ t }));
	}

	formatUptime(ms, short = false) {
		const { t } = this.props;
		return utils.formatUptime(ms, short, utils.translateUptimeUnits({ t }));
	}

	formatLastCheckDate(date) {
		const { t } = this.props;
		return utils.formatLastCheckDate(date, utils.translateUptimeUnits({ t }));
	}

	renderPeers(peers) {
		const { t } = this.props;
		const { configured_health_checks } = this.props.upstream;
		return (
			<table className={`${styles.table} ${styles.wide}`}>
				<thead>
					{envUtils.isDemoEnv() ? (
						<tr>
							<TableSortControl
								firstSortLabel={t('Sort by zone - asc')}
								secondSortLabel={t('Sort by conf order')}
								rowSpan={3}
								order={this.state.sortOrder}
								onChange={this.changeSorting}
							/>
							<th colSpan="3">&nbsp;</th>
							<th colSpan="4" />
							<th colSpan="4" />
							<th colSpan="2">&nbsp;</th>
							{configured_health_checks ? (
								<th colSpan="3" className={styles['promo-header-cell']}>
									<span>
										{t('Available only in')}
										{' '}
										<span>Angie PRO</span>
									</span>
								</th>
							) : null}
						</tr>
					) : null}
					<tr>
						{!envUtils.isDemoEnv() ? (
							<TableSortControl
								firstSortLabel={t('Sort by zone - asc')}
								secondSortLabel={t('Sort by conf order')}
								order={this.state.sortOrder}
								onChange={this.changeSorting}
							/>
						) : null}

						{this.getSelectAllCheckbox(peers)}

						<th colSpan="3">{t('Peer')}</th>
						<th colSpan="4">{t('Connection')}</th>
						<th colSpan="4">{t('Traffic')}</th>
						<th colSpan="2">{t('Server checks')}</th>
						{configured_health_checks ? (
							<th colSpan="3">{t('Health monitors')}</th>
						) : null}
					</tr>
					<tr className={`${styles['right-align']} ${styles['sub-header']}`}>
						<th className={styles['left-align']}>{t('Name')}</th>
						<th>
							<span
								className={styles.hinted}
								{...tooltips.useTooltip(t('Total downtime'), 'hint')}
							>
								{t('TD')}
							</span>
						</th>
						<th className={`${styles.bdr}`}>
							<span
								className={styles.hinted}
								{...tooltips.useTooltip(t('Weight'), 'hint')}
							>
								{t('Weight')}
							</span>
						</th>
						<th>{t('Total')}</th>
						<th>{t('Conn/s')}</th>
						<th>{t('Active')}</th>
						<th className={styles.bdr}>{t('Limit')}</th>
						<th>{t('Sent/s')}</th>
						<th>{t('Rcvd/s')}</th>
						<th>{t('Sent')}</th>
						<th className={styles.bdr}>{t('Rcvd')}</th>
						<th>{t('Fails')}</th>
						<th className={styles.bdr}>{t('Unavail')}</th>
						{configured_health_checks
							? [
								<th key="checks">{t('Checks')}</th>,
								<th key="fails">{t('Fails')}</th>,
								<th key="last">{t('Last')}</th>,
							]
							: null}
					</tr>
				</thead>

				<tbody className={styles['right-align']}>
					{peers.length === 0
						? this.renderEmptyList()
						: peers.map((peer) => (
							<tr>
								<td className={styles[peer.state]} />

								{this.getCheckbox(peer)}

								<td
									className={`${styles['left-align']} ${styles.bold} ${styles.address}`}
								>
									<span
										className={styles['address-container']}
										{...tooltips.useTooltip(<PeerTooltip peer={peer} />)}
									>
										{peer.backup ? <span>b&nbsp;</span> : null}
										{peer.server}
									</span>

									{this.state.editMode ? (
										<span
											className={styles['edit-peer']}
											onClick={() => this.editSelectedUpstream(peer)}
										/>
									) : null}
								</td>

								<td>{this.formatUptime(peer.downtime, true)}</td>
								<td className={styles.bdr}>{peer.weight}</td>
								<td>
									<span
										className={styles.hinted}
										{...tooltips.useTooltip(
											<ConnectionsTooltip title={t('Last')} peer={peer} />,
											'hint',
										)}
									>
										{peer.requests}
									</span>
								</td>
								<td>{peer.server_conn_s}</td>
								<td>{peer.active}</td>
								<td className={styles.bdr}>
									{peer.max_conns === Infinity ? (
										<span>&infin;</span>
									) : (
										peer.max_conns
									)}
								</td>
								<td className={styles.px60}>
									{this.formatReadableBytes(peer.server_sent_s)}
								</td>
								<td className={styles.px60}>
									{this.formatReadableBytes(peer.server_rcvd_s)}
								</td>
								<td>{this.formatReadableBytes(peer.sent)}</td>
								<td className={styles.bdr}>
									{this.formatReadableBytes(peer.received)}
								</td>
								<td>{peer.fails}</td>
								<td>{peer.unavail}</td>
								{configured_health_checks
									? [
										<td key="health_checks_checks">
											{peer.health_checks.checks}
										</td>,
										<td key="health_checks_fails">
											{peer.health_checks.fails}
										</td>,
										<td key="health_checks_last">
											{this.formatLastCheckDate(peer.health_checks.last)}
										</td>,
									]
									: null}
							</tr>
						))}
				</tbody>
			</table>
		);
	}
}

export default withNamespaces('pages.streamupstreams')(StreamUpstream);
