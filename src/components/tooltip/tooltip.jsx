/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export default (props) => {
	return (<div styleName="tooltip bottom"
				style={{
					top: `${props.top}px`,
					left: `${props.left}px`
				}}
			>{ props.children }</div>);
}
