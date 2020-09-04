/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export default function Icon(props){
	return (
		<span className={props.className} styleName={props.type} />
	);
};
