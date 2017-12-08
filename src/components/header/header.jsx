/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import Navigation from './navigation.jsx';
import styles from './style.css';
/* eslint no-undef: 0 */

export default class Header extends React.Component {
	render() {
		return (<div styleName="header">
			<a styleName={this.props.hash === '#' ? 'logoactive' : 'logo'} href="#" />

			{
				this.props.navigation?
					<Navigation {...this.props} withAmplifyBtn={__ENV__ !== 'demo'} />
				: null
			}
		</div>);
	}
}

