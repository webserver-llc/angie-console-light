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

import appsettings from '#/appsettings';
import utils from '#/utils.js';
import envUtils from '#/env.js';
import { TableSortControl, tableUtils, styles } from '#/components/table';
import {
	UpstreamsList,
	PeerTooltip,
	ConnectionsTooltip,
} from '#/components/upstreams';
import tooltips from '#/tooltips/index.jsx';

class Upstream extends UpstreamsList {
	constructor(props) {
		super(props);

		this.state = {
			...this.state,
			hoveredColumns: false,
			columnsExpanded: appsettings.getSetting(
				`columns-expanded-http-upstreams-${props.name}`,
				false,
			),
		};

		this.toggleColumns = this.toggleColumns.bind(this);
		this.hoverColumns = this.hoverColumns.bind(this);
	}

	get SORTING_SETTINGS_KEY() {
		return `sorting-http-upstreams-${this.props.name}`;
	}

	get FILTERING_SETTINGS_KEY() {
		return `filtering-http-upstreams-${this.props.name}`;
	}

	formatReadableBytes(value) {
		const { t } = this.props;
		return utils.formatReadableBytes(value, undefined, utils.translateReadableBytesUnits({ t }));
	}

	toggleColumns() {
		const columnsExpanded = !this.state.columnsExpanded;

		this.setState({
			columnsExpanded,
			hoveredColumns: false,
		});

		appsettings.setSetting(
			`columns-expanded-http-upstreams-${this.props.name}`,
			columnsExpanded,
		);
	}

	hoverColumns(hoveredColumns) {
		if (this.state.columnsExpanded) {
			this.setState({
				hoveredColumns,
			});
		}
	}

	renderPeers(peers) {
		const { t } = this.props;
		const { configured_health_checks } = this.props.upstream;
		return (
			<table
				className={`${styles.table} ${styles.wide}${this.state.hoveredColumns ? ` ${styles['hovered-expander']}` : ''
				}`}
			>
				<colgroup>
					<col width="10px" />
					{this.state.editMode ? <col width="1%" /> : null}
					<col width="210px" />
					<col width="1%" />

					<col />
					<col />
					<col />

					<col width="20px" />

					{this.state.columnsExpanded
						? [<col key="0" />, <col key="1" />, <col key="2" />]
						: null}

					<col />
					<col />
					<col width="1%" />
					<col width="1%" />
					<col width="1%" />
					<col width="1%" />
					<col />
					<col />
					<col />
					<col />
					{configured_health_checks ? (
						[<col key="3" />, <col key="4" />, <col key="5" width="100px" />]
					) : null}
				</colgroup>

				<thead>
					{
						envUtils.isDemoEnv() ?
							(
								<tr>
									<TableSortControl
										firstSortLabel={t('Sort by zone - asc')}
										secondSortLabel={t('Sort by conf order')}
										rowSpan={3}
										order={this.state.sortOrder}
										onChange={this.changeSorting}
									/>
									<th colSpan="3">&nbsp;</th>
									<th colSpan="2" />
									<th colSpan={this.state.columnsExpanded ? 6 : 3} />
									<th colSpan="2" />
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
							)
							: null
					}
					<tr>
						{
							!envUtils.isDemoEnv() ?
								(
									<TableSortControl
										firstSortLabel={t('Sort by zone - asc')}
										secondSortLabel={t('Sort by conf order')}
										order={this.state.sortOrder}
										onChange={this.changeSorting}
									/>
								)
								: null
						}

						{this.getSelectAllCheckbox(peers)}

						<th colSpan="3">{t('Peer')}</th>
						<th colSpan="2">{t('Requests')}</th>
						<th colSpan={this.state.columnsExpanded ? 6 : 3}>{t('Responses')}</th>
						<th colSpan="2">{t('Conns')}</th>
						<th colSpan="4">{t('Traffic')}</th>
						<th colSpan="2">{t('Server checks')}</th>
						{configured_health_checks ? (
							<th colSpan="3">{t('Health monitors')}</th>
						) : null}
					</tr>
					<tr className={`${styles['right-align']} ${styles['sub-header']}`}>
						<th className={styles['left-align']}>{t('Name')}</th>
						<th className={styles['left-align']}>
							<span
								className={styles.hinted}
								{...tooltips.useTooltip(t('Total downtime'), 'hint')}
							>
								{t('TD')}
							</span>
						</th>
						<th className={`${styles['center-align']} ${styles.bdr}`}>
							<span
								className={styles.hinted}
								{...tooltips.useTooltip(t('Weight'), 'hint')}
							>
								{t('Weight')}
							</span>
						</th>

						<th>{t('Total')}</th>
						<th className={styles.bdr}>{t('Req/s')}</th>

						{this.state.columnsExpanded ? (
							[
								<th key="empty" className={styles['center-align']} />,
								<th key="1xx" className={styles['responses-column']}>
									1xx
								</th>,
								<th key="2xx" className={styles['responses-column']}>
									2xx
								</th>,
								<th key="3xx" className={styles['responses-column']}>
									3xx
								</th>,
							]
						) : (
							<th className={styles['center-align']}>...</th>
						)}

						<th>4xx</th>
						<th className={styles.bdr}>5xx</th>

						<th className={styles['center-align']}>
							<span
								className={styles.hinted}
								{...tooltips.useTooltip(t('Active'), 'hint')}
							>
								{t('Active_short')}
							</span>
						</th>
						<th className={`${styles['center-align']} ${styles.bdr}`}>
							<span
								className={styles.hinted}
								{...tooltips.useTooltip(t('Limit'), 'hint')}
							>
								{t('Limit_short')}
							</span>
						</th>

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
						: peers.map((peer, i) => {
							const {
								responses: { codes },
							} = peer;

							return (
								<tr>
									<td className={styles[peer.state]} />

									{this.getCheckbox(peer)}

									<td
										className={`${styles['left-align']} ${styles.bold} ${styles.address}`}
									>
										<div
											className={styles['address-container']}
											{...tooltips.useTooltip(<PeerTooltip peer={peer} />)}
										>
											{peer.backup ? <span>b&nbsp;</span> : null}
											{peer.name}
										</div>

										{this.state.editMode ? (
											<span
												className={styles['edit-peer']}
												onClick={() => this.editSelectedUpstream(peer)}
											/>
										) : null}

										<div className={styles['below-title-text']}>{peer.server}</div>
									</td>
									<td className={styles['left-align']}>
										{utils.formatUptime(peer.downtime, true)}
									</td>
									<td className={`${styles['center-align']} ${styles.bdr}`}>
										{peer.weight}
									</td>

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

									<td className={styles.bdr}>{peer.server_req_s}</td>

									{this.state.columnsExpanded ? (
										[
											i === 0 ? (
												<td
													className={styles['collapse-columns']}
													rowSpan={peers.length}
													onClick={this.toggleColumns}
													onMouseEnter={() => this.hoverColumns(true)}
													onMouseLeave={() => this.hoverColumns(false)}
													key="toggle"
												>
													◀
												</td>
											) : null,
											<td className={styles['responses-column']} key="1xx">
												{tableUtils.responsesTextWithTooltip(
													peer.responses['1xx'],
													codes,
													'1',
												)}
											</td>,
											<td className={styles['responses-column']} key="2xx">
												{tableUtils.responsesTextWithTooltip(
													peer.responses['2xx'],
													codes,
													'2',
												)}
											</td>,
											<td className={styles['responses-column']} key="3xx">
												{tableUtils.responsesTextWithTooltip(
													peer.responses['3xx'],
													codes,
													'3',
												)}
											</td>,
										]
									) : i === 0 ? (
										<td
											className={styles['collapse-columns']}
											rowSpan={peers.length}
											onClick={this.toggleColumns}
										>
											▶
										</td>
									) : null}

									<td
										className={`${styles.flash}${peer['4xxChanged'] ? ` ${styles['red-flash']}` : ''
										}`}
									>
										{tableUtils.responsesTextWithTooltip(
											peer.responses['4xx'],
											codes,
											'4',
										)}
									</td>
									<td
										className={`${styles.bdr} ${styles.flash}${peer['5xxChanged'] ? ` ${styles['red-flash']}` : ''
										}`}
									>
										{tableUtils.responsesTextWithTooltip(
											peer.responses['5xx'],
											codes,
											'5',
										)}
									</td>

									<td className={styles['center-align']}>{peer.active}</td>
									<td className={`${styles['center-align']} ${styles.bdr}`}>
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
									<td>{this.formatReadableBytes(peer.received)}</td>
									<td>{peer.fails}</td>
									<td className={styles.bdr}>{peer.unavail}</td>
									{configured_health_checks ? (
										[
											<td key="health_checks_checks">{peer.health_checks.checks}</td>,
											<td key="health_checks_fails">{peer.health_checks.fails}</td>,
											<td key="health_checks_last">
												{utils.formatLastCheckDate(peer.health_checks.last)}
											</td>
										]
									) : null}
								</tr>
							);
						})}
				</tbody>
			</table>
		);
	}
}

export default withNamespaces('pages.upstreams')(Upstream);
