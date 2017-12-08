/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export default class Header extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	render() {
		return <div styleName="footer">© NGINX, Inc. All rights reserved.</div>;
	}
};