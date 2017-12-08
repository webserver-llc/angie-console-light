/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import Portal from 'preact-portal';

import styles from './style.css';

export default class Popup extends React.Component {
	componentDidMount() {
		document.documentElement.classList.add(styles['disable-scroll']);
	}

	componentWillUnmount() {
		document.documentElement.classList.remove(styles['disable-scroll']);
	}

	render() {
		return (<Portal into="body">
			<div styleName="fader">
				<div styleName="modal">
					<div styleName="popup" className={this.props.className}>
						{ this.props.children }
					</div>
				</div>
			</div>
		</Portal>);
	}
}