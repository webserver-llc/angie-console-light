/**
 * Copyright 2022-present, Nginx, Inc.
 * Copyright 2022-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';

import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import tooltip from '#/components/tooltip';
import styles from './style.css';

export const tableUtils = {
  responsesTextWithTooltip: (text, codes, codeGroup) => {
    const codesArr = utils.getHTTPCodesArray(codes, codeGroup);

    return tableUtils.tooltipRowsContent(
      text,
      codesArr.map(
        ({ code, value }) => ({
          id: code,
          label: code,
          value,
        })
      ),
      'hint'
    );
  },

  tooltipRowsContent: (text, items = [], position) =>
    items.length > 0
      ? (
        <span
          className={ styles.hinted }
          {
            ...tooltips.useTooltip(
              <div>
                {
                  items.map(({ id, label, value }) => (
                    <div
                      key={ id }
                      className={ tooltip.styles['list-row'] }
                    >
                      <div className={tooltip.styles['list-label']}>{ label }:</div>
                      <div className={tooltip.styles['list-space']} />
                      <div className={tooltip.styles['list-value']}>{ value }</div>
                    </div>
                  ))
                }
              </div>,
              position
            )
          }
        >{ text }</span>
      )
      : text,
};

export default tableUtils;
