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

import UpstreamsList from '../../upstreams/upstreamslist.jsx';
import utils from '#/utils.js';
import envUtils from '#/env.js';
import tooltips from '#/tooltips/index.jsx';
import PeerTooltip from '../../upstreams/PeerTooltip.jsx';
import ConnectionsTooltip from '../../upstreams/ConnectionsTooltip.jsx';
import { TableSortControl, styles } from '#/components/table';

export default class StreamUpstream extends UpstreamsList {
  get SORTING_SETTINGS_KEY() {
    return `sorting-stream-upstreams-${this.props.name}`;
  }

  get FILTERING_SETTINGS_KEY() {
    return `filtering-stream-upstreams-${this.props.name}`;
  }

  renderPeers(peers) {
    const { configured_health_checks } = this.props.upstream;
    return (
      <table className={`${styles.table} ${styles.wide}`}>
        <thead>
          {envUtils.isDemoEnv() ? (
            <tr>
              <TableSortControl
                secondSortLabel="Отсортировать по статусу – сначала выключенные"
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
                    Доступно только в
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
                secondSortLabel="Отсортировать по статусу – сначала выключенные"
                order={this.state.sortOrder}
                onChange={this.changeSorting}
              />
            ) : null}

            {this.getSelectAllCheckbox(peers)}

            <th colSpan="3">Пир</th>
            <th colSpan="4">Соединения</th>
            <th colSpan="4">Трафик</th>
            <th colSpan="2">Проверки сервера</th>
            {configured_health_checks ? (
              <th colSpan="3">Проверки работоспособности</th>
            ) : null}
          </tr>
          <tr className={`${styles['right-align']} ${styles['sub-header']}`}>
            <th className={styles['left-align']}>Имя</th>
            <th>
              <span
                className={styles.hinted}
                {...tooltips.useTooltip('Общий простой', 'hint')}
              >
                Простой
              </span>
            </th>
            <th className={`${styles.bdr}`}>
              <span
                className={styles.hinted}
                {...tooltips.useTooltip('Вес', 'hint')}
              >
                Вес
              </span>
            </th>
            <th>Всего</th>
            <th>Соед./сек</th>
            <th>Активных</th>
            <th className={styles.bdr}>Ограниченных</th>
            <th>Отпр./сек</th>
            <th>Получ./сек</th>
            <th>Отправлено</th>
            <th className={styles.bdr}>Принято</th>
            <th>Ошибок</th>
            <th className={styles.bdr}>Недоступно</th>
            {configured_health_checks
              ? [
                <th key="checks">Проверок</th>,
                <th key="fails">Ошибок</th>,
                <th key="last">Последняя проверка</th>,
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

                <td>{utils.formatUptime(peer.downtime, true)}</td>
                <td className={styles.bdr}>{peer.weight}</td>
                <td>
                  <span
                    className={styles.hinted}
                    {...tooltips.useTooltip(
                      <ConnectionsTooltip peer={peer} />,
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
                  {utils.formatReadableBytes(peer.server_sent_s)}
                </td>
                <td className={styles.px60}>
                  {utils.formatReadableBytes(peer.server_rcvd_s)}
                </td>
                <td>{utils.formatReadableBytes(peer.sent)}</td>
                <td className={styles.bdr}>
                  {utils.formatReadableBytes(peer.received)}
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
                      {utils.formatLastCheckDate(peer.health_checks.last)}
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
