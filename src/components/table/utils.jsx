/**
 * Copyright 2022-present, Nginx, Inc.
 * Copyright 2022-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';

import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import styles from './style.css';

export const responsesTextWithTooltip = (text, codes, codeGroup) => {
  const codesArr = utils.getHTTPCodesArray(codes, codeGroup);

  return codesArr.length > 0
    ? (
      <span
        className={ styles.hinted }
        { ...tooltips.useTooltip(
          <div>
            {
              codesArr.map(({ code, value }) => (
                <div key={ code }>{ code }: { value }</div>
              ))
            }
          </div>,
          'hint'
        ) }
      >{ text }</span>
    )
    : text;
};

export default {
  responsesTextWithTooltip,
};
