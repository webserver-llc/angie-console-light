/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export const defaultSN = 'loader';
export const graySN = 'gray-loader';

export default ({ gray, className }) => (
	<div className={className} styleName={gray ? graySN : defaultSN} />
);