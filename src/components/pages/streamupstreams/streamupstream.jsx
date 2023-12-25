/*
 *
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import React from "react";

import UpstreamsList from "../../upstreams/upstreamslist.jsx";
import utils from "#/utils.js";
import envUtils from "#/env.js";
import tooltips from "#/tooltips/index.jsx";
import PeerTooltip from "../../upstreams/PeerTooltip.jsx";
import ConnectionsTooltip from "../../upstreams/ConnectionsTooltip.jsx";
import { TableSortControl, styles } from "#/components/table";

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
                secondSortLabel="Sort by status - down first"
                rowSpan={3}
                order={this.state.sortOrder}
                onChange={this.changeSorting}
              />
              <th colSpan="3">&nbsp;</th>
              <th colSpan="4" />
              <th colSpan="4" />
              <th colSpan="2">&nbsp;</th>
              {configured_health_checks ? (
                <th colSpan="3" className={styles["promo-header-cell"]}>
                  <span>
                    Available in <span>Angie PRO</span> only
                  </span>
                </th>
              ) : null}
            </tr>
          ) : null}
          <tr>
            {!envUtils.isDemoEnv() ? (
              <TableSortControl
                secondSortLabel="Sort by status - down first"
                order={this.state.sortOrder}
                onChange={this.changeSorting}
              />
            ) : null}

            {this.getSelectAllCheckbox(peers)}

            <th colSpan="3">Peer</th>
            <th colSpan="4">Connection</th>
            <th colSpan="4">Traffic</th>
            <th colSpan="2">Server checks</th>
            {configured_health_checks ? (
              <th colSpan="3">Health monitors</th>
            ) : null}
          </tr>
          <tr className={`${styles["right-align"]} ${styles["sub-header"]}`}>
            <th className={styles["left-align"]}>Name</th>
            <th>
              <span
                className={styles.hinted}
                {...tooltips.useTooltip("Total downtime", "hint")}
              >
                DT
              </span>
            </th>
            <th className={`${styles.bdr}`}>
              <span
                className={styles.hinted}
                {...tooltips.useTooltip("Weight", "hint")}
              >
                W
              </span>
            </th>
            <th>Total</th>
            <th>Conn/s</th>
            <th>Active</th>
            <th className={styles.bdr}>Limit</th>
            <th>Sent/s</th>
            <th>Rcvd/s</th>
            <th>Sent</th>
            <th className={styles.bdr}>Rcvd</th>
            <th>Fails</th>
            <th className={styles.bdr}>Unavail</th>
            {configured_health_checks
              ? [
                  <th key="checks">Checks</th>,
                  <th key="fails">Fails</th>,
                  <th key="last">Last</th>,
                ]
              : null}
          </tr>
        </thead>

        <tbody className={styles["right-align"]}>
          {peers.length === 0
            ? this.renderEmptyList()
            : peers.map((peer) => (
                <tr>
                  <td className={styles[peer.state]} />

                  {this.getCheckbox(peer)}

                  <td
                    className={`${styles["left-align"]} ${styles.bold} ${styles.address}`}
                  >
                    <span
                      className={styles["address-container"]}
                      {...tooltips.useTooltip(<PeerTooltip peer={peer} />)}
                    >
                      {peer.backup ? <span>b&nbsp;</span> : null}
                      {peer.server}
                    </span>

                    {this.state.editMode ? (
                      <span
                        className={styles["edit-peer"]}
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
                        "hint",
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
