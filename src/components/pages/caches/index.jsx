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

import api from '#/api';
import DataBinder from '../../databinder/databinder.jsx';
import ProgressBar from '../../progressbar/progressbar.jsx';
import GaugeIndicator from '../../gaugeindicator/gaugeindicator.jsx';
import Icon from '../../icon/icon.jsx';
import cacheCalculator from '#/calculators/caches.js';
import sharedZonesCalculator from '#/calculators/sharedzones.js';
import tooltips from '#/tooltips/index.jsx';
import { ExpandableTable, styles } from '#/components/table';
import { CacheStateTooltip, SharedZoneTooltip } from '../tooltips.jsx';
import cachesStyles from './style.css';
import HumanReadableBytes from '#/components/human-readable-bytes/human-readable-bytes.jsx';

export class Caches extends ExpandableTable {
	getExpandableItems() {
		const {
			data: { caches },
		} = this.props;
		return Array.from(caches)
			.filter(([, cache]) => cache.shards)
			.map(([cacheName]) => cacheName);
	}

	hasExpandable(item) {
		const {
			data: { caches },
		} = this.props;
		return !!caches.get(item).shards;
	}

	componentDidMount() {
		this.handleClickExpandingAll();
	}

	render() {
		const {
			t,
			data: { caches },
		} = this.props;

		return (
			<div>
				<h1>{t('Caches')}</h1>

				<table className={styles.table}>
					<colgroup>
						{this.getExpandableItems().length ? <col width="10px" /> : null}
						<col width="170px" />
					</colgroup>

					<thead>
						<tr>
							{this.renderExpandingAllControl({ rowSpan: 2 })}
							<th>{t('Zone')}</th>
							<th>
								<span
									className={styles.hinted}
									{...tooltips.useTooltip(<CacheStateTooltip />, 'hint')}
								>
									{t('State')}
								</span>
							</th>
							<th>
								<span
									className={styles.hinted}
									{...tooltips.useTooltip(
										t('Memory usage = Used memory pages / Total memory pages'),
										'hint',
									)}
								>
									{t('Memory usage')}
								</span>
							</th>
							<th>{t('Max size')}</th>
							<th>
								{t('Used')}
							</th>
							<th>
								<span
									className={styles.hinted}
									{...tooltips.useTooltip(
										t('Disk usage = Used / Max size'),
										'hint',
									)}
								>
									{t('Disk usage')}
								</span>
							</th>
							<th colSpan="3">{t('Traffic')}</th>
							<th>
								{t('Hit Ratio')}
							</th>
						</tr>

						<tr className={`${styles['right-align']} ${styles['sub-header']}`}>
							<th className={styles.bdr} />
							<th className={styles.bdr} />
							<th className={styles.bdr} />
							<th className={styles.bdr} />
							<th className={styles.bdr} />
							<th className={styles.bdr} />
							<th>{t('Served')}</th>
							<th>{t('Written')}</th>
							<th className={styles.bdr}>{t('Bypassed')}</th>
							<th />
						</tr>
					</thead>

					<tbody>
						{Array.from(caches).map(([cacheName, cache]) => {
							let comp;

							if (typeof cache.max_size === 'number') {
								comp = <HumanReadableBytes value={cache.max_size} measurementUnit="GB" />;
							} else if (cache.shards) {
								comp = <span>-</span>;
							} else {
								comp = <span>&infin;</span>;
							}

							const result = [
								<tr
									data-expandable={
										this.hasExpandable(cacheName) ? 'true' : 'false'
									}
									onClick={() => this.toogleExpandingItemState(cacheName)}
								>
									{this.renderExpandingItemToogleIcon(cacheName)}
									<td className={`${styles.bold} ${styles.bdr}`}>
										{cacheName}
									</td>
									<td className={`${styles.bdr} ${styles['center-align']}`}>
										{cache.cold ? (
											<span {...tooltips.useTooltip(t('Cold'), 'hint')}>
												<Icon type="snowflake" className={cachesStyles.icon} />
											</span>
										) : (
											<span {...tooltips.useTooltip(t('Warm'), 'hint')}>
												<Icon type="sun" className={cachesStyles.icon} />
											</span>
										)}
									</td>
									<td className={styles.bdr}>
										<span
											{...tooltips.useTooltip(
												<SharedZoneTooltip zone={cache.slab} />,
												'hint',
											)}
										>
											<ProgressBar percentage={cache.zoneSize || 0} />
										</span>
									</td>
									<td className={styles.bdr}>
										{comp}
									</td>
									<td className={styles.bdr}>
										{typeof cache.size === 'number' ? (
											<HumanReadableBytes value={cache.size} measurementUnit="GB" />
										) : (
											<span>-</span>
										)}
									</td>
									<td className={styles.bdr}>
										{typeof cache.max_size === 'number' &&
											typeof cache.size === 'number' ? (
												<ProgressBar
													warning={cache.warning}
													danger={cache.danger}
													percentage={
														typeof cache.max_size !== 'number' ? -1 : cache.used
													}
												/>
											) : (
												<span>-</span>
											)}
									</td>
									<td className={styles['right-align']}>
										<HumanReadableBytes value={cache.traffic.s_served} />
									</td>
									<td className={styles['right-align']}>
										<HumanReadableBytes value={cache.traffic.s_written} />
									</td>
									<td className={`${styles.bdr} ${styles['right-align']}`}>
										<HumanReadableBytes value={cache.traffic.s_bypassed} />
									</td>
									<td>
										<GaugeIndicator percentage={cache.hit_percents_generic} />
									</td>
								</tr>,
							];

							if (this.isExpandingItem(cacheName)) {
								result.push(
									<tr
										data-expandable-element
										className={styles['without-hover']}
									>
										<td colSpan="2" />
										<td colSpan="10" className={styles['inner-table']}>
											<table className={`${styles.table} ${styles.wide} ${styles['no-sticky']}`}>
												<thead>
													<tr>
														<th>{t('Path')}</th>
														<th>
															<span
																className={styles.hinted}
																{...tooltips.useTooltip(
																	<CacheStateTooltip />,
																	'hint',
																)}
															>
																{t('State')}
															</span>
														</th>
														<th>{t('Max size')}</th>
														<th>{t('Used')}</th>
														<th>
															<span
																className={styles.hinted}
																{...tooltips.useTooltip(
																	t('Disk usage = Used / Max size'),
																	'hint',
																)}
															>
																{t('Disk usage')}
															</span>
														</th>
													</tr>
												</thead>
												<tbody>
													{Object.entries(cache.shards).map(([name, shard]) => (
														<tr>
															<td className={styles.bold}>{name}</td>
															<td
																className={`${styles.bdr} ${styles['center-align']}`}
															>
																{shard.cold ? (
																	<span
																		{...tooltips.useTooltip(`{${t('Cold')}}`, 'hint')}
																	>
																		<Icon
																			type="snowflake"
																			className={cachesStyles.icon}
																		/>
																	</span>
																) : (
																	<span
																		{...tooltips.useTooltip(t('Warm'), 'hint')}
																	>
																		<Icon
																			type="sun"
																			className={cachesStyles.icon}
																		/>
																	</span>
																)}
															</td>
															<td className={styles.bdr}>
																{typeof shard.max_size === 'number' ? (
																	<HumanReadableBytes value={shard.max_size} measurementUnit="GB" />
																) : (
																	<span>&infin;</span>
																)}
															</td>
															<td className={styles.bdr}>
																<HumanReadableBytes value={shard.size} measurementUnit="GB" />
															</td>
															<td className={styles.bdr}>
																{typeof shard.max_size === 'number' &&
																	typeof shard.size === 'number' ? (
																		<ProgressBar
																			warning={shard.warning}
																			danger={shard.danger}
																			percentage={
																				typeof shard.max_size !== 'number' ? -1 : shard.used
																			}
																		/>
																	) : (
																		<span>-</span>
																	)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</td>
									</tr>,
								);
							}
							return result;
						})}
					</tbody>
				</table>
			</div>
		);
	}
}

export default DataBinder(withNamespaces('pages.caches')(Caches), [
	api.slabs.process(sharedZonesCalculator),
	api.http.caches.process(cacheCalculator),
]);
