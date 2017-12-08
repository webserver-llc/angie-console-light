/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import { getDashboardUrl, openLogin, getAmplifyObjectId } from './../../amplify';
import { STORE } from './../../datastore/';
import styles from './style.css';

export default class AmplifyBtn extends React.Component {
	static onClick(evt) {
		evt.preventDefault();

		openLogin(STORE.nginx.ppid, () => {
			window.location.href = getDashboardUrl();
		});
	}

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return (
			<a
				href={getDashboardUrl()}
				target="_blank"
				styleName="amplify"
				title="NGINX Amplify"
				{... (getAmplifyObjectId() ? {} : {
					onClick: AmplifyBtn.onClick
				})}
			/>
		);
	}
}