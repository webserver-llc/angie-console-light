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

export default class Footer extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	render() {
		return <div className={ styles.footer }>© Angie, Inc. All rights reserved.</div>;
	}
};
