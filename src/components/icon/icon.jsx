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
import styles from './style.css';

export default function Icon(props){
	let className = props.className || '';

	if (styles[props.type]) {
		className += `${ className ? ' ' : '' }${ styles[props.type] }`;
	}

	return (
		<span className={className} />
	);
}
